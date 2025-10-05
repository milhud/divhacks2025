"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { MarkdownRenderer } from "./markdown-renderer"
import { LiveCameraFeed } from "./live-camera-feed"
import { LiveMediaPipeCamera } from "./live-mediapipe-camera"
import { PainInput } from "./pain-input"

const normalizeAnalysisResult = (raw: any = {}) => {
  const formScore = raw.form_score ?? raw.movement_quality_score ?? 0
  const repCount = raw.rep_count ?? raw.reps ?? 0
  const durationSeconds = raw.duration_seconds ?? raw.duration ?? 0
  const confidence = raw.confidence ?? (raw.overall_confidence ? Math.round(raw.overall_confidence * 100) : null)
  const averageVelocity = raw.average_velocity ?? raw.avg_velocity ?? null
  const maxVelocity = raw.max_velocity ?? raw.peak_velocity ?? null
  const tempo = raw.tempo_rating ?? raw.tempo ?? null
  const rangeOfMotion = raw.range_of_motion ?? null
  const stability = raw.stability_score ?? null
  const movementCompensations = raw.movement_compensations ?? raw.compensations ?? []
  const painIndicators = raw.pain_indicators ?? []
  const exerciseType = raw.exercise_type ?? raw.exerciseType ?? 'general_exercise'

  return {
    ...raw,
    exercise_type: exerciseType,
    form_score: formScore,
    movement_quality_score: formScore,
    rep_count: repCount,
    duration_seconds: durationSeconds,
    confidence,
    average_velocity: averageVelocity,
    avg_velocity: averageVelocity,
    max_velocity: maxVelocity,
    tempo_rating: tempo,
    range_of_motion: rangeOfMotion,
    stability_score: stability,
    movement_compensations: movementCompensations,
    pain_indicators: painIndicators,
  }
}

export function VideoUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [activeMode, setActiveMode] = useState<'upload' | 'live' | 'pain' | 'gvi' | 'mediapipe'>('upload')
  const [selectedExercise, setSelectedExercise] = useState<string>('auto') // Exercise type selection
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file)
      setAnalysisResult(null) // Clear previous results
    } else {
      alert("Please select a valid video file")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    if (!user) {
      alert("Please sign in to upload videos.")
      return
    }

    setIsUploading(true)
    
    try {
      // Real backend integration
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('userId', user.id)
      formData.append('workoutId', 'temp-workout-id')

      // Upload video
      const uploadResponse = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Video upload failed')
      }

      const uploadData = await uploadResponse.json()

      const exerciseForAnalysis = selectedExercise === 'auto' ? undefined : selectedExercise

      // Start pose analysis
      const analysisResponse = await fetch('/api/pose/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: uploadData.sessionId,
          videoUrl: uploadData.videoUrl,
          exerciseType: exerciseForAnalysis,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error('Pose analysis failed')
      }

      const analysisData = await analysisResponse.json()
      const normalizedAnalysis = normalizeAnalysisResult(analysisData.analysis)

      // Generate AI feedback
      const feedbackResponse = await fetch('/api/feedback/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: uploadData.sessionId,
          poseData: normalizedAnalysis,
          workoutType: exerciseForAnalysis ? exerciseForAnalysis.replace('_', ' ') : 'General Workout',
        }),
      })

      if (!feedbackResponse.ok) {
        throw new Error('AI feedback generation failed')
      }

      const feedbackData = await feedbackResponse.json()

      setAnalysisResult(normalizeAnalysisResult({
        ...normalizedAnalysis,
        feedback: feedbackData.feedback,
      }))
      setSelectedFile(null)

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleGVIUpload = async () => {
    if (!selectedFile) return
    if (!user) {
      alert("Please sign in to upload videos.")
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('userId', user.id)
      formData.append('exerciseType', 'general_exercise')

      // Analyze video with Google Video Intelligence + OpenAI with extended timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const response = await fetch('/api/video/analyze-gvi', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Video analysis failed')
      }

      const data = await response.json()

      // Handle both successful analysis and fallback results
      setAnalysisResult(normalizeAnalysisResult({
        ...data.analysis,
        feedback: data.analysis?.feedback || "Analysis completed. Your video has been processed using Google Video Intelligence and AI feedback has been generated.",
      }))
      setSelectedFile(null)

      // Show success message
      alert("✅ AI Analysis Complete! Check the results below.")

    } catch (error: any) {
      console.error('GVI Upload error:', error)
      if (error.name === 'AbortError') {
        alert('Analysis is taking longer than expected. The process may still be running in the background.')
      } else {
        alert(`Analysis failed: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleMediaPipeUpload = async () => {
    if (!selectedFile) return
    if (!user) {
      alert("Please sign in to upload videos.")
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('userId', user.id)
      // Send selected exercise type (auto, squat, deadlift, push_up)
      formData.append('exerciseType', selectedExercise === 'auto' ? '' : selectedExercise)

      // Analyze video with MediaPipe + OpenAI (much faster!)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minute timeout

      const response = await fetch('/api/video/analyze-mediapipe', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'MediaPipe analysis failed')
      }

      const data = await response.json()
      console.log('MediaPipe response:', data) // Debug log

      const analysisData = normalizeAnalysisResult({
        ...data.analysis,
        feedback: data.analysis?.feedback || "MediaPipe analysis completed successfully!",
      })

      console.log('Setting analysis result:', analysisData) // Debug log
      setAnalysisResult(analysisData)
      setSelectedFile(null)

      // Show success message
      alert("✅ MediaPipe Analysis Complete! Check the results below.")

    } catch (error: any) {
      console.error('MediaPipe Upload error:', error)
      if (error.name === 'AbortError') {
        alert('Analysis is taking longer than expected (3+ minutes). The process may still be running in the background. Please check back in a moment.')
      } else {
        alert(`Analysis failed: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handlePainSubmit = (painData: any) => {
    console.log('Pain data submitted:', painData)
    // Handle pain data submission
  }

  const handleMovementHurt = (movementData: any) => {
    console.log('Movement hurt data submitted:', movementData)
    // Handle movement hurt data
  }

  const handleLiveAnalysisComplete = (analysis: any) => {
    console.log('Live analysis completed:', analysis)
    setAnalysisResult(normalizeAnalysisResult(analysis))
  }

  return (
    <Card className="p-8 bg-card border-border">
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          <Button
            variant={activeMode === 'upload' ? 'default' : 'outline'}
            onClick={() => setActiveMode('upload')}
            size="sm"
          >
            Basic Upload
          </Button>
          <Button
            variant={activeMode === 'mediapipe' ? 'default' : 'outline'}
            onClick={() => setActiveMode('mediapipe')}
            size="sm"
          >
            🚀 Fast AI Analysis
          </Button>
          <Button
            variant={activeMode === 'gvi' ? 'default' : 'outline'}
            onClick={() => setActiveMode('gvi')}
            size="sm"
          >
            Cloud AI (Slow)
          </Button>
          <Button
            variant={activeMode === 'live' ? 'default' : 'outline'}
            onClick={() => setActiveMode('live')}
            size="sm"
          >
            Live Camera
          </Button>
          <Button
            variant={activeMode === 'pain' ? 'default' : 'outline'}
            onClick={() => setActiveMode('pain')}
            size="sm"
          >
            Pain Assessment
          </Button>
        </div>

        {/* Upload Mode */}
        {activeMode === 'upload' && (
          <>
            {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          `}
        >
          <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInputChange} className="hidden" />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold mb-1">
                {selectedFile ? selectedFile.name : "Drop your workout video here"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile
                  ? `${formatFileSize(selectedFile.size)} • Ready to analyze`
                  : "or click to browse • MP4, MOV, AVI up to 500MB"}
              </p>
            </div>

            {!selectedFile && (
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                  />
                </svg>
                Choose File
              </Button>
            )}
          </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || !user}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Form
              </>
            )}
          </Button>
          {selectedFile && (
            <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
              Change Video
            </Button>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-green-900">
                Analysis Complete{analysisResult.exercise_type ? `: ${analysisResult.exercise_type.replace('_', ' ')}` : '!'}
              </h3>
            </div>

            {/* Quality Warnings */}
            {analysisResult.analyzed_frames && analysisResult.analyzed_frames < 50 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <strong>⚠️ Poor camera angle detected.</strong> Only {analysisResult.analyzed_frames} poses detected. Try filming from the front with your full body visible for better results.
                  </div>
                </div>
              </div>
            )}
            {analysisResult.confidence && analysisResult.confidence < 70 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-orange-800">
                    <strong>⚠️ Limited movement detected.</strong> Confidence: {analysisResult.confidence}%. Make sure your full body is visible and try better lighting.
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{analysisResult.form_score}%</div>
                <div className="text-xs text-green-700">Form Score</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{analysisResult.rep_count}</div>
                <div className="text-xs text-blue-700">Reps Counted</div>
              </div>
              {analysisResult.tempo_rating && (
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-purple-600 capitalize">{analysisResult.tempo_rating}</div>
                  <div className="text-xs text-purple-700">Tempo</div>
                </div>
              )}
              {(analysisResult.average_velocity || analysisResult.avg_velocity) && (
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-orange-600">{analysisResult.average_velocity || analysisResult.avg_velocity}°/s</div>
                  <div className="text-xs text-orange-700">Velocity</div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-green-900 mb-2">AI Feedback:</h4>
              <div className="text-green-800 text-sm">
                <MarkdownRenderer content={analysisResult.feedback} />
              </div>
            </div>
          </div>
        )}

            {/* Pro Tip */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-blue-900 mb-1">Pro Tip</p>
                <p className="text-blue-800">
                  For best results, record your workout from the side with your full body visible. Good lighting and a
                  stable camera position help our AI provide more accurate feedback.
                </p>
              </div>
            </div>
          </>
        )}

        {/* MediaPipe Mode */}
        {activeMode === 'mediapipe' && (
          <>
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
              `}
            >
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInputChange} className="hidden" />

              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-lg font-semibold mb-1">
                    {selectedFile ? selectedFile.name : "🚀 MediaPipe AI Analysis"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile
                      ? `${formatFileSize(selectedFile.size)} • Ready for fast AI analysis`
                      : "Upload your workout video for lightning-fast MediaPipe analysis • Up to 50MB"}
                  </p>
                </div>

                {!selectedFile && (
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                      />
                    </svg>
                    Choose Video
                  </Button>
                )}
              </div>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)} • Ready for MediaPipe analysis</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Exercise Type Selection */}
            {selectedFile && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  🎯 Exercise Type (Select for Better Accuracy)
                </label>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full p-2 border border-purple-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="auto">Auto-Detect (May misclassify if arms move during squats)</option>
                  <option value="squat">Squat (Tracks knee angles only)</option>
                  <option value="deadlift">Deadlift (Tracks hip angles only)</option>
                  <option value="push_up">Push-up (Tracks elbow angles only)</option>
                </select>
                <p className="text-xs text-purple-700 mt-2">
                  💡 <strong>Tip:</strong> Manual selection ignores irrelevant movements and improves accuracy!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleMediaPipeUpload}
                disabled={!selectedFile || isUploading || !user}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing with MediaPipe... (Fast!)
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze with MediaPipe
                  </>
                )}
              </Button>
              {selectedFile && (
                <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                  Change Video
                </Button>
              )}
            </div>

            {/* MediaPipe Features Info */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-green-900 mb-1">🎯 Good-GYM Algorithm (Proven)</p>
                <p className="text-green-800">
                  <strong>State Machine:</strong> Tracks "up" vs "down" stages, counts transitions. 
                  <strong>Timing Protection:</strong> 0.5s minimum between reps (no double-counting).
                  <strong>Median Smoothing:</strong> Removes outliers before counting.
                  <strong>Based on yo-WASSUP/Good-GYM:</strong> Proven open-source fitness tracker.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Google Video Intelligence Mode */}
        {activeMode === 'gvi' && (
          <>
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
              `}
            >
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInputChange} className="hidden" />

              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-lg font-semibold mb-1">
                    {selectedFile ? selectedFile.name : "AI-Powered Video Analysis"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile
                      ? `${formatFileSize(selectedFile.size)} • Ready for AI analysis`
                      : "Upload your workout video for advanced AI analysis • Up to 100MB"}
                  </p>
                </div>

                {!selectedFile && (
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                      />
                    </svg>
                    Choose Video
                  </Button>
                )}
              </div>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)} • Ready for AI analysis</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGVIUpload}
                disabled={!selectedFile || isUploading || !user}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing with AI... (This may take 30-60 seconds)
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze with AI
                  </>
                )}
              </Button>
              {selectedFile && (
                <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                  Change Video
                </Button>
              )}
            </div>

            {/* AI Features Info */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-blue-900 mb-1">AI-Powered Analysis</p>
                <p className="text-blue-800">
                  Uses Google Video Intelligence for advanced pose detection and OpenAI for personalized feedback. 
                  Automatically detects exercise type, counts reps, scores form, and provides detailed coaching insights.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Live Camera Mode - REAL MediaPipe with Skeleton Overlay */}
        {activeMode === 'live' && (
          <LiveMediaPipeCamera 
            onAnalysisComplete={handleLiveAnalysisComplete}
            exerciseType={selectedExercise || "General Workout"}
          />
        )}

        {/* Pain Assessment Mode */}
        {activeMode === 'pain' && (
          <PainInput
            onPainSubmit={handlePainSubmit}
            onMovementHurt={handleMovementHurt}
          />
        )}

        {/* Analysis Results - Shared across all modes */}
        {analysisResult && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-green-900">Analysis Complete!</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisResult.form_score || analysisResult.movement_quality_score || 0}%</div>
                <div className="text-sm text-green-700">Form Score</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisResult.rep_count || 0}</div>
                <div className="text-sm text-green-700">Reps Counted</div>
              </div>
              {analysisResult.pain_level !== undefined && (
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analysisResult.pain_level || 0}/10</div>
                  <div className="text-sm text-red-700">Pain Level</div>
                </div>
              )}
              {(analysisResult.range_of_motion !== undefined && analysisResult.range_of_motion !== null) && (
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.range_of_motion || 0}%</div>
                  <div className="text-sm text-blue-700">Range of Motion</div>
                </div>
              )}
              {(analysisResult.average_velocity || analysisResult.avg_velocity) && (
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysisResult.average_velocity || analysisResult.avg_velocity}°/s</div>
                  <div className="text-sm text-purple-700">Average Velocity</div>
                </div>
              )}
              {analysisResult.tempo_rating && (
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 capitalize">{analysisResult.tempo_rating}</div>
                  <div className="text-sm text-orange-700">Tempo</div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-green-900 mb-2">AI Feedback:</h4>
              <div className="text-green-800 text-sm">
                <MarkdownRenderer content={analysisResult.feedback || analysisResult.therapeutic_feedback || "No feedback available"} />
              </div>
            </div>

            {analysisResult.movement_compensations && analysisResult.movement_compensations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-900 mb-2">Movement Compensations Detected:</h4>
                <ul className="text-red-800 text-sm">
                  {analysisResult.movement_compensations.map((comp: any, index: number) => (
                    <li key={index}>• {comp.joint}: {comp.compensation_type} ({comp.severity})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
