"use client"

import { useEffect, useRef, useState } from 'react'

export default function TestCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Click Start')
  const [poseLoaded, setPoseLoaded] = useState(false)
  const poseRef = useRef<any>(null)

  useEffect(() => {
    // Load MediaPipe
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js'
    script.onload = () => {
      console.log('MediaPipe loaded!')
      setPoseLoaded(true)
      setStatus('MediaPipe loaded - click Start Camera')
    }
    script.onerror = () => {
      console.error('Failed to load MediaPipe')
      setStatus('ERROR: MediaPipe failed to load')
    }
    document.body.appendChild(script)
  }, [])

  const startCamera = async () => {
    try {
      setStatus('Requesting camera...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStatus('Camera started! Waiting for video...')
        
        videoRef.current.onloadedmetadata = async () => {
          setStatus('Video loaded! Initializing pose...')
          
          // @ts-ignore
          const { Pose } = window
          
          if (!Pose) {
            setStatus('ERROR: Pose not found in window')
            return
          }

          const pose = new Pose({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
          })

          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          })

          pose.onResults((results: any) => {
            if (!results.poseLandmarks) {
              setStatus('No pose detected')
              return
            }

            setStatus(`✅ POSE DETECTED! ${results.poseLandmarks.length} landmarks`)
            drawPose(results.poseLandmarks)
          })

          poseRef.current = pose
          setStatus('Pose initialized! Processing frames...')
          processFrame()
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setStatus(`ERROR: ${err}`)
    }
  }

  const processFrame = async () => {
    if (!videoRef.current || !poseRef.current) return

    try {
      await poseRef.current.send({ image: videoRef.current })
    } catch (err) {
      console.error('Frame error:', err)
    }

    requestAnimationFrame(processFrame)
  }

  const drawPose = (landmarks: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw BIG GREEN CIRCLES on every landmark
    landmarks.forEach((lm, i) => {
      ctx.beginPath()
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 10, 0, 2 * Math.PI)
      ctx.fillStyle = '#00FF00'
      ctx.fill()
      
      // Draw landmark number
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '12px Arial'
      ctx.fillText(`${i}`, lm.x * canvas.width + 12, lm.y * canvas.height)
    })

    // Draw skeleton connections
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28]
    ]

    ctx.strokeStyle = '#FF0000'
    ctx.lineWidth = 5
    connections.forEach(([a, b]) => {
      const start = landmarks[a]
      const end = landmarks[b]
      ctx.beginPath()
      ctx.moveTo(start.x * canvas.width, start.y * canvas.height)
      ctx.lineTo(end.x * canvas.width, end.y * canvas.height)
      ctx.stroke()
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">MediaPipe Test Page</h1>
      
      <div className="mb-4 p-4 bg-blue-900 rounded text-xl">
        Status: {status}
      </div>

      <button
        onClick={startCamera}
        disabled={!poseLoaded}
        className="px-8 py-4 bg-green-600 text-white rounded text-xl font-bold mb-4 disabled:bg-gray-600"
      >
        START CAMERA
      </button>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-2xl border-4 border-blue-500"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full max-w-2xl pointer-events-none"
        />
      </div>

      <div className="mt-4 p-4 bg-yellow-900 rounded">
        <h2 className="font-bold mb-2">Expected Behavior:</h2>
        <ul className="list-disc ml-6">
          <li>Status should say "MediaPipe loaded"</li>
          <li>Click "START CAMERA" and allow camera access</li>
          <li>Status should say "✅ POSE DETECTED!"</li>
          <li>You should see BIG GREEN CIRCLES on your body</li>
          <li>You should see RED LINES connecting joints</li>
        </ul>
      </div>
    </div>
  )
}
