"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { Avatar } from "@/components/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LiveCameraFeed } from "@/components/live-camera-feed"

// Mock data for demonstration
const mockPatients = [
  {
    id: '1',
    name: 'John Smith',
    age: 45,
    condition: 'Lower Back Pain',
    status: 'active',
    progress: 75,
    painLevel: 3,
    lastSession: '2 hours ago',
    assignedExercises: ['Lower Back Stretch', 'Core Strengthening']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 32,
    condition: 'Knee Rehabilitation',
    status: 'active',
    progress: 60,
    painLevel: 4,
    lastSession: '1 day ago',
    assignedExercises: ['Quad Strengthening', 'Knee Mobility']
  },
  {
    id: '3',
    name: 'Mike Davis',
    age: 28,
    condition: 'Shoulder Impingement',
    status: 'active',
    progress: 85,
    painLevel: 2,
    lastSession: '3 hours ago',
    assignedExercises: ['Shoulder Mobility', 'Rotator Cuff Strengthening']
  }
]

const mockExercises = [
  {
    id: '1',
    name: 'Squat Assessment',
    description: 'Basic squat movement analysis for lower body strength and mobility',
    difficulty: 'beginner',
    bodyPart: 'Lower Body',
    sets: 3,
    reps: 10,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending at hips and knees',
      'Keep your chest up and knees tracking over toes',
      'Return to starting position'
    ]
  },
  {
    id: '2',
    name: 'Shoulder Mobility Check',
    description: 'Assess shoulder range of motion and identify restrictions',
    difficulty: 'beginner',
    bodyPart: 'Upper Body',
    sets: 2,
    reps: 8,
    instructions: [
      'Raise arms overhead slowly',
      'Hold for 2 seconds at the top',
      'Lower with control',
      'Focus on smooth movement'
    ]
  },
  {
    id: '3',
    name: 'Balance Assessment',
    description: 'Single leg balance test for stability and proprioception',
    difficulty: 'intermediate',
    bodyPart: 'Full Body',
    sets: 3,
    reps: 30,
    instructions: [
      'Stand on one leg',
      'Hold position for 30 seconds',
      'Keep eyes focused ahead',
      'Switch legs and repeat'
    ]
  }
]

export default function ProvidersPage() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [activeTab, setActiveTab] = useState('patients')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedExercise, setSelectedExercise] = useState<any>(null)
  const [showPainInput, setShowPainInput] = useState(false)
  const [patients, setPatients] = useState(mockPatients)
  const [exercises] = useState(mockExercises)

  const handleAnalysisComplete = (analysis: any) => {
    console.log('Analysis completed:', analysis)
    // Handle analysis results for provider dashboard
  }

  const handlePainSubmit = (painData: any) => {
    console.log('Pain data submitted:', painData)
    // Handle pain assessment data
  }

  const handleMovementHurt = (movementData: any) => {
    console.log('Movement hurt reported:', movementData)
    // Handle movement-specific pain reports
  }

  const handleExerciseAssign = () => {
    if (selectedExercise && selectedPatient) {
      // In a real app, this would make an API call
      console.log(`Assigning ${selectedExercise.name} to ${selectedPatient.name}`)
      alert(`Successfully assigned ${selectedExercise.name} to ${selectedPatient.name}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">🏥</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Spottr Provider
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/providers" className="text-sm text-foreground font-semibold transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Patient Portal
            </Link>
          </nav>
          {user ? (
            <div className="flex items-center gap-4">
              <Avatar name={user?.user_metadata?.full_name || user?.email || "Provider"} size="sm" />
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-gradient-to-r from-muted to-muted/80 hover:from-muted/80 hover:to-muted/60 rounded-xl text-sm font-medium transition-all text-foreground shadow-md"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg"
            >
              Provider Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Healthcare Provider Dashboard
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Monitor patients, assign exercises, and track rehabilitation progress in real-time
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 bg-muted/30 p-2 rounded-xl shadow-inner">
            {[
              { id: 'patients', label: '👥 Patients', icon: '👥' },
              { id: 'exercises', label: '💪 Exercise Library', icon: '💪' },
              { id: 'monitoring', label: '📹 Live Monitoring', icon: '📹' },
              { id: 'reports', label: '📊 Reports', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg scale-105'
                    : 'bg-card hover:bg-card/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(patient => (
                  <Card key={patient.id} className="p-6 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{patient.name}</h3>
                        <p className="text-muted-foreground text-sm">Age: {patient.age}</p>
                        <p className="text-sm font-medium text-primary">{patient.condition}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                        patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold text-primary">{patient.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${patient.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pain Level</span>
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                          patient.painLevel <= 3 ? 'bg-green-100 text-green-800' :
                          patient.painLevel <= 6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {patient.painLevel}/10
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Last Session: </span>
                        <span className="text-sm text-muted-foreground">{patient.lastSession}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="border-2">
                        Message
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Library Tab */}
          {activeTab === 'exercises' && (
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-r from-primary/10 via-secondary/8 to-accent/10 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-foreground">📋 Assign Exercise</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Select Exercise</label>
                    <select 
                      value={selectedExercise?.id || ''}
                      onChange={(e) => {
                        const exercise = exercises.find(ex => ex.id === e.target.value)
                        setSelectedExercise(exercise || null)
                      }}
                      className="w-full px-3 py-2 border-2 border-border rounded-lg bg-card focus:border-primary transition-colors"
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
                      className="w-full px-3 py-2 border-2 border-border rounded-lg bg-card focus:border-primary transition-colors"
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
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                  >
                    Assign Exercise
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exercises.map(exercise => (
                  <Card key={exercise.id} className="p-6 bg-gradient-to-br from-card via-card to-secondary/5 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{exercise.name}</h3>
                        <p className="text-muted-foreground text-sm">{exercise.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                            exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {exercise.difficulty}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                            {exercise.bodyPart}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Instructions:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {exercise.instructions.map((instruction, index) => (
                            <li key={index} className="text-xs">{instruction}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Sets:</strong> {exercise.sets} | <strong className="text-foreground">Reps:</strong> {exercise.reps}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        Select for Assignment
                      </Button>
                      <Button size="sm" variant="outline" className="border-2">
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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  🔴 Live Patient Monitoring
                </h2>
                <div className="flex gap-2">
                  <select 
                    value={selectedPatient?.id || ''}
                    onChange={(e) => {
                      const patient = patients.find(p => p.id === e.target.value)
                      setSelectedPatient(patient || null)
                    }}
                    className="px-3 py-2 border-2 border-border rounded-lg bg-card focus:border-primary transition-colors"
                  >
                    <option value="">Select Patient to Monitor</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <LiveCameraFeed 
                onAnalysisComplete={handleAnalysisComplete}
                isProviderMode={true}
                exerciseType={selectedPatient?.condition || "General Workout"}
              />
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                📈 Reports & Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
                  <h3 className="font-bold mb-2 text-blue-800">👥 Active Patients</h3>
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    {patients.filter(p => p.status === 'active').length}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Currently in treatment</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
                  <h3 className="font-bold mb-2 text-green-800">📊 Average Progress</h3>
                  <div className="text-4xl font-black text-green-600 mb-2">
                    {Math.round(patients.reduce((acc, p) => acc + p.progress, 0) / patients.length)}%
                  </div>
                  <p className="text-sm text-green-700 font-medium">Overall patient progress</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
                  <h3 className="font-bold mb-2 text-red-800">😣 Average Pain Level</h3>
                  <div className="text-4xl font-black text-red-600 mb-2">
                    {Math.round(patients.reduce((acc, p) => acc + p.painLevel, 0) / patients.length)}/10
                  </div>
                  <p className="text-sm text-red-700 font-medium">Current pain levels</p>
                </Card>
              </div>

              <Card className="p-6 bg-gradient-to-br from-card via-card to-accent/5 shadow-lg">
                <h3 className="font-bold mb-4 text-foreground">📋 Recent Activity</h3>
                <div className="space-y-3">
                  {patients.map(patient => (
                    <div key={patient.id} className="flex justify-between items-center py-3 border-b border-border/50">
                      <div>
                        <span className="font-semibold text-foreground">{patient.name}</span>
                        <span className="text-muted-foreground ml-2">completed exercise session</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">{patient.lastSession}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative my-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-xl z-10 text-foreground hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
}
