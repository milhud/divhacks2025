"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as tf from '@tensorflow/tfjs'
import * as posenet from '@tensorflow-models/posenet'
import { 
  EXERCISE_TEMPLATES, 
  scorePoseAgainstTemplate, 
  ExerciseTemplate,
  Pose,
  POSE_KEYPOINTS 
} from '@/lib/exercise-templates'
import { getAudioFeedback } from '@/lib/audio-feedback'

interface PoseNetCameraProps {
  onAnalysisComplete?: (analysis: any) => void
  isProviderMode?: boolean
  exerciseType?: string
}

export function PoseNetCamera({ 
  onAnalysisComplete, 
  isProviderMode = false, 
  exerciseType = "squat" 
}: PoseNetCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [poseNet, setPoseNet] = useState<posenet.PoseNet | null>(null)
  const [currentPose, setCurrentPose] = useState<Pose | null>(null)
  const [liveScore, setLiveScore] = useState<number>(0)
  const [repCount, setRepCount] = useState(0)
  const [feedback, setFeedback] = useState<string[]>([])
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [lastScoreTime, setLastScoreTime] = useState(0)
  
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastPoseRef = useRef<Pose | null>(null)
  const repDetectionRef = useRef({ inBottomPosition: false, repStarted: false })

  // Load PoseNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true)
        await tf.ready()
        
        const net = await posenet.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 640, height: 480 },
          multiplier: 0.75,
        })
        
        setPoseNet(net)
        setIsModelLoading(false)
      } catch (err) {
        console.error('Failed to load PoseNet:', err)
        setError('Failed to load AI model. Please refresh and try again.')
        setIsModelLoading(false)
      }
    }

    loadModel()
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
        
        // Start pose detection loop
        if (poseNet) {
          detectPoses()
          // Announce start
          const audioFeedback = getAudioFeedback()
          audioFeedback.setEnabled(audioEnabled)
          audioFeedback.announceStart(exerciseType)
        }
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    setIsStreaming(false)
    setIsAnalyzing(false)
    setCurrentPose(null)
    setLiveScore(0)
    setFeedback([])
    
    // Announce stop
    const audioFeedback = getAudioFeedback()
    audioFeedback.announceStop()
  }

  const detectPoses = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !poseNet || !isStreaming) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectPoses)
      return
    }

    try {
      setIsAnalyzing(true)
      
      // Detect pose
      const pose = await poseNet.estimateSinglePose(video, {
        flipHorizontal: true,
        decodingMethod: 'single-person'
      })

      if (pose && pose.score > 0.3) {
        setCurrentPose(pose)
        lastPoseRef.current = pose
        
        // Draw pose on canvas
        drawPose(pose, canvas, video)
        
        // Analyze pose against exercise template
        const template = EXERCISE_TEMPLATES[exerciseType.toLowerCase()]
        if (template) {
          const analysis = scorePoseAgainstTemplate(pose, template)
          setLiveScore(analysis.totalScore)
          setFeedback(analysis.feedback.slice(0, 3)) // Show top 3 feedback items
          
          // Rep counting logic (simplified for squat)
          if (exerciseType.toLowerCase() === 'squat') {
            detectSquatRep(pose)
          }
          
          // Audio feedback (throttled to avoid spam)
          const now = Date.now()
          if (now - lastScoreTime > 2000) { // Every 2 seconds max
            const audioFeedback = getAudioFeedback()
            audioFeedback.setEnabled(audioEnabled)
            audioFeedback.provideFeedback(
              analysis.totalScore,
              analysis.feedback,
              repCount,
              exerciseType
            )
            setLastScoreTime(now)
          }
          
          // Call parent callback with analysis
          onAnalysisComplete?.({
            formScore: Math.round(analysis.totalScore),
            repCount,
            feedback: analysis.feedback.join(', '),
            pose: pose,
            angleScores: analysis.angleScores
          })
        }
      }
      
      setIsAnalyzing(false)
    } catch (error) {
      console.error('Pose detection error:', error)
      setIsAnalyzing(false)
    }
    
    // Continue the loop
    animationRef.current = requestAnimationFrame(detectPoses)
  }, [poseNet, isStreaming, exerciseType, repCount, onAnalysisComplete])

  const detectSquatRep = (pose: Pose) => {
    // Simple rep detection based on hip height
    const leftHip = pose.keypoints[POSE_KEYPOINTS.leftHip]
    const rightHip = pose.keypoints[POSE_KEYPOINTS.rightHip]
    const leftKnee = pose.keypoints[POSE_KEYPOINTS.leftKnee]
    const rightKnee = pose.keypoints[POSE_KEYPOINTS.rightKnee]
    
    if (leftHip && rightHip && leftKnee && rightKnee) {
      const avgHipY = (leftHip.y + rightHip.y) / 2
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2
      const hipKneeDistance = Math.abs(avgHipY - avgKneeY)
      
      // Detect bottom position (hips close to knees)
      const isInBottomPosition = hipKneeDistance < 80
      
      if (isInBottomPosition && !repDetectionRef.current.inBottomPosition) {
        repDetectionRef.current.inBottomPosition = true
        repDetectionRef.current.repStarted = true
      } else if (!isInBottomPosition && repDetectionRef.current.inBottomPosition && repDetectionRef.current.repStarted) {
        // Rep completed
        setRepCount(prev => prev + 1)
        repDetectionRef.current.inBottomPosition = false
        repDetectionRef.current.repStarted = false
      }
    }
  }

  const drawPose = (pose: Pose, canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        ctx.beginPath()
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = '#00ff00'
        ctx.fill()
      }
    })

    // Draw skeleton
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.5)
    adjacentKeyPoints.forEach((keypoints: any) => {
      ctx.beginPath()
      ctx.moveTo(keypoints[0].x, keypoints[0].y)
      ctx.lineTo(keypoints[1].x, keypoints[1].y)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#00ff00'
      ctx.stroke()
    })
  }

  const resetSession = () => {
    setRepCount(0)
    setLiveScore(0)
    setFeedback([])
    repDetectionRef.current = { inBottomPosition: false, repStarted: false }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-50 to-green-100 border-green-200'
    if (score >= 60) return 'from-yellow-50 to-yellow-100 border-yellow-200'
    return 'from-red-50 to-red-100 border-red-200'
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isProviderMode ? '🏥 AI Pose Analysis' : '🤖 Live Form Analysis'}
          </h3>
          <div className="flex gap-2">
            {!isStreaming ? (
              <Button 
                onClick={startCamera} 
                disabled={isModelLoading || !poseNet}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
              >
                {isModelLoading ? '🔄 Loading AI...' : '🎥 Start Analysis'}
              </Button>
            ) : (
              <Button onClick={stopCamera} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg">
                ⏹️ Stop Analysis
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 rounded-xl shadow-md">
            ⚠️ {error}
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-64 md:h-96 bg-gray-900 rounded-xl shadow-lg ${!isStreaming ? 'hidden' : ''}`}
          />
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-64 md:h-96 rounded-xl ${!isStreaming ? 'hidden' : ''}`}
            style={{ pointerEvents: 'none' }}
          />
          
          {!isStreaming && (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl flex items-center justify-center shadow-inner">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-muted-foreground font-medium">
                  {isModelLoading ? 'Loading AI Model...' : 'Click "Start Analysis" to begin'}
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
              🤖 AI Analyzing...
            </div>
          )}

          {/* Live Score Display */}
          {isStreaming && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl">
              <div className="text-xs font-bold mb-1">LIVE SCORE</div>
              <div className={`text-2xl font-black ${getScoreColor(liveScore)}`}>
                {Math.round(liveScore)}/100
              </div>
            </div>
          )}
        </div>

        {/* Exercise Controls */}
        {isStreaming && (
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Button onClick={resetSession} className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg">
              🔄 Reset Session
            </Button>
            
            <Button 
              onClick={() => {
                setAudioEnabled(!audioEnabled)
                const audioFeedback = getAudioFeedback()
                audioFeedback.setEnabled(!audioEnabled)
              }}
              className={`${audioEnabled 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } text-white shadow-lg`}
            >
              {audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
            </Button>
            
            <div className="flex items-center gap-3 bg-gradient-to-r from-muted/50 to-muted/30 px-4 py-2 rounded-xl shadow-md">
              <label className="text-sm font-semibold text-foreground">Exercise:</label>
              <select 
                value={exerciseType}
                onChange={(e) => {
                  // This would need to be passed up to parent component
                  console.log('Exercise changed to:', e.target.value)
                }}
                className="bg-transparent text-sm font-bold text-primary"
              >
                <option value="squat">Squat</option>
                <option value="pushup">Push-up</option>
                <option value="lunge">Lunge</option>
              </select>
            </div>
          </div>
        )}

        {/* Real-time Analysis Display */}
        {isStreaming && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`bg-gradient-to-br ${getScoreGradient(liveScore)} p-4 rounded-xl shadow-md border-2`}>
              <div className="text-sm font-bold mb-1">📊 Form Score</div>
              <div className={`text-3xl font-black ${getScoreColor(liveScore)}`}>
                {Math.round(liveScore)}/100
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-md border-2 border-blue-200">
              <div className="text-sm font-bold text-blue-800 mb-1">🔢 Rep Count</div>
              <div className="text-3xl font-black text-blue-600">{repCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-md border-2 border-purple-200">
              <div className="text-sm font-bold text-purple-800 mb-1">🎯 Exercise</div>
              <div className="text-lg font-black text-purple-600 capitalize">{exerciseType}</div>
            </div>
          </div>
        )}

        {/* Live Feedback */}
        {feedback.length > 0 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-md">
            <div className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
              🎯 <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Live Feedback:</span>
            </div>
            <ul className="space-y-1">
              {feedback.map((item, index) => (
                <li key={index} className="text-yellow-700 font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}
