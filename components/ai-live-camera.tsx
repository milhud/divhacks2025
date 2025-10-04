"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface AILiveCameraProps {
  onAnalysisComplete: (analysis: any) => void
  exerciseType?: string
  isProviderMode?: boolean
  showExerciseSelector?: boolean
}

interface JointAngle {
  value: number
  confidence: number
  is_valid: boolean
}

interface Compensation {
  type: string
  description: string
  severity: 'mild' | 'moderate' | 'severe'
  value: number
  threshold: number
  recommendation: string
}

interface AIAnalysis {
  timestamp: string
  exercise_type: string
  overall_score: number
  form_quality: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous'
  confidence: number
  joint_angles: Record<string, JointAngle>
  compensations: Compensation[]
  feedback: string[]
  warnings: string[]
  recommendations: string[]
}

export function AILiveCamera({ onAnalysisComplete, exerciseType, isProviderMode = false, showExerciseSelector = true }: AILiveCameraProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [repCount, setRepCount] = useState(0)
  const [formScore, setFormScore] = useState(0)
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(exerciseType || 'squat')
  
  // AI Analysis state
  // Removed AI analysis state - using simplified detection
  // Removed AI analysis state - using simplified detection
  
  // Rep counting state machine
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
    setIsAiAnalyzing(false)
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
        modelComplexity: 1,  // Use 1 for better performance
        smoothLandmarks: false,  // Disable smoothing for more responsive tracking
        enableSegmentation: false,  // Disable segmentation for better performance
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,  // Lower threshold for better detection
        minTrackingConfidence: 0.5   // Lower threshold for better tracking
      })

      console.log('[INIT] Setting onResults callback...')
      pose.onResults(onPoseResults)
      
      poseRef.current = pose
      setIsAnalyzing(true)
      
      console.log('[INIT] Starting frame processing...')
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

  // Simplified - no AI analysis for now
  const sendToAIAnalysis = async (frame: HTMLVideoElement) => {
    // Disabled AI analysis to prevent errors
    return
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
      rightShoulder: 0,
      leftAnkle: 0,
      rightAnkle: 0
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
      
      // Ankle angles (knee-ankle-heel) - if available
      if (landmarks[29] && landmarks[30]) {
        angles.leftAnkle = calculateAngle(landmarks[25], landmarks[27], landmarks[29])
        angles.rightAnkle = calculateAngle(landmarks[26], landmarks[28], landmarks[30])
      }
    } catch (e) {
      console.error('Angle calculation error:', e)
    }

    // Pick primary angle based on selected exercise
    let primaryAngle = 160
    const exerciseName = selectedExercise.toLowerCase()
    
    if (exerciseName === 'squat') {
      // For squats, use average knee angle
      primaryAngle = (angles.leftKnee + angles.rightKnee) / 2
    } else if (exerciseName === 'bicep_curl') {
      // For bicep curls, use RIGHT elbow angle specifically
      primaryAngle = angles.rightElbow
    } else if (exerciseName.includes('push') || exerciseName.includes('arm')) {
      primaryAngle = (angles.leftElbow + angles.rightElbow) / 2
    } else {
      primaryAngle = (angles.leftKnee + angles.rightKnee) / 2
    }

    setCurrentAngle(Math.round(primaryAngle))

    // Update angle history with median filtering
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
    
    // Reduced logging - only log when significant changes

    // REP COUNTING with adaptive thresholds
    let currentRepCount = repCount
    let currentRepState = repState
    
    // SIMPLE CALIBRATION - just get a baseline
    const now = Date.now()
    
    if (isCalibrating) {
      if (calibrationStartRef.current === 0) {
        calibrationStartRef.current = now
        console.log(`🎯 [CALIBRATION] Starting 2-second calibration... Stand normally!`)
      }
      
      const calibrationTime = (now - calibrationStartRef.current) / 1000
      setCalibrationAngles(prev => [...prev, primaryAngle])
      
      if (calibrationTime >= 2.0 && calibrationAngles.length >= 5) {
        // For bicep curls, use right elbow angle specifically
        let baseline
        if (exerciseName === 'bicep_curl') {
          // Use right elbow angle as baseline for bicep curls
          baseline = angles.rightElbow
          console.log(`🎯 [BICEP CALIBRATION] Right elbow baseline: ${Math.round(baseline)}°`)
          console.log(`🎯 [BICEP CALIBRATION] Ready! Contract your right elbow to count reps.`)
          console.log(`🎯 [BICEP CALIBRATION] Will count when elbow < ${Math.round(baseline - 30)}°`)
        } else {
          // Use average for other exercises
          const recentAngles = calibrationAngles.slice(-5)
          baseline = recentAngles.reduce((a, b) => a + b) / recentAngles.length
        }
        
        setAdaptiveThresholds({ down: baseline, up: baseline })
        setIsCalibrating(false)
        
        console.log(`✅ [CALIBRATION COMPLETE]`)
        console.log(`   Baseline: ${Math.round(baseline)}°`)
        console.log(`   Ready to count reps!`)
      } else {
        console.log(`⏳ [CALIBRATION] ${calibrationTime.toFixed(1)}s / 2.0s`)
      }
    }
    
    // ULTRA SIMPLE REP COUNTING - just track big movements
    if (!isCalibrating && adaptiveThresholds) {
      const threshold = adaptiveThresholds.down
      const timeSinceLastRep = (now - lastRepTimeRef.current) / 1000
      const angleChange = Math.abs(primaryAngle - threshold)

      console.log(`[COUNT] Angle: ${Math.round(primaryAngle)}°, Change: ${Math.round(angleChange)}°, State: ${repState}`)

      // Look for significant movement (at least 20 degrees from baseline)
      if (angleChange > 20) {
        if (exerciseName === 'squat') {
          // For squats: count when you go down significantly (squatting)
          if (primaryAngle < threshold - 20) {
            if (repState !== 'down' && timeSinceLastRep > 0.5) {
              // REP COUNTED! (went down to squat)
              currentRepState = 'down'
              currentRepCount = repCount + 1
              setRepState('down')
              setRepCount(currentRepCount)
              lastRepTimeRef.current = now
              console.log(`🎉 [SQUAT REP] #${currentRepCount} - squatted down! (angle: ${Math.round(primaryAngle)}°)`)
              
              // Voice feedback for rep
              speakFeedback(`${currentRepCount}`, 'high')
            }
          } else if (primaryAngle > threshold + 10) {
            // Standing up - reset state
            if (repState === 'down') {
              currentRepState = 'up'
              setRepState('up')
              console.log(`⬆️ [SQUAT] Standing up (angle: ${Math.round(primaryAngle)}°)`)
            }
          }
        } else if (exerciseName === 'bicep_curl') {
          // BICEP CURL: Reset logic only (rep counting moved to after feedback generation)
          const rightElbowAngle = angles.rightElbow
          
          console.log(`💪 [BICEP] Elbow: ${Math.round(rightElbowAngle)}°, Baseline: ${Math.round(threshold)}°`)
          
          // Reset when elbow extends back up
          if (rightElbowAngle > 100) {
            if (repState === 'down') {
              currentRepState = 'up'
              setRepState('up')
              console.log(`⬆️ [BICEP] Reset - Elbow: ${Math.round(rightElbowAngle)}°`)
            }
          }
        }
      }
    }

    // Form score from basic analysis
    const score = calculateFormScore(landmarks)
    setFormScore(score)

    // AI analysis disabled for now - using simplified detection

    // Generate basic feedback only
    const feedbackParts = generateBasicFeedback(angles, exerciseName, primaryAngle, currentRepState)

    // Check for bicep curl perfect contraction AFTER feedback is generated
    if (exerciseName === 'bicep_curl' && feedbackParts.includes('💪 Perfect right arm contraction!')) {
      if (repState !== 'down' && timeSinceLastRep > 0.5) {
        // REP COUNTED! (Perfect contraction detected)
        currentRepCount = repCount + 1
        currentRepState = 'down'
        setRepState('down')
        setRepCount(currentRepCount)
        lastRepTimeRef.current = now
        console.log(`🎉 [BICEP REP] #${currentRepCount} - Perfect contraction detected!`)
        speakFeedback(`${currentRepCount}`, 'high')
      }
    }

    const newAnalysis = {
      timestamp: new Date().toISOString(),
      exerciseType: selectedExercise === 'squat' ? 'Squat' : selectedExercise === 'bicep_curl' ? 'Bicep Curl' : 'General',
      formScore: score,
      repCount: currentRepCount,
      currentAngle: Math.round(primaryAngle),
      angles: angles,
      repState: currentRepState,
      keypoints: landmarks,
      feedback: feedbackParts.join(' • '),
      // AI analysis removed - using simplified detection
    }

    setAnalysis(newAnalysis)
    onAnalysisComplete(newAnalysis)
  }

  const generateBasicFeedback = (angles: any, exerciseName: string, primaryAngle: number, repState: string | null) => {
    const feedbackParts = []
    
    // Exercise-specific feedback
    if (exerciseName === 'squat') {
      if (primaryAngle < 90) {
        feedbackParts.push('💎 Perfect depth!')
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
      
      // Knee alignment
      const kneeDiff = Math.abs(angles.leftKnee - angles.rightKnee)
      if (kneeDiff > 20) {
        feedbackParts.push('🚨 Knees very uneven!')
        speakFeedback('Push evenly through both feet', 'high')
      } else if (kneeDiff > 15) {
        feedbackParts.push('⚠️ Uneven knees')
        speakFeedback('Balance your weight')
      }
    } else if (exerciseName === 'bicep_curl') {
      // Bicep curl specific feedback - focus on right arm
      const rightElbowAngle = angles.rightElbow
      const rightShoulderAngle = angles.rightShoulder
      
      if (rightElbowAngle < 50) {
        feedbackParts.push('💪 Perfect right arm contraction!')
      } else if (rightElbowAngle < 70) {
        feedbackParts.push('✅ Good right arm squeeze')
      } else if (rightElbowAngle < 100) {
        feedbackParts.push('📏 Squeeze right arm harder')
        speakFeedback('Squeeze your right bicep')
      } else if (rightElbowAngle < 130) {
        feedbackParts.push('⚠️ Incomplete right arm range')
        speakFeedback('Full right arm contraction needed')
      } else {
        feedbackParts.push('❌ Right arm too extended')
        speakFeedback('Contract your right bicep')
      }
      
      // Right shoulder stability check
      const shoulderMovement = Math.abs(rightShoulderAngle - (analysis?.angles?.rightShoulder || rightShoulderAngle))
      if (shoulderMovement > 15) {
        feedbackParts.push('⚠️ Right shoulder moving')
        speakFeedback('Keep right shoulder still')
      }
      
      // Check for right arm swinging
      if (angleHistory.length >= 3) {
        const recentAngles = angleHistory.slice(-3)
        const angleVariance = Math.max(...recentAngles) - Math.min(...recentAngles)
        if (angleVariance > 30) {
          feedbackParts.push('⚠️ Control right arm movement')
          speakFeedback('Stop swinging right arm')
        }
      }
    } else if (exerciseName.includes('push')) {
      if (primaryAngle < 90) {
        feedbackParts.push('💪 Full ROM!')
      } else if (primaryAngle < 100) {
        feedbackParts.push('✅ Good depth')
      } else if (primaryAngle < 120) {
        feedbackParts.push('📏 Lower chest')
        if (repState === 'down') speakFeedback('Chest to ground')
      } else {
        feedbackParts.push('❌ Too high')
        if (repState === 'down') speakFeedback('Drop your chest lower')
      }
      
      const elbowDiff = Math.abs(angles.leftElbow - angles.rightElbow)
      if (elbowDiff > 15) {
        feedbackParts.push('⚠️ Uneven arms')
        speakFeedback('Press evenly')
      }
    } else {
      feedbackParts.push(`${Math.round(primaryAngle)}° angle`)
    }

    // Form score with specific cues
    const score = calculateFormScore([])
    if (score < 70) {
      feedbackParts.push('❌ Form needs work')
    } else if (score < 80) {
      feedbackParts.push('⚠️ Watch form')
    } else if (score < 90) {
      feedbackParts.push('✅ Good form')
    } else {
      feedbackParts.push('🌟 Excellent!')
    }

    return feedbackParts
  }

  const drawSkeleton = (landmarks: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !landmarks) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Match canvas resolution to video actual size
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    // Clear canvas EVERY frame
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

    // Draw connections - MUCH THICKER AND BRIGHTER
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 12
    ctx.shadowColor = '#00FF00'
    ctx.shadowBlur = 8
    
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx]
      const end = landmarks[endIdx]
      
      if (start && end && start.visibility > 0.2 && end.visibility > 0.2) {
        ctx.beginPath()
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height)
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height)
        ctx.stroke()
      }
    })

    // Draw keypoints - MUCH BIGGER AND BRIGHTER
    ctx.shadowBlur = 15
    landmarks.forEach((point, index) => {
      if (point && point.visibility > 0.2) {
        ctx.beginPath()
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          20,  // Much bigger dots
          0,
          2 * Math.PI
        )
        ctx.fillStyle = point.visibility > 0.6 ? '#FF0000' : '#FFFF00'
        ctx.shadowColor = point.visibility > 0.6 ? '#FF0000' : '#FFFF00'
        ctx.fill()
        
        // Add number labels for key joints
        if ([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)) {
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${index}`, point.x * canvas.width, point.y * canvas.height - 25)
        }
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
            {isProviderMode ? 'AI-Powered Patient Monitoring' : 'AI Live Form Analysis'}
          </h3>
          <div className="flex gap-2">
            {!isStreaming ? (
              <Button 
                onClick={startCamera} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!mediapipeLoaded}
              >
                {mediapipeLoaded ? 'Start AI Analysis' : 'Loading AI...'}
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} className="bg-red-600 hover:bg-red-700">
                  Stop Analysis
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
                <Button 
                  onClick={() => {
                    setRepCount(0)
                    setRepState(null)
                    setIsCalibrating(true)
                    setCalibrationAngles([])
                    calibrationStartRef.current = 0
                    lastRepTimeRef.current = 0
                    console.log('🔄 [RESET] Rep count and calibration reset')
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  🔄 Reset
                </Button>
                <Button 
                  onClick={() => {
                    const newCount = repCount + 1
                    setRepCount(newCount)
                    speakFeedback(`${newCount}`, 'high')
                    console.log(`🧪 [TEST] Manual rep count: ${newCount}`)
                  }}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  🧪 Test Rep
                </Button>
                <Button 
                  onClick={() => {
                    console.log(`🔍 [DEBUG] Current angles:`, analysis?.angles)
                    console.log(`🔍 [DEBUG] Current angle: ${currentAngle}°`)
                    console.log(`🔍 [DEBUG] Threshold: ${adaptiveThresholds?.down}°`)
                    console.log(`🔍 [DEBUG] Rep state: ${repState}`)
                    console.log(`🔍 [DEBUG] Calibrating: ${isCalibrating}`)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔍 Debug
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Exercise Selection Dropdown */}
        {showExerciseSelector && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exercise:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedExercise('squat')
                  // Reset calibration when switching exercises
                  setIsCalibrating(true)
                  setCalibrationAngles([])
                  calibrationStartRef.current = 0
                  setRepCount(0)
                  setRepState(null)
                  lastRepTimeRef.current = 0
                  console.log('🔄 [EXERCISE] Switched to Squat - resetting calibration')
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedExercise === 'squat'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                🏋️ Squat
              </button>
              <button
                onClick={() => {
                  console.log('🔄 [EXERCISE] Switching to Bicep Curl...')
                  setSelectedExercise('bicep_curl')
                  // Reset calibration when switching exercises
                  setIsCalibrating(true)
                  setCalibrationAngles([])
                  calibrationStartRef.current = 0
                  setRepCount(0)
                  setRepState(null)
                  lastRepTimeRef.current = 0
                  setAdaptiveThresholds(null)
                  console.log('✅ [EXERCISE] Switched to Bicep Curl - resetting calibration')
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedExercise === 'bicep_curl'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                💪 Bicep Curl
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {selectedExercise === 'squat' && 'Tracks knee angles and depth for proper squat form'}
              {selectedExercise === 'bicep_curl' && 'Tracks elbow angles and arm stability for bicep curls'}
            </div>
            
            {/* Debug Info */}
            {isStreaming && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <div>Exercise: {selectedExercise}</div>
                <div>Calibrating: {isCalibrating ? 'Yes' : 'No'}</div>
                {adaptiveThresholds && (
                  <>
                    <div>Threshold: {Math.round(adaptiveThresholds.down)}°</div>
                    <div>Current: {Math.round(currentAngle)}°</div>
                    {selectedExercise === 'bicep_curl' && (
                      <>
                        <div>R Elbow: {Math.round(analysis?.angles?.rightElbow || 0)}°</div>
                        <div>Need: &lt;50° (Perfect)</div>
                        <div>Status: {(analysis?.angles?.rightElbow || 0) < 50 ? 'Perfect!' : 'Keep going'}</div>
                      </>
                    )}
                    <div>State: {repState || 'None'}</div>
                    <div>Reps: {repCount}</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

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
                <p className="text-gray-400">Click "Start AI Analysis" to begin</p>
              </div>
            </div>
          )}

          {/* AI analysis indicator removed - using simplified detection */}

          {/* AI processing indicator removed - using simplified detection */}

          {/* Rep Detection Indicator */}
          {repCount > 0 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-bounce">
              🎉 REP #{repCount}!
            </div>
          )}
        </div>

        {/* AI analysis display removed - using simplified detection */}

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
                <div className="text-4xl font-bold animate-pulse">{repCount}</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg text-white">
                <div className="text-xs font-medium opacity-90">Primary Angle</div>
                <div className="text-2xl font-bold">{currentAngle}°</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg text-white">
                <div className="text-xs font-medium opacity-90">
                  {selectedExercise === 'squat' ? 'Squat State' : selectedExercise === 'bicep_curl' ? 'Curl State' : 'State'}
                </div>
                <div className="text-xl font-bold">
                  {selectedExercise === 'squat' 
                    ? (repState === 'up' ? '⬆️ STANDING' : repState === 'down' ? '⬇️ SQUATTING' : '—')
                    : selectedExercise === 'bicep_curl'
                    ? (repState === 'up' ? '⬆️ EXTENDED' : repState === 'down' ? '⬇️ CONTRACTED' : '—')
                    : (repState === 'up' ? '⬆️ UP' : repState === 'down' ? '⬇️ DOWN' : '—')
                  }
                </div>
              </div>
            </div>

            {/* All Joint Angles Display */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
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
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">L Ankle</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.leftAnkle) : 0}°</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">R Ankle</div>
                <div className="text-lg font-bold text-gray-900">{analysis.angles ? Math.round(analysis.angles.rightAnkle) : 0}°</div>
              </div>
            </div>
          </>
        )}

        {/* Live Feedback */}
        {analysis && isStreaming && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="text-sm font-semibold text-yellow-900 mb-1">🤖 AI Live Feedback:</div>
            <div className="text-yellow-800">{analysis.feedback}</div>
          </div>
        )}
      </Card>
    </div>
  )
}
