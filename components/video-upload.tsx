"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export function VideoUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isConfigured } = useAuth()

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

    setIsUploading(true)
    
    try {
      if (!isConfigured) {
        // Mock analysis when backend is not configured
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing
        
        const mockResult = {
          form_score: Math.floor(Math.random() * 30) + 70, // 70-100
          rep_count: Math.floor(Math.random() * 10) + 5, // 5-15
          feedback: "Great workout! Your form looks solid. Keep your back straight and maintain controlled movements. Consider adding more depth to your squats for better muscle engagement.",
          keypoints: [
            { name: 'nose', x: 0.5, y: 0.2, confidence: 0.95 },
            { name: 'left_shoulder', x: 0.4, y: 0.3, confidence: 0.92 },
            { name: 'right_shoulder', x: 0.6, y: 0.3, confidence: 0.91 },
            { name: 'left_hip', x: 0.45, y: 0.6, confidence: 0.93 },
            { name: 'right_hip', x: 0.55, y: 0.6, confidence: 0.94 },
            { name: 'left_knee', x: 0.42, y: 0.8, confidence: 0.90 },
            { name: 'right_knee', x: 0.58, y: 0.8, confidence: 0.91 },
            { name: 'left_ankle', x: 0.4, y: 1.0, confidence: 0.86 },
            { name: 'right_ankle', x: 0.6, y: 1.0, confidence: 0.88 }
          ]
        }
        
        setAnalysisResult(mockResult)
        return
      }

      // Real backend integration when configured
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('userId', 'temp-user-id')
      formData.append('workoutId', 'temp-workout-id')

      const uploadResponse = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadResponse.json()
      
      const analysisResponse = await fetch('/api/pose/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: uploadData.sessionId,
          videoUrl: uploadData.videoUrl,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed')
      }

      const analysisData = await analysisResponse.json()
      
      const feedbackResponse = await fetch('/api/feedback/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: uploadData.sessionId,
          poseData: analysisData.analysis,
          workoutType: 'General Workout',
        }),
      })

      if (!feedbackResponse.ok) {
        throw new Error('Feedback generation failed')
      }

      const feedbackData = await feedbackResponse.json()
      
      setAnalysisResult({
        form_score: analysisData.analysis.form_score,
        rep_count: analysisData.analysis.rep_count,
        feedback: feedbackData.feedback,
        keypoints: analysisData.analysis.keypoints
      })
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
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

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          `}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="video/*" 
            onChange={handleFileInputChange} 
            className="hidden" 
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-sm text-gray-600">
                {selectedFile
                  ? `${formatFileSize(selectedFile.size)} • Ready to analyze`
                  : "or click to browse • MP4, MOV, AVI up to 50MB"}
              </p>
            </div>

            {!selectedFile && (
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                Choose File
              </Button>
            )}
          </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
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
            disabled={!selectedFile || isUploading}
            className="flex-1"
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
          <div className="space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Analysis Complete!</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analysisResult.form_score}%</div>
                <div className="text-sm text-green-700">Form Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analysisResult.rep_count}</div>
                <div className="text-sm text-green-700">Reps Detected</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-green-900 mb-2">AI Feedback:</h4>
              <p className="text-green-800 text-sm leading-relaxed">{analysisResult.feedback}</p>
            </div>

            {!isConfigured && (
              <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                💡 This is a demo result. Configure your backend to get real analysis!
              </div>
            )}
          </div>
        )}

        {/* Configuration Status */}
        {!isConfigured && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div className="text-sm leading-relaxed">
              <p className="font-medium text-yellow-900 mb-1">Backend Not Configured</p>
              <p className="text-yellow-800">
                Add your Supabase credentials to .env.local to enable real video analysis, user authentication, and data storage.
              </p>
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
            <p className="text-blue-700">
              For best results, record your workout from the side with your full body visible. Good lighting and a
              stable camera position help our AI provide more accurate feedback.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}