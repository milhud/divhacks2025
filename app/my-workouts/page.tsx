"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { AuthForm } from "@/components/auth-form"
import Link from "next/link"

interface AssignedWorkout {
  id: string
  title: string
  description: string
  duration: string
  difficulty: string
  category: string
  youtubeUrl: string
  videoId: string
  assignedBy: string
  assignedDate: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  notes?: string
  progress?: number
}

export default function MyWorkoutsPage() {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [hasProvider, setHasProvider] = useState(false)

  // Mock data for demonstration
  const mockAssignedWorkouts: AssignedWorkout[] = [
    {
      id: '1',
      title: 'Lower Back Rehabilitation',
      description: 'Core strengthening and hip mobility exercises for lower back pain relief',
      duration: '20 min',
      difficulty: 'Beginner',
      category: 'Rehabilitation',
      youtubeUrl: 'https://www.youtube.com/embed/2LtF0U5vcd4',
      videoId: '2LtF0U5vcd4',
      assignedBy: 'Dr. Sarah Wilson, PT',
      assignedDate: '2025-01-10',
      dueDate: '2025-01-17',
      status: 'in_progress',
      notes: 'Focus on controlled movements. Stop if you feel any sharp pain.',
      progress: 60
    },
    {
      id: '2',
      title: 'Knee Strengthening',
      description: 'Quadriceps and hamstring strengthening for knee recovery',
      duration: '25 min',
      difficulty: 'Beginner',
      category: 'Rehabilitation',
      youtubeUrl: 'https://www.youtube.com/embed/2C7P2FBHHQo',
      videoId: '2C7P2FBHHQo',
      assignedBy: 'Dr. Sarah Wilson, PT',
      assignedDate: '2025-01-08',
      dueDate: '2025-01-15',
      status: 'pending',
      notes: 'Start with 50% range of motion and gradually increase.',
      progress: 0
    },
    {
      id: '3',
      title: 'Shoulder Mobility',
      description: 'Rotator cuff strengthening and mobility exercises',
      duration: '18 min',
      difficulty: 'Beginner',
      category: 'Rehabilitation',
      youtubeUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
      videoId: 'IODxDxX7oi4',
      assignedBy: 'Dr. Sarah Wilson, PT',
      assignedDate: '2025-01-05',
      dueDate: '2025-01-12',
      status: 'completed',
      notes: 'Great progress! Continue with maintenance exercises.',
      progress: 100
    }
  ]

  useEffect(() => {
    // Simulate checking if user has a provider connection
    if (user) {
      // In a real app, this would check the user's provider connection
      setHasProvider(true)
      setAssignedWorkouts(mockAssignedWorkouts)
    }
    setLoading(false)
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'pending':
        return 'Pending'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onShowAuth={() => setShowAuth(true)} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onShowAuth={() => setShowAuth(true)} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Account Required</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              My Workouts is a premium feature that requires you to be logged in and connected to a healthcare provider. 
              Sign in to access your personalized workout assignments.
            </p>
            <button 
              onClick={() => setShowAuth(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign In to Access
            </button>
          </div>
        </main>
        {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  if (!hasProvider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onShowAuth={() => setShowAuth(true)} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Provider Connection Required</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              To access your personalized workout assignments, you need to be connected to a healthcare provider. 
              Contact your provider to get your provider code and join their program.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Don't have a provider code? Contact your healthcare provider or physical therapist.
              </p>
              <Link 
                href="/providers/signup"
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Find a Provider
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="my-workouts" onShowAuth={() => setShowAuth(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Workouts</h1>
          <p className="text-lg text-gray-600">
            Your personalized workout assignments from your healthcare provider
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{assignedWorkouts.length}</div>
            <div className="text-sm text-gray-600">Total Assigned</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {assignedWorkouts.filter(w => w.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {assignedWorkouts.filter(w => w.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {assignedWorkouts.filter(w => w.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-6">
          {assignedWorkouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{workout.title}</h3>
                    <p className="text-gray-600 mb-4">{workout.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <span>Duration: {workout.duration}</span>
                      <span>Difficulty: {workout.difficulty}</span>
                      <span>Category: {workout.category}</span>
                      <span>Assigned by: {workout.assignedBy}</span>
                    </div>

                    {workout.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-1">Provider Notes:</h4>
                        <p className="text-blue-800 text-sm">{workout.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workout.status)}`}>
                          {getStatusText(workout.status)}
                        </span>
                        {workout.progress !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Progress:</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${workout.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{workout.progress}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Due: {new Date(workout.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* YouTube Video */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Exercise Video</h4>
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={workout.youtubeUrl}
                      title={workout.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Mark as Complete
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Add Notes
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {assignedWorkouts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workouts Assigned</h3>
            <p className="text-gray-600 mb-6">
              Your healthcare provider hasn't assigned any workouts yet. Check back later or contact your provider.
            </p>
            <Link 
              href="/providers"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Contact Provider
            </Link>
          </div>
        )}
      </main>

      {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
    </div>
  )
}
