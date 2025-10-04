"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LiveMediaPipeCameraProps {
  onAnalysisComplete: (analysis: any) => void
  exerciseType?: string
  isProviderMode?: boolean
}

export function LiveMediaPipeCamera({ onAnalysisComplete, exerciseType, isProviderMode = false }: LiveMediaPipeCameraProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [repCount, setRepCount] = useState(0)
  const [formScore, setFormScore] = useState(0)
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const poseRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Load MediaPipe dynamically
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        // @ts-ignore
        if (typeof window !== 'undefined' && !window.MediaPipeLoaded) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js'
          script.async = true
          script.onload = () => {
            // @ts-ignore
            window.MediaPipeLoaded = true
            setMediapipeLoaded(true)
            console.log('MediaPipe loaded successfully')
          }
          document.body.appendChild(script)
        } else {
          setMediapipeLoaded(true)
        }
      } catch (err) {
        console.error('Failed to load MediaPipe:', err)
        setError('Failed to load pose detection library')
      }
    }

    loadMediaPipe()
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          initMediaPipe()
        }
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    console.log('[STOP] Stopping camera and animation loop')
    
    // Stop animation loop FIRST
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Close pose
    if (poseRef.current) {
      poseRef.current.close()
      poseRef.current = null
    }
    
    setIsStreaming(false)
    setIsAnalyzing(false)
  }

  const initMediaPipe = async () => {
    try {
      console.log('[INIT] Starting MediaPipe initialization...')
      // @ts-ignore
      const { Pose } = window
      
      if (!Pose) {
        console.error('[INIT] Pose not found in window')
        setError('MediaPipe not loaded. Please refresh the page.')
        return
      }

      console.log('[INIT] Creating Pose instance...')
      const pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        }
      })

      console.log('[INIT] Setting Pose options...')
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      console.log('[INIT] Setting onResults callback...')
      pose.onResults(onPoseResults)
      
      poseRef.current = pose
      setIsAnalyzing(true)
      
      console.log('[INIT] Pose ready, no explicit initialize needed')
      
      console.log('[INIT] Starting frame processing...')
      // Start processing frames
      processFrame()
    } catch (err) {
      console.error('[INIT] MediaPipe init error:', err)
      setError(`Failed to initialize pose detection: ${err}`)
    }
  }

  const processFrame = async () => {
    if (!videoRef.current || !poseRef.current) {
      console.log('[PROCESS] Missing refs, stopping')
      return
    }

    try {
      await poseRef.current.send({ image: videoRef.current })
    } catch (err) {
      console.error('[PROCESS] Frame error:', err)
    }

    // IMPORTANT: Always continue looping
    animationFrameRef.current = requestAnimationFrame(processFrame)
  }

  const onPoseResults = (results: any) => {
    if (!results.poseLandmarks) {
      return
    }

    // Draw skeleton EVERY frame
    drawSkeleton(results.poseLandmarks)

    // Calculate form score
    const score = calculateFormScore(results.poseLandmarks)
    setFormScore(score)

    // Update analysis
    const newAnalysis = {
      timestamp: new Date().toISOString(),
      exerciseType: exerciseType || 'General',
      formScore: score,
      repCount: repCount,
      keypoints: results.poseLandmarks,
      feedback: generateFeedback(score)
    }

    setAnalysis(newAnalysis)
    onAnalysisComplete(newAnalysis)
  }

  const drawSkeleton = (landmarks: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !landmarks) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // IMPORTANT: Match canvas resolution to video actual size
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    // CRITICAL: Clear canvas EVERY frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Define skeleton connections
    const connections = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso
      [23, 24], // hips
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28], // right leg
    ]

    // Draw connections - THICKER AND BRIGHTER
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 8
    ctx.shadowColor = '#00FF00'
    ctx.shadowBlur = 5
    
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx]
      const end = landmarks[endIdx]
      
      if (start && end && start.visibility > 0.3 && end.visibility > 0.3) {
        ctx.beginPath()
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height)
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height)
        ctx.stroke()
      }
    })

    // Draw keypoints - BIGGER AND BRIGHTER
    ctx.shadowBlur = 10
    landmarks.forEach((point, index) => {
      if (point && point.visibility > 0.3) {
        ctx.beginPath()
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          12,
          0,
          2 * Math.PI
        )
        ctx.fillStyle = point.visibility > 0.7 ? '#FF0000' : '#FFFF00'
        ctx.shadowColor = point.visibility > 0.7 ? '#FF0000' : '#FFFF00'
        ctx.fill()
      }
    })
    
    ctx.shadowBlur = 0
  }

  const calculateFormScore = (landmarks: any[]): number => {
    if (!landmarks || landmarks.length < 20) return 0

    let score = 100
    
    // Check body alignment
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]

    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      // Shoulder alignment
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y)
      if (shoulderDiff > 0.05) score -= 10

      // Hip alignment
      const hipDiff = Math.abs(leftHip.y - rightHip.y)
      if (hipDiff > 0.05) score -= 10

      // Posture check
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2
      const avgHipY = (leftHip.y + rightHip.y) / 2
      const postureRatio = Math.abs(avgShoulderY - avgHipY)
      if (postureRatio < 0.2) score -= 15
    }

    return Math.max(60, Math.min(100, score))
  }

  const generateFeedback = (score: number): string => {
    if (score >= 90) return "Excellent form! Keep it up!"
    if (score >= 80) return "Good form. Minor adjustments needed."
    if (score >= 70) return "Form needs improvement. Focus on alignment."
    return "Pay attention to your posture and alignment."
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isProviderMode ? 'Patient Exercise Monitoring' : 'Live Pose Analysis'}
          </h3>
          <div className="flex gap-2">
            {!isStreaming ? (
              <Button 
                onClick={startCamera} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!mediapipeLoaded}
              >
                {mediapipeLoaded ? 'Start Camera' : 'Loading MediaPipe...'}
              </Button>
            ) : (
              <Button onClick={stopCamera} className="bg-red-600 hover:bg-red-700">
                Stop Camera
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-auto ${!isStreaming ? 'hidden' : 'block'}`}
            style={{ maxHeight: '600px' }}
          />
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-full pointer-events-none ${!isStreaming ? 'hidden' : 'block'}`}
            style={{ 
              zIndex: 10,
              opacity: 1,
              mixBlendMode: 'normal'
            }}
          />
          
          {!isStreaming && (
            <div className="w-full h-64 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">Click "Start Camera" to begin</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              🔴 LIVE ANALYSIS
            </div>
          )}
        </div>

        {/* Real-time Stats */}
        {analysis && isStreaming && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="text-sm font-medium opacity-90">Form Score</div>
              <div className="text-3xl font-bold">{formScore}%</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="text-sm font-medium opacity-90">Rep Count</div>
              <div className="text-3xl font-bold">{repCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="text-sm font-medium opacity-90">Status</div>
              <div className="text-lg font-bold">Analyzing</div>
            </div>
          </div>
        )}

        {/* Live Feedback */}
        {analysis && isStreaming && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="text-sm font-semibold text-yellow-900 mb-1">💡 Live Feedback:</div>
            <div className="text-yellow-800">{analysis.feedback}</div>
          </div>
        )}
      </Card>
    </div>
  )
}
