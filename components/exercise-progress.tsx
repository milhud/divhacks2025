"use client"

import { useState, useEffect } from "react"

interface AssignedExercise {
  id: string
  name: string
  emoji: string
  sets: number
  reps: number
  completedSets: number
  targetFormScore: number
  isCompleted: boolean
}

interface ExerciseProgressProps {
  onExerciseComplete?: (exerciseId: string) => void
  onProgressUpdate?: (exerciseId: string, progress: number) => void
}

export function ExerciseProgress({ onExerciseComplete, onProgressUpdate }: ExerciseProgressProps) {
  const [assignedExercises, setAssignedExercises] = useState<AssignedExercise[]>([
    {
      id: 'squat',
      name: 'Squats',
      emoji: '🏋️',
      sets: 3,
      reps: 15,
      completedSets: 2,
      targetFormScore: 80,
      isCompleted: false
    },
    {
      id: 'bicep_curl',
      name: 'Bicep Curls',
      emoji: '💪',
      sets: 3,
      reps: 12,
      completedSets: 0,
      targetFormScore: 75,
      isCompleted: false
    },
    {
      id: 'pushup',
      name: 'Pushups',
      emoji: '🔥',
      sets: 2,
      reps: 10,
      completedSets: 1,
      targetFormScore: 75,
      isCompleted: false
    },
    {
      id: 'plank',
      name: 'Plank Hold',
      emoji: '🧘',
      sets: 3,
      reps: 30, // seconds
      completedSets: 0,
      targetFormScore: 85,
      isCompleted: false
    }
  ])

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('exerciseProgress')
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setAssignedExercises(parsed)
      } catch (e) {
        console.error('Error loading exercise progress:', e)
      }
    }
  }, [])

  // Listen for progress updates from AI analysis
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { exerciseId, formScore, repCount } = event.detail
      updateExerciseProgress(exerciseId, formScore, repCount)
    }

    window.addEventListener('exerciseProgressUpdate', handleProgressUpdate as EventListener)
    
    return () => {
      window.removeEventListener('exerciseProgressUpdate', handleProgressUpdate as EventListener)
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('exerciseProgress', JSON.stringify(assignedExercises))
  }, [assignedExercises])

  const updateExerciseProgress = (exerciseId: string, formScore: number, repCount: number) => {
    setAssignedExercises(prev => {
      return prev.map(exercise => {
        if (exercise.id === exerciseId) {
          const newCompletedSets = Math.min(
            exercise.completedSets + (formScore >= exercise.targetFormScore ? 1 : 0),
            exercise.sets
          )
          
          const isCompleted = newCompletedSets >= exercise.sets
          const progress = (newCompletedSets / exercise.sets) * 100

          // Call callbacks
          if (isCompleted && !exercise.isCompleted) {
            onExerciseComplete?.(exerciseId)
          }
          onProgressUpdate?.(exerciseId, progress)

          return {
            ...exercise,
            completedSets: newCompletedSets,
            isCompleted,
            lastFormScore: formScore,
            lastRepCount: repCount
          }
        }
        return exercise
      })
    })
  }

  const resetExercise = (exerciseId: string) => {
    setAssignedExercises(prev => {
      return prev.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            completedSets: 0,
            isCompleted: false
          }
        }
        return exercise
      })
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getProgressTextColor = (progress: number) => {
    if (progress === 100) return 'text-green-600'
    if (progress >= 75) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    if (progress >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      {assignedExercises.map((exercise) => {
        const progress = (exercise.completedSets / exercise.sets) * 100
        
        return (
          <div 
            key={exercise.id}
            className={`border rounded-lg p-4 transition-all ${
              exercise.isCompleted 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{exercise.emoji}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {exercise.name}
                    {exercise.isCompleted && <span className="text-green-600">✓</span>}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {exercise.sets} sets × {exercise.reps} {exercise.id === 'plank' ? 'seconds' : 'reps'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className={`text-lg font-bold ${getProgressTextColor(progress)}`}>
                  {exercise.completedSets}/{exercise.sets} sets
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Completed: {exercise.completedSets} sets
                {exercise.lastFormScore && (
                  <span className="ml-2 text-blue-600">
                    (Last: {exercise.lastFormScore}% form)
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                {exercise.isCompleted ? (
                  <span className="text-green-600 font-semibold">✓ Complete!</span>
                ) : (
                  <span>Remaining: {exercise.sets - exercise.completedSets} sets</span>
                )}
                <button
                  onClick={() => resetExercise(exercise.id)}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Export the update function for use in other components
export const updateExerciseProgress = (exerciseId: string, formScore: number, repCount: number) => {
  // This will be called from the AI analysis component
  const event = new CustomEvent('exerciseProgressUpdate', {
    detail: { exerciseId, formScore, repCount }
  })
  window.dispatchEvent(event)
}
