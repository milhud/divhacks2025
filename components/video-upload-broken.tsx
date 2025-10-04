"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { MarkdownRenderer } from "./markdown-renderer"
import { LiveCameraFeed } from "./live-camera-feed"

export function VideoUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showLiveMode, setShowLiveMode] = useState(false)
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
      formData.append("video", selectedFile)
      formData.append("userId", user.id)
      formData.append("workoutId", "temp-workout-id")

      // Upload video
      const uploadResponse = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Video upload failed")
      }

      const uploadData = await uploadResponse.json()

      // Start pose analysis
      const analysisResponse = await fetch("/api/pose/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: uploadData.sessionId,
          videoUrl: uploadData.videoUrl,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Pose analysis failed")
      }

      const analysisData = await analysisResponse.json()

      // Generate AI feedback
      const feedbackResponse = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: uploadData.sessionId,
          poseData: analysisData.analysis,
          workoutType: "General Workout",
        }),
      })

      if (!feedbackResponse.ok) {
        throw new Error("AI feedback generation failed")
      }

      const feedbackData = await feedbackResponse.json()

      setAnalysisResult({
        ...analysisData.analysis,
        feedback: feedbackData.feedback,
      })
      setSelectedFile(null)
    } catch (error: any) {
      console.error("Upload error:", error)
      alert(`Upload failed: ${error.message}`)
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

  const handleLiveAnalysisComplete = (analysis: any) => {
    setAnalysisResult({
      form_score: analysis.formScore,
      rep_count: analysis.repCount,
      feedback: analysis.feedback
    })
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5 border-border shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-muted/30 p-2 rounded-xl shadow-inner">
            <div className="flex gap-2">
              <button
                onClick={() => setShowLiveMode(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  !showLiveMode
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg scale-105'
                    : 'bg-card hover:bg-card/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                📁 Upload Video
              </button>
              <button
                onClick={() => setShowLiveMode(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  showLiveMode
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg scale-105'
                    : 'bg-card hover:bg-card/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                🔴 Live Analysis
              </button>
            </div>
          </div>
        </div>

        {showLiveMode ? (
          <LiveCameraFeed 
            onAnalysisComplete={handleLiveAnalysisComplete}
            exerciseType="General Workout"
          />
        ) : (
          <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          `}
        >
          <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInputChange} className="hidden" />

          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-primary drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold mb-1 text-foreground/90">
                {selectedFile ? selectedFile.name : "Drop your workout video here"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile
                  ? `${formatFileSize(selectedFile.size)} • Ready to analyze`
                  : "or click to browse • MP4, MOV, AVI up to 500MB"}
              </p>
            </div>

            {!selectedFile && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mt-2 border-2 font-semibold"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
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
            className="flex-1 bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-0"
            size="lg"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Form
              </>
            )}
          </Button>
          {selectedFile && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 font-semibold"
            >
              Change Video
            </Button>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="p-6 bg-accent/10 border-2 border-accent rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-foreground">Analysis Complete!</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-accent">{analysisResult.form_score}%</div>
                <div className="text-sm text-muted-foreground">Form Score</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-accent">{analysisResult.rep_count}</div>
                <div className="text-sm text-muted-foreground">Reps Counted</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">AI Feedback:</h4>
              <div className="text-foreground/80 text-sm">
                <MarkdownRenderer content={analysisResult.feedback} />
              </div>
            </div>
          </div>
        )}

        {/* Pro Tip */}
        <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-primary/10 via-secondary/8 to-accent/10 rounded-xl border-2 border-primary/20 shadow-md">
          <svg
            className="w-6 h-6 text-primary flex-shrink-0 mt-0.5 drop-shadow-sm"
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
            <p className="font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">💡</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Pro Tip</span>
            </p>
            <p className="text-foreground/80 font-medium">
              For best results, record your workout from the side with your full body visible. Good lighting and a
              stable camera position help our AI provide more accurate feedback.
            </p>
          </div>
        </div>
        )}

        {/* Analysis Results - shown for both modes */}
        {analysisResult && (
          <div className="p-6 bg-accent/10 border-2 border-accent rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-foreground">Analysis Complete!</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-accent">{analysisResult.form_score}%</div>
                <div className="text-sm text-muted-foreground">Form Score</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-accent">{analysisResult.rep_count}</div>
                <div className="text-sm text-muted-foreground">Reps Counted</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">AI Feedback:</h4>
              <div className="text-foreground/80 text-sm">
                <MarkdownRenderer content={analysisResult.feedback} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
