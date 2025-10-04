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
  
  // Rep counting state machine (Good-GYM approach)
  const [repState, setRepState] = useState<'up' | 'down' | null>(null)
  const [angleHistory, setAngleHistory] = useState<number[]>([])
  const lastRepTimeRef = useRef(0)
  const [currentAngle, setCurrentAngle] = useState(0)
  
  // Calibration for adaptive thresholds
  const [isCalibrating, setIsCalibrating] = useState(true)
  const [calibrationAngles, setCalibrationAngles] = useState<number[]>([])
  const [adaptiveThresholds, setAdaptiveThresholds] = useState<{down: number, up: number} | null>(null)
  const calibrationStartRef = useRef(0)
  
  // Voice feedback
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const lastVoiceFeedbackRef = useRef(0)
  const lastVoiceMessageRef = useRef('')
  
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

  // Helper: Calculate angle between 3 points
  const calculateAngle = (a: any, b: any, c: any): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180.0) angle = 360 - angle
    return angle
  }

  const onPoseResults = (results: any) => {
    if (!results.poseLandmarks) return

    const landmarks = results.poseLandmarks
    drawSkeleton(landmarks)

    // Calculate ALL joint angles
    let angles = {
      leftKnee: 0,
      rightKnee: 0,
      leftElbow: 0,
      rightElbow: 0,
      leftHip: 0,
      rightHip: 0,
      leftShoulder: 0,
      rightShoulder: 0
    }

    try {
      // Knee angles (hip-knee-ankle)
      angles.leftKnee = calculateAngle(landmarks[23], landmarks[25], landmarks[27])
      angles.rightKnee = calculateAngle(landmarks[24], landmarks[26], landmarks[28])
      
      // Elbow angles (shoulder-elbow-wrist)
      angles.leftElbow = calculateAngle(landmarks[11], landmarks[13], landmarks[15])
      angles.rightElbow = calculateAngle(landmarks[12], landmarks[14], landmarks[16])
      
      // Hip angles (shoulder-hip-knee)
      angles.leftHip = calculateAngle(landmarks[11], landmarks[23], landmarks[25])
      angles.rightHip = calculateAngle(landmarks[12], landmarks[24], landmarks[26])
      
      // Shoulder angles (hip-shoulder-elbow)
      angles.leftShoulder = calculateAngle(landmarks[23], landmarks[11], landmarks[13])
      angles.rightShoulder = calculateAngle(landmarks[24], landmarks[12], landmarks[14])
    } catch (e) {
      console.error('Angle calculation error:', e)
    }

    // Pick primary angle based on exercise
    let primaryAngle = 160
    const exerciseName = (exerciseType || 'general').toLowerCase()
    
    if (exerciseName.includes('squat') || exerciseName.includes('knee')) {
      primaryAngle = (angles.leftKnee + angles.rightKnee) / 2
    } else if (exerciseName.includes('push') || exerciseName.includes('arm')) {
      primaryAngle = (angles.leftElbow + angles.rightElbow) / 2
    } else {
      primaryAngle = (angles.leftKnee + angles.rightKnee) / 2
    }

    setCurrentAngle(Math.round(primaryAngle))

    // Update angle history with median filtering (Good-GYM approach)
    const newHistory = [...angleHistory, primaryAngle].slice(-5)
    setAngleHistory(newHistory)
    
    // Calculate smoothed angle with outlier removal
    let smoothAngle = primaryAngle
    if (newHistory.length >= 3) {
      const sortedAngles = [...newHistory].sort((a, b) => a - b)
      const median = sortedAngles[Math.floor(sortedAngles.length / 2)]
      const mean = newHistory.reduce((a, b) => a + b) / newHistory.length
      const stdDev = Math.sqrt(newHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / newHistory.length)
      
      // Filter outliers (> 2 std dev from median)
      const filtered = newHistory.filter(a => Math.abs(a - median) <= 2 * stdDev)
      smoothAngle = filtered.length > 0 ? filtered.reduce((a, b) => a + b) / filtered.length : primaryAngle
    }
    
    console.log(`📐 [ANGLES] Primary: ${Math.round(primaryAngle)}°, Smoothed: ${Math.round(smoothAngle)}°`)

    // REP COUNTING with FIXED adaptive thresholds (declare variables first)
    let currentRepCount = repCount
    let currentRepState = repState
    
    // CALIBRATION PHASE (Good-GYM approach: collect data first, then set thresholds)
    const now = Date.now()
    
    if (isCalibrating) {
      if (calibrationStartRef.current === 0) {
        calibrationStartRef.current = now
        console.log(`🎯 [CALIBRATION] Starting 3-second calibration... Move through your full range!`)
      }
      
      const calibrationTime = (now - calibrationStartRef.current) / 1000
      setCalibrationAngles(prev => [...prev, smoothAngle])
      
      if (calibrationTime >= 3.0 && calibrationAngles.length >= 10) {
        // Calculate adaptive thresholds from ALL collected data
        const minAngle = Math.min(...calibrationAngles)
        const maxAngle = Math.max(...calibrationAngles)
        const range = maxAngle - minAngle
        
        if (range > 20) {
          const downThreshold = minAngle + (range * 0.4)
          const upThreshold = minAngle + (range * 0.6)
          
          setAdaptiveThresholds({ down: downThreshold, up: upThreshold })
          setIsCalibrating(false)
          
          console.log(`✅ [CALIBRATION COMPLETE]`)
          console.log(`   Range: ${Math.round(minAngle)}° - ${Math.round(maxAngle)}° (${Math.round(range)}°)`)
          console.log(`   Thresholds: DOWN < ${Math.round(downThreshold)}°, UP > ${Math.round(upThreshold)}°`)
          console.log(`   Ready to count reps!`)
        } else {
          console.log(`⏳ [CALIBRATION] Range: ${Math.round(range)}° - keep moving! (need >20°)`)
        }
      } else {
        console.log(`⏳ [CALIBRATION] ${calibrationTime.toFixed(1)}s / 3.0s (${calibrationAngles.length} samples)`)
      }
    }
    
    if (!isCalibrating && adaptiveThresholds && newHistory.length >= 3) {
      const { down: downThreshold, up: upThreshold } = adaptiveThresholds
      const timeSinceLastRep = (now - lastRepTimeRef.current) / 1000

      console.log(`[COUNT] Angle: ${Math.round(smoothAngle)}°, State: ${repState}, Down<${Math.round(downThreshold)}°, Up>${Math.round(upThreshold)}°`)

      // Good-GYM state machine with voice feedback
      if (smoothAngle > upThreshold) {
        if (repState !== 'up') {
          currentRepState = 'up'
          setRepState('up')
          console.log(`⬆️ [STATE] UP (angle: ${Math.round(smoothAngle)}° > ${Math.round(upThreshold)}°)`)
        }
      } else if (smoothAngle < downThreshold) {
        if (repState === 'up' && timeSinceLastRep > 0.5) {
          // REP COUNTED!
          currentRepState = 'down'
          currentRepCount = repCount + 1
          setRepState('down')
          setRepCount(currentRepCount)
          lastRepTimeRef.current = now
          console.log(`🎉 [REP] #${currentRepCount} at ${Math.round(smoothAngle)}° < ${Math.round(downThreshold)}° (gap: ${timeSinceLastRep.toFixed(1)}s)`)
          
          // Voice feedback for rep
          speakFeedback(`${currentRepCount}`, 'high')
        } else if (repState === 'up') {
          console.log(`⏸️ [BLOCKED] Too soon! ${timeSinceLastRep.toFixed(1)}s < 0.5s`)
        } else {
          if (repState !== 'down') {
            currentRepState = 'down'
            setRepState('down')
            console.log(`⬇️ [STATE] DOWN (angle: ${Math.round(smoothAngle)}° < ${Math.round(downThreshold)}°)`)
          }
        }
      }
    }

    // Form score
    const score = calculateFormScore(landmarks)
    setFormScore(score)

    // Generate DETAILED feedback with SPECIFIC voice coaching
    let feedbackParts = []
    
    // Detailed posture analysis
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y)
    const hipTilt = Math.abs(leftHip.y - rightHip.y)
    
    // Exercise-specific REAL coaching
    if (exerciseName.includes('squat')) {
      // Depth coaching - SIMPLIFIED TRIGGERS
      if (primaryAngle < 90) {
        feedbackParts.push('💎 Perfect depth!')
        speakFeedback('Perfect depth')
      } else if (primaryAngle < 100) {
        feedbackParts.push('✅ Good depth')
      } else if (primaryAngle < 120) {
        feedbackParts.push('📏 Almost there')
        speakFeedback('Go lower')
      } else if (primaryAngle < 140) {
        feedbackParts.push('⚠️ Too high')
        speakFeedback('Break parallel')
      } else {
        feedbackParts.push('❌ Way too shallow')
        speakFeedback('Drop lower')
      }
      
      // Knee alignment - SPECIFIC coaching
      const kneeDiff = Math.abs(angles.leftKnee - angles.rightKnee)
      if (kneeDiff > 20) {
        feedbackParts.push('🚨 Knees very uneven!')
        speakFeedback('Push evenly through both feet', 'high')
      } else if (kneeDiff > 15) {
        feedbackParts.push('⚠️ Uneven knees')
        speakFeedback('Balance your weight')
      }
      
      // Posture check
      if (shoulderTilt > 0.08) {
        feedbackParts.push('🚨 Shoulder leaning!')
        speakFeedback('Level your shoulders', 'high')
      }
      
      // Hip positioning
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2
      const avgHipY = (leftHip.y + rightHip.y) / 2
      if (Math.abs(avgShoulderY - avgHipY) < 0.15) {
        feedbackParts.push('📐 Chest up!')
        speakFeedback('Keep chest up, shoulders back')
      }
      
    } else if (exerciseName.includes('push')) {
      // Push-up specific
      if (primaryAngle < 90) {
        feedbackParts.push('💪 Full ROM!')
      } else if (primaryAngle < 100) {
        feedbackParts.push('✅ Good depth')
      } else if (primaryAngle < 120) {
        feedbackParts.push('📏 Lower chest')
        if (currentRepState === 'down') speakFeedback('Chest to ground')
      } else {
        feedbackParts.push('❌ Too high')
        if (currentRepState === 'down') speakFeedback('Drop your chest lower')
      }
      
      const elbowDiff = Math.abs(angles.leftElbow - angles.rightElbow)
      if (elbowDiff > 15) {
        feedbackParts.push('⚠️ Uneven arms')
        speakFeedback('Press evenly')
      }
    } else {
      // General movement feedback
      feedbackParts.push(`${Math.round(primaryAngle)}° angle`)
    }

    // Form score with specific cues
    if (score < 70) {
      feedbackParts.push('❌ Form needs work')
    } else if (score < 80) {
      feedbackParts.push('⚠️ Watch form')
    } else if (score < 90) {
      feedbackParts.push('✅ Good form')
    } else {
      feedbackParts.push('🌟 Excellent!')
    }

    // State feedback
    if (currentRepState === 'up') feedbackParts.push('⬆️ UP')
    else if (currentRepState === 'down') feedbackParts.push('⬇️ DOWN')
    
    // Rep milestones with motivation
    if (currentRepCount > 0 && currentRepCount % 10 === 0 && currentRepState === 'up') {
      speakFeedback(`${currentRepCount} reps, you're crushing it!`, 'high')
    } else if (currentRepCount > 0 && currentRepCount % 5 === 0 && currentRepState === 'up') {
      speakFeedback(`${currentRepCount}, nice work`, 'high')
    }

    const newAnalysis = {
      timestamp: new Date().toISOString(),
      exerciseType: exerciseType || 'General',
      formScore: score,
      repCount: currentRepCount,  // Use LOCAL value, not state
      currentAngle: Math.round(primaryAngle),
      angles: angles,  // Include all angles
      repState: currentRepState,  // Use LOCAL value, not state
      keypoints: landmarks,
      feedback: feedbackParts.join(' • ')
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


  // Voice feedback function
  const speakFeedback = (message: string, priority: 'high' | 'normal' = 'normal') => {
    console.log(`[VOICE CALLED] "${message}", enabled: ${voiceEnabled}`)
    
    if (!voiceEnabled) {
      console.log('[VOICE BLOCKED] Voice disabled')
      return
    }
    
    const now = Date.now()
    const cooldown = priority === 'high' ? 1500 : 3000
    
    // Check cooldown first
    if (now - lastVoiceFeedbackRef.current < cooldown) {
      console.log(`[VOICE BLOCKED] Cooldown (${now - lastVoiceFeedbackRef.current}ms < ${cooldown}ms)`)
      return
    }
    
    // Only avoid EXACT same message within short time window (500ms)
    const shortWindow = 500
    if (lastVoiceMessageRef.current === message && (now - lastVoiceFeedbackRef.current < shortWindow)) {
      console.log('[VOICE BLOCKED] Same message too soon')
      return
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onstart = () => console.log(`🔊 [SPEAKING] "${message}"`)
      utterance.onerror = (e) => console.error('[VOICE ERROR]', e)
      
      window.speechSynthesis.speak(utterance)
      lastVoiceFeedbackRef.current = now
      lastVoiceMessageRef.current = message
      
      console.log(`✅ [VOICE QUEUED] "${message}" (priority: ${priority})`)
    } catch (err) {
      console.error('[VOICE ERROR]', err)
    }
  }
  
  // Test voice function
  const testVoice = () => {
    console.log('[TEST] Testing voice...')
    speakFeedback('Voice test working', 'high')
  }

  useEffect(() => {
    return () => {
      stopCamera()
      window.speechSynthesis.cancel()
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
              <>
                <Button onClick={stopCamera} className="bg-red-600 hover:bg-red-700">
                  Stop Camera
                </Button>
                <Button 
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={voiceEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 hover:bg-gray-500'}
                >
                  {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                </Button>
                <Button 
                  onClick={testVoice}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  🎤 Test Voice
                </Button>
              </>
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
          <>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg text-white">
                <div className="text-xs font-medium opacity-90">Form Score</div>
                <div className="text-2xl font-bold">{formScore}%</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg text-white">
                <div className="text-xs font-medium opacity-90">Reps</div>
                <div className="text-2xl font-bold">{repCount}</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg text-white">
                <div className="text-xs font-medium opacity-90">Primary Angle</div>
                <div className="text-2xl font-bold">{currentAngle}°</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg text-white">
                <div className="text-xs font-medium opacity-90">State</div>
                <div className="text-xl font-bold">{repState === 'up' ? '⬆️ UP' : repState === 'down' ? '⬇️ DOWN' : '—'}</div>
              </div>
            </div>

            {/* All Joint Angles Display */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">L Knee</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.leftKnee) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">R Knee</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.rightKnee) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">L Elbow</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.leftElbow) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">R Elbow</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.rightElbow) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">L Hip</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.leftHip) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">R Hip</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.rightHip) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">L Shoulder</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.leftShoulder) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">R Shoulder</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.rightShoulder) : 0}°</div>
              </div>
            </div>
          </>
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
