"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveCameraFeed } from "@/components/live-camera-feed"
import { PainInput } from "@/components/pain-input"
import Link from "next/link"

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

export default function ProviderDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [activeTab, setActiveTab] = useState<'patients' | 'exercises' | 'monitoring' | 'reports'>('patients')
  const [showPainInput, setShowPainInput] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    setPatients([
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        condition: 'Lower back pain',
        assignedExercises: [],
        lastSession: '2025-01-15',
        progress: 75,
        painLevel: 3,
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        condition: 'Knee rehabilitation',
        assignedExercises: [],
        lastSession: '2025-01-14',
        progress: 60,
        painLevel: 2,
        status: 'active'
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike@example.com',
        condition: 'Shoulder impingement',
        assignedExercises: [],
        lastSession: '2025-01-13',
        progress: 40,
        painLevel: 5,
        status: 'active'
      }
    ])

    setExercises([
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
    ])
  }, [])

  const handleExerciseAssign = (exerciseId: string, patientId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    if (exercise && selectedPatient) {
      setPatients(prev => prev.map(patient => 
        patient.id === patientId 
          ? { 
              ...patient, 
              assignedExercises: [...patient.assignedExercises, { ...exercise, isAssigned: true }]
            }
          : patient
      ))
    }
  }

  const handlePainSubmit = (painData: any) => {
    console.log('Pain data submitted:', painData)
    // Handle pain data submission
  }

  const handleMovementHurt = (movementData: any) => {
    console.log('Movement hurt data submitted:', movementData)
    // Handle movement hurt data
  }

  const handleAnalysisComplete = (analysis: any) => {
    console.log('Live analysis completed:', analysis)
    // Handle live analysis data
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
            <span className="text-sm text-gray-600">Dr. Sarah Wilson, PT</span>
            <Button variant="outline" size="sm">
              Settings
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
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${patient.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Pain Level: {patient.painLevel}/10</span>
                    <span>Last Session: {patient.lastSession}</span>
                  </div>

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
                      onClick={() => selectedPatient && handleExerciseAssign(exercise.id, selectedPatient.id)}
                      disabled={!selectedPatient}
                    >
                      Assign to Patient
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
                <Button variant="outline">
                  Select Patient
                </Button>
              </div>
            </div>

            {showPainInput && (
              <PainInput 
                onPainSubmit={handlePainSubmit}
                onMovementHurt={handleMovementHurt}
              />
            )}

            <LiveCameraFeed 
              onAnalysisComplete={handleAnalysisComplete}
              isProviderMode={true}
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
