"use client"

import { useState, useEffect } from "react"
import { AILiveCamera } from "./ai-live-camera"
import { Card } from "./ui/card"
import { Button } from "./ui/button"

interface RehabExercise {
  id: string
  name: string
  emoji: string
  description: string
  sets: number
  reps: number
  duration?: number // in seconds for time-based exercises
  targetFormScore: number
  instructions: string[]
  motionControl: {
    primaryAngle: string
    targetRange: [number, number]
    formCues: string[]
  }
}

interface RehabExercisesProps {
  onExerciseComplete?: (exerciseId: string, progress: number) => void
  onProgressUpdate?: (exerciseId: string, progress: number) => void
}

export function RehabExercises({ onExerciseComplete, onProgressUpdate }: RehabExercisesProps) {
  const [selectedExercise, setSelectedExercise] = useState<RehabExercise | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, number>>({})
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])

  const rehabExercises: RehabExercise[] = [
    {
      id: 'knee_flexion',
      name: 'Knee Flexion',
      emoji: '🦵',
      description: 'Gentle knee bending for mobility and strength',
      sets: 3,
      reps: 10,
      targetFormScore: 75,
      instructions: [
        'Sit or lie down comfortably',
        'Slowly bend your knee as far as comfortable',
        'Hold for 2 seconds',
        'Slowly straighten your leg',
        'Keep movements controlled and smooth'
      ],
      motionControl: {
        primaryAngle: 'knee',
        targetRange: [60, 120],
        formCues: ['Keep hip stable', 'Control the movement', 'Don\'t force the range']
      }
    },
    {
      id: 'shoulder_abduction',
      name: 'Shoulder Abduction',
      emoji: '🤲',
      description: 'Lifting arm to the side for shoulder mobility',
      sets: 2,
      reps: 8,
      targetFormScore: 80,
      instructions: [
        'Stand or sit with good posture',
        'Start with arm at your side',
        'Slowly lift arm out to the side',
        'Lift to shoulder height or as comfortable',
        'Lower slowly and controlled'
      ],
      motionControl: {
        primaryAngle: 'shoulder',
        targetRange: [0, 90],
        formCues: ['Keep shoulder blade stable', 'Don\'t shrug', 'Move slowly']
      }
    },
    {
      id: 'ankle_pumps',
      name: 'Ankle Pumps',
      emoji: '👣',
      description: 'Ankle movement for circulation and mobility',
      sets: 3,
      reps: 15,
      targetFormScore: 70,
      instructions: [
        'Sit or lie down comfortably',
        'Point your toes away from you',
        'Then pull your toes toward you',
        'Keep the movement smooth',
        'Don\'t force the range of motion'
      ],
      motionControl: {
        primaryAngle: 'ankle',
        targetRange: [80, 120],
        formCues: ['Keep leg still', 'Move only the ankle', 'Smooth motion']
      }
    },
    {
      id: 'hip_flexion',
      name: 'Hip Flexion',
      emoji: '🦴',
      description: 'Lifting leg for hip mobility and strength',
      sets: 2,
      reps: 12,
      targetFormScore: 75,
      instructions: [
        'Lie on your back or sit in a chair',
        'Slowly lift one knee toward your chest',
        'Hold for 2 seconds',
        'Lower slowly',
        'Keep your back straight'
      ],
      motionControl: {
        primaryAngle: 'hip',
        targetRange: [90, 150],
        formCues: ['Keep back straight', 'Control the movement', 'Don\'t arch back']
      }
    },
    {
      id: 'wrist_flexion',
      name: 'Wrist Flexion',
      emoji: '✋',
      description: 'Wrist bending for flexibility and strength',
      sets: 2,
      reps: 10,
      targetFormScore: 70,
      instructions: [
        'Sit with forearm supported',
        'Bend wrist up as far as comfortable',
        'Hold for 2 seconds',
        'Bend wrist down as far as comfortable',
        'Keep movements controlled'
      ],
      motionControl: {
        primaryAngle: 'wrist',
        targetRange: [60, 120],
        formCues: ['Keep forearm still', 'Move only the wrist', 'Smooth motion']
      }
    },
    {
      id: 'neck_rotation',
      name: 'Neck Rotation',
      emoji: '👤',
      description: 'Gentle neck turning for mobility',
      sets: 2,
      reps: 8,
      targetFormScore: 75,
      instructions: [
        'Sit or stand with good posture',
        'Slowly turn head to the right',
        'Hold for 3 seconds',
        'Return to center',
        'Repeat to the left'
      ],
      motionControl: {
        primaryAngle: 'neck',
        targetRange: [0, 45],
        formCues: ['Keep shoulders level', 'Move slowly', 'Don\'t force the turn']
      }
    }
  ]

  const handleAnalysisComplete = (analysis: any) => {
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 5))
    
    if (selectedExercise && analysis.formScore >= selectedExercise.targetFormScore) {
      const currentProgress = exerciseProgress[selectedExercise.id] || 0
      const newProgress = Math.min(currentProgress + 1, selectedExercise.sets * selectedExercise.reps)
      
      setExerciseProgress(prev => ({
        ...prev,
        [selectedExercise.id]: newProgress
      }))
      
      onProgressUpdate?.(selectedExercise.id, newProgress)
      
      // Check if exercise is complete
      const totalReps = selectedExercise.sets * selectedExercise.reps
      if (newProgress >= totalReps) {
        onExerciseComplete?.(selectedExercise.id, 100)
        setShowCamera(false)
        setSelectedExercise(null)
      }
    }
  }

  const startExercise = (exercise: RehabExercise) => {
    setSelectedExercise(exercise)
    setShowCamera(true)
  }

  const getProgressPercentage = (exerciseId: string) => {
    const exercise = rehabExercises.find(e => e.id === exerciseId)
    if (!exercise) return 0
    
    const currentProgress = exerciseProgress[exerciseId] || 0
    const totalReps = exercise.sets * exercise.reps
    return Math.round((currentProgress / totalReps) * 100)
  }

  const resetExercise = (exerciseId: string) => {
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseId]: 0
    }))
  }

  return (
    <div className="space-y-6">
      {!showCamera ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🏥 Rehab Exercises</h2>
            <p className="text-gray-600">Select an exercise to begin your rehabilitation session</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rehabExercises.map((exercise) => {
              const progress = getProgressPercentage(exercise.id)
              const isCompleted = progress >= 100
              
              return (
                <Card key={exercise.id} className={`p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{exercise.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                      </div>
                    </div>
                    {isCompleted && <span className="text-green-600 text-xl">✓</span>}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{exerciseProgress[exercise.id] || 0}/{exercise.sets * exercise.reps} reps</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Target:</strong> {exercise.sets} sets × {exercise.reps} reps
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Form Score:</strong> {exercise.targetFormScore}%+
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startExercise(exercise)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={isCompleted}
                    >
                      {isCompleted ? 'Completed' : 'Start Exercise'}
                    </Button>
                    <Button
                      onClick={() => resetExercise(exercise.id)}
                      variant="outline"
                      size="sm"
                    >
                      Reset
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedExercise?.emoji} {selectedExercise?.name}
              </h2>
              <p className="text-gray-600">{selectedExercise?.description}</p>
            </div>
            <Button
              onClick={() => setShowCamera(false)}
              variant="outline"
            >
              Back to Exercises
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AILiveCamera
                onAnalysisComplete={handleAnalysisComplete}
                exerciseType={selectedExercise?.id}
                showExerciseSelector={false}
              />
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Exercise Instructions</h3>
                <ol className="text-sm text-gray-600 space-y-2">
                  {selectedExercise?.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Progress</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {exerciseProgress[selectedExercise?.id || ''] || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    of {selectedExercise ? selectedExercise.sets * selectedExercise.reps : 0} reps
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(selectedExercise?.id || '')}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Form Cues</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedExercise?.motionControl.formCues.map((cue, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-600">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

