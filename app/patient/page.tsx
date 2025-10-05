"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { RehabExercises } from "@/components/rehab-exercises"
import { VideoUpload } from "@/components/video-upload"
import { AILiveCamera } from "@/components/ai-live-camera"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PatientDashboard() {
  const { user, signOut } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'home' | 'exercises' | 'progress' | 'profile'>('home')
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, number>>({})
  const [showLiveAnalysis, setShowLiveAnalysis] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('patientExerciseProgress')
    if (savedProgress) {
      try {
        setExerciseProgress(JSON.parse(savedProgress))
      } catch (e) {
        console.error('Error loading exercise progress:', e)
      }
    }
  }, [])

  const handleExerciseComplete = (exerciseId: string, progress: number) => {
    console.log(`Exercise ${exerciseId} completed: ${progress}%`)
    // You can add celebration animation or notification here
  }

  const handleProgressUpdate = (exerciseId: string, progress: number) => {
    setExerciseProgress(prev => {
      const newProgress = { ...prev, [exerciseId]: progress }
      localStorage.setItem('patientExerciseProgress', JSON.stringify(newProgress))
      return newProgress
    })
  }

  const handleAnalysisComplete = (analysis: any) => {
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 10)) // Keep last 10 analyses
  }

  const getOverallProgress = () => {
    const exercises = Object.keys(exerciseProgress)
    if (exercises.length === 0) return 0
    
    const totalProgress = exercises.reduce((sum, exerciseId) => sum + exerciseProgress[exerciseId], 0)
    return Math.round(totalProgress / exercises.length)
  }

  const getCompletedExercises = () => {
    return Object.values(exerciseProgress).filter(progress => progress >= 100).length
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go to home page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VibeCoach.Health</h1>
                <p className="text-sm text-gray-600">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.user_metadata?.full_name || 'Patient'}</span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('home')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'home'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setSelectedTab('exercises')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'exercises'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏥 Rehab Exercises
            </button>
            <button
              onClick={() => setSelectedTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Progress
            </button>
            <button
              onClick={() => setSelectedTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👤 Profile
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
                AI-Powered Fitness & Rehabilitation
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Perfect Your Form with <span className="text-blue-600">Real-Time</span> AI Feedback
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Upload workout videos or use live camera feed for instant AI-powered analysis on your form, technique, 
                pain assessment, and movement patterns. Train smarter, recover faster.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => setShowLiveAnalysis(!showLiveAnalysis)}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                {showLiveAnalysis ? '📹 Stop Live Analysis' : '🤖 Start Live Analysis'}
              </Button>
              <Link
                href="/ai-analysis"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                📊 AI Form Analysis
              </Link>
            </div>

            {/* Live Analysis Section */}
            {showLiveAnalysis && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Live AI Analysis</h3>
                  <p className="text-gray-600">Real-time form analysis with AI-powered feedback</p>
                </div>
                
                <AILiveCamera
                  onAnalysisComplete={handleAnalysisComplete}
                  exerciseType="squat"
                  isProviderMode={false}
                  showExerciseSelector={true}
                />

                {/* Analysis History */}
                {analysisHistory.length > 0 && (
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Recent Analysis</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {analysisHistory.map((analysis, index) => (
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
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Video Upload Component */}
            <VideoUpload />

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Movement Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Advanced AI tracks movement patterns and detects compensations
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Live Camera Feed</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Real-time AI coaching with live camera feed for instant feedback
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Monitor your rehabilitation progress with detailed analytics
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'exercises' && (
          <RehabExercises
            onExerciseComplete={handleExerciseComplete}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {selectedTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h2>
              <p className="text-gray-600">Track your rehabilitation journey</p>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {getOverallProgress()}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {getCompletedExercises()}
                </div>
                <div className="text-sm text-gray-600">Completed Exercises</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Object.keys(exerciseProgress).length}
                </div>
                <div className="text-sm text-gray-600">Total Exercises</div>
              </Card>
            </div>

            {/* Exercise Progress Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Exercise Progress Details</h3>
              <div className="space-y-4">
                {Object.entries(exerciseProgress).map(([exerciseId, progress]) => (
                  <div key={exerciseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {exerciseId.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {progress}% complete
                      </div>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {Object.keys(exerciseProgress).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No exercise progress yet. Start your first exercise!
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {selectedTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
              <p className="text-gray-600">Manage your account information</p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="text-gray-900">{user.user_metadata?.full_name || 'Not set'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="text-gray-900">{user.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="text-gray-900">Patient</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <div className="text-green-600 font-medium">Active</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
