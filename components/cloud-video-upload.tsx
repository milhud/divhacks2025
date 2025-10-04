"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getAudioFeedback } from '@/lib/audio-feedback'
import { MarkdownRenderer } from './markdown-renderer'

interface CloudVideoUploadProps {
  onAnalysisComplete?: (analysis: any) => void
  exerciseType?: string
}

export function CloudVideoUpload({ 
  onAnalysisComplete, 
  exerciseType = "squat" 
}: CloudVideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB")
        return
      }
      setSelectedFile(file)
      setAnalysisResult(null)
      setError(null)
    } else {
      setError("Please select a valid video file (MP4, MOV, AVI)")
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
    if (!selectedFile) {
      setError("Please select a file to continue")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Announce start of analysis
      const audioFeedback = getAudioFeedback()
      audioFeedback.speak("Starting video analysis. This may take a moment.", 'high')

      const formData = new FormData()
      formData.append("video", selectedFile)
      formData.append("exerciseType", exerciseType)
      formData.append("userId", user?.id || "demo-user")

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch("/api/cloud-video/analyze", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data.analysis)
        onAnalysisComplete?.(data.analysis)

        // Provide audio feedback on results
        const score = data.analysis.formScore
        if (score >= 85) {
          audioFeedback.speak("Excellent form! Your technique looks great.", 'medium')
        } else if (score >= 70) {
          audioFeedback.speak("Good job! A few minor adjustments could improve your form.", 'medium')
        } else {
          audioFeedback.speak("Your form needs some work. Check the feedback for specific improvements.", 'high')
        }

        if (data.fallback) {
          setError("Cloud analysis unavailable - using local processing")
        }
      } else {
        throw new Error(data.error || "Analysis failed")
      }

    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Upload failed. Please try again.")
      
      // Provide error feedback
      const audioFeedback = getAudioFeedback()
      audioFeedback.speak("Analysis failed. Please try again.", 'high')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setAnalysisResult(null)
    setError(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card via-card to-secondary/5 border-border shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🎥 Cloud Video Analysis
            </h3>
            <p className="text-muted-foreground">
              Upload your workout video for AI-powered form analysis using Google Cloud
            </p>
          </div>

          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 rounded-xl shadow-md">
              ⚠️ {error}
            </div>
          )}

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}
              ${selectedFile ? "border-green-300 bg-green-50" : ""}
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
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                selectedFile 
                  ? "bg-gradient-to-br from-green-400 to-green-500" 
                  : "bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10"
              }`}>
                {selectedFile ? (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-primary drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>

              <div>
                <p className="text-lg font-semibold mb-1 text-foreground">
                  {selectedFile ? selectedFile.name : "Drop your workout video here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile
                    ? `${formatFileSize(selectedFile.size)} • Ready for cloud analysis`
                    : "or click to browse • MP4, MOV, AVI up to 100MB"}
                </p>
              </div>

              {!selectedFile && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-2 border-2 font-semibold"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Choose Video File
                </Button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Analyzing video...</span>
                <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Processing with Google Cloud Video Intelligence...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {selectedFile && !isUploading && (
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 shadow-lg"
              >
                🚀 Analyze with Cloud AI
              </Button>
              <Button
                onClick={resetUpload}
                variant="outline"
                className="border-2"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="p-6 bg-gradient-to-br from-card via-card to-accent/5 shadow-xl">
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📊 Analysis Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-xl shadow-md border-2 ${
              analysisResult.formScore >= 85 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
              analysisResult.formScore >= 70 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
              'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="text-sm font-bold mb-1">📊 Form Score</div>
              <div className={`text-3xl font-black ${
                analysisResult.formScore >= 85 ? 'text-green-600' :
                analysisResult.formScore >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {analysisResult.formScore}/100
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-md border-2 border-blue-200">
              <div className="text-sm font-bold text-blue-800 mb-1">🔢 Rep Count</div>
              <div className="text-3xl font-black text-blue-600">{analysisResult.repCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-md border-2 border-purple-200">
              <div className="text-sm font-bold text-purple-800 mb-1">🎯 Exercise</div>
              <div className="text-lg font-black text-purple-600 capitalize">{analysisResult.exerciseDetected}</div>
            </div>
          </div>

          {analysisResult.feedback && analysisResult.feedback.length > 0 && (
            <div className="p-5 bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-md">
              <div className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                🎯 <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">AI Feedback:</span>
              </div>
              <ul className="space-y-2">
                {analysisResult.feedback.map((item: string, index: number) => (
                  <li key={index} className="text-yellow-700 font-medium text-sm flex items-start gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.confidence && (
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Analysis confidence: {Math.round(analysisResult.confidence * 100)}% • 
              Frames processed: {analysisResult.frameCount || 'N/A'}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
