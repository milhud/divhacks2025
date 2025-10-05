"use client"

import { useState } from "react"
import { AILiveCamera } from "@/components/ai-live-camera"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExerciseProgress } from "@/components/exercise-progress"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"

export default function AIAnalysisPage() {
  const { user } = useAuth()
  const [selectedExercise, setSelectedExercise] = useState('squat')
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [isProviderMode, setIsProviderMode] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const exercises = [
    { value: 'squat', label: '🏋️ Squat', description: 'Lower body strength exercise' },
    { value: 'bicep_curl', label: '💪 Bicep Curl', description: 'Arm strength exercise' },
    { value: 'pushup', label: '🔥 Pushup', description: 'Upper body strength exercise' },
    { value: 'plank', label: '🧘 Plank', description: 'Core stability exercise' },
    { value: 'lunge', label: '🦵 Lunge', description: 'Single leg strength exercise' },
    { value: 'shoulder_press', label: '💪 Shoulder Press', description: 'Overhead strength exercise' }
  ]

  const handleAnalysisComplete = (analysis: any) => {
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 10)) // Keep last 10 analyses
  }

  const clearHistory = () => {
    setAnalysisHistory([])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onShowAuth={() => setShowAuth(true)} />
      
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Form Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI system that analyzes your exercise form in real-time, 
            detects compensations, and provides personalized coaching feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            <AILiveCamera
              onAnalysisComplete={handleAnalysisComplete}
              exerciseType={selectedExercise}
              isProviderMode={isProviderMode}
              showExerciseSelector={true}
            />
          </div>

          {/* Controls and Settings */}
          <div className="space-y-6">
            {/* Assigned Exercises */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">My Assigned Exercises</h3>
              <ExerciseProgress 
                onExerciseComplete={(exerciseId) => {
                  console.log(`Exercise completed: ${exerciseId}`)
                  // You can add celebration animation or notification here
                }}
                onProgressUpdate={(exerciseId, progress) => {
                  console.log(`Exercise ${exerciseId} progress: ${progress}%`)
                }}
              />
            </Card>
            {/* Exercise Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Exercise Selection</h3>
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.value}
                    onClick={() => setSelectedExercise(exercise.value)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedExercise === exercise.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{exercise.label}</div>
                    <div className="text-sm text-gray-500">{exercise.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Mode Toggle */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Mode</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsProviderMode(false)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    !isProviderMode
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">👤 Personal Training</div>
                  <div className="text-sm text-gray-500">Self-guided workout analysis</div>
                </button>
                <button
                  onClick={() => setIsProviderMode(true)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    isProviderMode
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">👨‍⚕️ Provider Mode</div>
                  <div className="text-sm text-gray-500">Monitor patient exercises</div>
                </button>
              </div>
            </Card>

            {/* Analysis History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Analysis</h3>
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  size="sm"
                  disabled={analysisHistory.length === 0}
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysisHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No analysis data yet</p>
                ) : (
                  analysisHistory.map((analysis, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          {analysis.exerciseType} - {analysis.formScore}%
                        </span>
                        <span className="text-gray-500">
                          {new Date(analysis.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        {analysis.repCount} reps • {analysis.currentAngle}° angle
                      </div>
                      {analysis.aiAnalysis && (
                        <div className="mt-1 text-xs text-blue-600">
                          AI: {analysis.aiAnalysis.form_quality} quality
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* AI Features Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Features</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Real-time joint angle tracking</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Compensation pattern detection</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Exercise-specific form analysis</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>AI-powered coaching feedback</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Injury prevention alerts</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Voice coaching cues</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Analysis Statistics */}
        {analysisHistory.length > 0 && (
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Session Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Analyses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(analysisHistory.reduce((sum, a) => sum + a.formScore, 0) / analysisHistory.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Form Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisHistory.reduce((sum, a) => sum + a.repCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Reps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysisHistory.filter(a => a.aiAnalysis?.form_quality === 'excellent').length}
                  </div>
                  <div className="text-sm text-gray-600">Excellent Forms</div>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative my-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg z-10 text-gray-600 text-2xl"
            >
              ×
            </button>
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6">Sign In Required</h2>
              <p className="text-gray-600 text-center mb-6">
                Please sign in to access AI Form Analysis features.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowAuth(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowAuth(false)
                    // You can add sign in logic here
                  }}
                  className="flex-1"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
