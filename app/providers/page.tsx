"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveMediaPipeCamera } from "@/components/live-mediapipe-camera"
import { PainInput } from "@/components/pain-input"
import Link from "next/link"

interface Provider {
  id: string
  name: string
  email: string
  specialization: string
  clinic: string
}

interface Patient {
  id: string
  name: string
  email: string
  condition: string
  assignedExercises: Exercise[]
  lastSession: string
  progress: number
  painLevel: number
  status: 'active' | 'inactive' | 'completed'
  providerCode: string
}

interface Exercise {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  bodyPart: string
  instructions: string[]
  sets: number
  reps: number
  duration?: number
  isAssigned: boolean
}

export default function ProvidersPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [activeTab, setActiveTab] = useState<'patients' | 'exercises' | 'monitoring' | 'reports'>('patients')
  const [showPainInput, setShowPainInput] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showLogin, setShowLogin] = useState(true)

  // Demo provider data
  const demoProvider: Provider = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Dr. Sarah Wilson, PT',
    email: 'sarah.wilson@demorehab.com',
    specialization: 'Orthopedic Physical Therapy',
    clinic: 'Demo Rehabilitation Clinic'
  }

  // Demo patients data
  const demoPatients: Patient[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'John Smith',
      email: 'john.smith@email.com',
      condition: 'Lower back pain',
      assignedExercises: [],
      lastSession: '2025-01-15',
      progress: 75,
      painLevel: 3,
      status: 'active',
      providerCode: 'DEMO001'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      condition: 'Knee rehabilitation',
      assignedExercises: [],
      lastSession: '2025-01-14',
      progress: 60,
      painLevel: 2,
      status: 'active',
      providerCode: 'DEMO001'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      condition: 'Shoulder impingement',
      assignedExercises: [],
      lastSession: '2025-01-13',
      progress: 40,
      painLevel: 5,
      status: 'active',
      providerCode: 'DEMO001'
    }
  ]

  // Demo exercises data
  const demoExercises: Exercise[] = [
    {
      id: '1',
      name: 'Quad Sets',
      description: 'Isometric quadriceps strengthening',
      difficulty: 'beginner',
      bodyPart: 'knee',
      instructions: ['Sit with legs extended', 'Tighten quad muscle', 'Hold for 5 seconds'],
      sets: 3,
      reps: 10,
      isAssigned: false
    },
    {
      id: '2',
      name: 'Straight Leg Raises',
      description: 'Hip flexor and quad strengthening',
      difficulty: 'beginner',
      bodyPart: 'knee',
      instructions: ['Lie on back', 'Lift straight leg 6-8 inches', 'Hold for 3 seconds'],
      sets: 3,
      reps: 15,
      isAssigned: false
    },
    {
      id: '3',
      name: 'Wall Slides',
      description: 'Shoulder blade mobility',
      difficulty: 'intermediate',
      bodyPart: 'shoulder',
      instructions: ['Stand against wall', 'Place arms at shoulder height', 'Slide up overhead'],
      sets: 3,
      reps: 10,
      isAssigned: false
    },
    {
      id: '4',
      name: 'Cat-Cow Stretch',
      description: 'Spinal mobility and pain relief',
      difficulty: 'beginner',
      bodyPart: 'back',
      instructions: ['Start on hands and knees', 'Arch back (cow)', 'Round spine (cat)'],
      sets: 3,
      reps: 10,
      isAssigned: false
    }
  ]

  useEffect(() => {
    setPatients(demoPatients)
    setExercises(demoExercises)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Demo login - accept any email/password for demo purposes
    if (loginForm.email && loginForm.password) {
      setProvider(demoProvider)
      setIsLoggedIn(true)
      setShowLogin(false)
    } else {
      alert('Please enter both email and password')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setProvider(null)
    setShowLogin(true)
    setLoginForm({ email: '', password: '' })
  }

  const handleExerciseAssign = () => {
    if (!selectedExercise || !selectedPatient) {
      alert('Please select both an exercise and a patient')
      return
    }

    setPatients(prev => prev.map(patient => 
      patient.id === selectedPatient.id 
        ? { 
            ...patient, 
            assignedExercises: [...patient.assignedExercises, { ...selectedExercise, isAssigned: true }]
          }
        : patient
    ))
    
    // Show success message
    alert(`Exercise "${selectedExercise.name}" assigned to ${selectedPatient.name} successfully!`)
    
    // Reset selections
    setSelectedExercise(null)
    setSelectedPatient(null)
  }

  const handlePatientCodeEnter = (patientId: string, code: string) => {
    if (code === 'DEMO001') {
      setPatients(prev => prev.map(patient => 
        patient.id === patientId 
          ? { 
              ...patient, 
              progress: Math.min(patient.progress + 10, 100),
              lastSession: new Date().toISOString().split('T')[0]
            }
          : patient
      ))
      alert('Patient code accepted! Progress updated.')
    } else {
      alert('Invalid patient code. Try: DEMO001')
    }
  }

  const handlePainSubmit = (painData: any) => {
    console.log('Pain data submitted:', painData)
    alert('Pain assessment submitted successfully!')
  }

  const handleMovementHurt = (movementData: any) => {
    console.log('Movement hurt data submitted:', movementData)
    alert('Movement pain data recorded!')
  }

  const handleAnalysisComplete = (analysis: any) => {
    console.log('Live analysis completed:', analysis)
    // Update patient progress based on analysis
    if (selectedPatient) {
      setPatients(prev => prev.map(patient => 
        patient.id === selectedPatient.id 
          ? { 
              ...patient, 
              progress: Math.min(patient.progress + 5, 100),
              lastSession: new Date().toISOString().split('T')[0]
            }
          : patient
      ))
    }
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">V</span>
              </div>
              <h1 className="text-2xl font-bold text-balance">
                Vibe <span className="text-primary">Coach</span>
              </h1>
            </Link>
            <h2 className="text-2xl font-bold mb-2">Provider Login</h2>
            <p className="text-gray-600">Sign in to access your provider dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="sarah.wilson@demorehab.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter password"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>


          <div className="mt-6 text-center space-y-2">
            <Link href="/providers/signup" className="block text-sm text-blue-600 hover:text-blue-800">
              Don't have an account? Sign up as a provider
            </Link>
            <Link href="/" className="block text-sm text-gray-600 hover:text-gray-800">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">V</span>
            </div>
            <h1 className="text-2xl font-bold text-balance">
              Vibe <span className="text-primary">Coach</span> - Provider Dashboard
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{provider?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'patients', label: 'Patients', count: patients.length },
              { id: 'exercises', label: 'Exercise Library', count: exercises.length },
              { id: 'monitoring', label: 'Live Monitoring', count: 0 },
              { id: 'reports', label: 'Reports', count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Patient Management</h2>
              <Button>Add New Patient</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map(patient => (
                <Card key={patient.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-gray-600 text-sm">{patient.condition}</p>
                      <p className="text-gray-500 text-xs">{patient.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{patient.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          patient.progress >= 80 ? 'bg-green-500' :
                          patient.progress >= 60 ? 'bg-blue-500' :
                          patient.progress >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${patient.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {patient.progress >= 80 ? 'Excellent Progress' :
                       patient.progress >= 60 ? 'Good Progress' :
                       patient.progress >= 40 ? 'Moderate Progress' :
                       'Needs Improvement'}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Pain Level: {patient.painLevel}/10</span>
                    <span>Last Session: {patient.lastSession}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedPatient(patient)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveTab('monitoring')}
                      >
                        Monitor
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Provider Code: DEMO001
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Library Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Exercise Library</h2>
              <Button>Add New Exercise</Button>
            </div>

            {/* Assignment Interface */}
            <Card className="p-6 bg-blue-50">
              <h3 className="text-lg font-semibold mb-4">Assign Exercise to Patient</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Select Exercise</label>
                  <select 
                    value={selectedExercise?.id || ''} 
                    onChange={(e) => {
                      const exercise = exercises.find(ex => ex.id === e.target.value)
                      setSelectedExercise(exercise || null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choose an exercise...</option>
                    {exercises.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Select Patient</label>
                  <select 
                    value={selectedPatient?.id || ''} 
                    onChange={(e) => {
                      const patient = patients.find(p => p.id === e.target.value)
                      setSelectedPatient(patient || null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={handleExerciseAssign}
                  disabled={!selectedExercise || !selectedPatient}
                >
                  Assign Exercise
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exercises.map(exercise => (
                <Card key={exercise.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                      <p className="text-gray-600 text-sm">{exercise.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exercise.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {exercise.bodyPart}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <strong>Instructions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {exercise.instructions.map((instruction, index) => (
                          <li key={index} className="text-xs">{instruction}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Sets:</strong> {exercise.sets} | <strong>Reps:</strong> {exercise.reps}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      Select for Assignment
                    </Button>
                    <Button size="sm" variant="outline">
                      Preview
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Live Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Live Patient Monitoring</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowPainInput(!showPainInput)}>
                  {showPainInput ? 'Hide' : 'Show'} Pain Input
                </Button>
                <select 
                  value={selectedPatient?.id || ''} 
                  onChange={(e) => {
                    const patient = patients.find(p => p.id === e.target.value)
                    setSelectedPatient(patient || null)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Patient to Monitor</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {showPainInput && (
              <PainInput 
                onPainSubmit={handlePainSubmit}
                onMovementHurt={handleMovementHurt}
              />
            )}

            <LiveMediaPipeCamera 
              onAnalysisComplete={handleAnalysisComplete}
              isProviderMode={true}
              exerciseType={selectedPatient?.condition || "General Workout"}
            />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Active Patients</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {patients.filter(p => p.status === 'active').length}
                </div>
                <p className="text-sm text-gray-600">Currently in treatment</p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2">Average Progress</h3>
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(patients.reduce((acc, p) => acc + p.progress, 0) / patients.length)}%
                </div>
                <p className="text-sm text-gray-600">Overall patient progress</p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2">Average Pain Level</h3>
                <div className="text-3xl font-bold text-red-600">
                  {Math.round(patients.reduce((acc, p) => acc + p.painLevel, 0) / patients.length)}/10
                </div>
                <p className="text-sm text-gray-600">Current pain levels</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {patients.map(patient => (
                  <div key={patient.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-gray-600 ml-2">completed exercise session</span>
                    </div>
                    <span className="text-sm text-gray-500">{patient.lastSession}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
