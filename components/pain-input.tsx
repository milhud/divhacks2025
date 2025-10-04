"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PainInputProps {
  onPainSubmit: (painData: PainData) => void
  onMovementHurt: (movementData: MovementHurtData) => void
}

interface PainData {
  level: number
  location: string[]
  type: string
  triggers: string[]
  notes: string
}

interface MovementHurtData {
  movement: string
  painLevel: number
  bodyPart: string
  description: string
}

export function PainInput({ onPainSubmit, onMovementHurt }: PainInputProps) {
  const [currentPain, setCurrentPain] = useState({
    level: 0,
    location: [] as string[],
    type: "",
    triggers: [] as string[],
    notes: ""
  })

  const [movementHurt, setMovementHurt] = useState({
    movement: "",
    painLevel: 0,
    bodyPart: "",
    description: ""
  })

  const bodyParts = [
    "Head", "Neck", "Shoulder (Left)", "Shoulder (Right)", "Upper Back",
    "Lower Back", "Chest", "Abdomen", "Hip (Left)", "Hip (Right)",
    "Thigh (Left)", "Thigh (Right)", "Knee (Left)", "Knee (Right)",
    "Calf (Left)", "Calf (Right)", "Ankle (Left)", "Ankle (Right)",
    "Foot (Left)", "Foot (Right)", "Wrist (Left)", "Wrist (Right)",
    "Elbow (Left)", "Elbow (Right)", "Hand (Left)", "Hand (Right)"
  ]

  const painTypes = [
    "Sharp", "Dull", "Aching", "Burning", "Stabbing", "Throbbing",
    "Cramping", "Stiffness", "Tingling", "Numbness"
  ]

  const commonTriggers = [
    "Sitting", "Standing", "Walking", "Running", "Lifting", "Bending",
    "Twisting", "Reaching", "Sleeping", "Exercise", "Stress", "Weather"
  ]

  const commonMovements = [
    "Squat", "Lunge", "Push-up", "Plank", "Deadlift", "Overhead Press",
    "Row", "Pull-up", "Bicep Curl", "Tricep Extension", "Shoulder Press",
    "Lateral Raise", "Chest Press", "Leg Press", "Calf Raise", "Hip Thrust"
  ]

  const handlePainSubmit = () => {
    onPainSubmit(currentPain)
    setCurrentPain({
      level: 0,
      location: [],
      type: "",
      triggers: [],
      notes: ""
    })
  }

  const handleMovementHurtSubmit = () => {
    onMovementHurt(movementHurt)
    setMovementHurt({
      movement: "",
      painLevel: 0,
      bodyPart: "",
      description: ""
    })
  }

  const toggleLocation = (location: string) => {
    setCurrentPain(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(l => l !== location)
        : [...prev.location, location]
    }))
  }

  const toggleTrigger = (trigger: string) => {
    setCurrentPain(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Current Pain Assessment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Pain Assessment</h3>
        
        {/* Pain Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Pain Level (0-10): <span className={`font-bold ${
              currentPain.level === 0 ? 'text-green-600' :
              currentPain.level <= 3 ? 'text-yellow-500' :
              currentPain.level <= 6 ? 'text-orange-500' :
              currentPain.level <= 8 ? 'text-red-500' :
              'text-red-700'
            }`}>
              {currentPain.level}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={currentPain.level}
            onChange={(e) => setCurrentPain(prev => ({ ...prev, level: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                #10b981 0%, 
                #10b981 30%, 
                #f59e0b 30%, 
                #f59e0b 60%, 
                #f97316 60%, 
                #f97316 80%, 
                #ef4444 80%, 
                #ef4444 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span className={currentPain.level === 0 ? 'font-bold text-green-600' : ''}>No Pain</span>
            <span className={currentPain.level <= 3 ? 'font-bold text-yellow-500' : ''}>Mild</span>
            <span className={currentPain.level <= 6 ? 'font-bold text-orange-500' : ''}>Moderate</span>
            <span className={currentPain.level <= 8 ? 'font-bold text-red-500' : ''}>Severe</span>
            <span className={currentPain.level > 8 ? 'font-bold text-red-700' : ''}>Unbearable</span>
          </div>
        </div>

        {/* Pain Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Pain Location (Select all that apply)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {bodyParts.map(part => (
              <button
                key={part}
                onClick={() => toggleLocation(part)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  currentPain.location.includes(part)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>

        {/* Pain Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Pain Type</label>
          <select
            value={currentPain.type}
            onChange={(e) => setCurrentPain(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select pain type</option>
            {painTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Pain Triggers */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What triggers your pain? (Select all that apply)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonTriggers.map(trigger => (
              <button
                key={trigger}
                onClick={() => toggleTrigger(trigger)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  currentPain.triggers.includes(trigger)
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {trigger}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Additional Notes</label>
          <textarea
            value={currentPain.notes}
            onChange={(e) => setCurrentPain(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Describe your pain in more detail..."
            className="w-full p-3 border border-gray-300 rounded-lg h-20"
          />
        </div>

        <Button onClick={handlePainSubmit} className="w-full">
          Submit Pain Assessment
        </Button>
      </Card>

      {/* Movement Hurt Tracking */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Movement Hurt Tracking</h3>
        
        {/* Movement Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Which movement hurts?</label>
          <select
            value={movementHurt.movement}
            onChange={(e) => setMovementHurt(prev => ({ ...prev, movement: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select movement</option>
            {commonMovements.map(movement => (
              <option key={movement} value={movement}>{movement}</option>
            ))}
          </select>
        </div>

        {/* Pain Level for Movement */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Pain Level during this movement (0-10): <span className={`font-bold ${
              movementHurt.painLevel === 0 ? 'text-green-600' :
              movementHurt.painLevel <= 3 ? 'text-yellow-500' :
              movementHurt.painLevel <= 6 ? 'text-orange-500' :
              movementHurt.painLevel <= 8 ? 'text-red-500' :
              'text-red-700'
            }`}>
              {movementHurt.painLevel}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={movementHurt.painLevel}
            onChange={(e) => setMovementHurt(prev => ({ ...prev, painLevel: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                #10b981 0%, 
                #10b981 30%, 
                #f59e0b 30%, 
                #f59e0b 60%, 
                #f97316 60%, 
                #f97316 80%, 
                #ef4444 80%, 
                #ef4444 100%)`
            }}
          />
        </div>

        {/* Body Part Affected */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Which body part is affected?</label>
          <select
            value={movementHurt.bodyPart}
            onChange={(e) => setMovementHurt(prev => ({ ...prev, bodyPart: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select body part</option>
            {bodyParts.map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Describe the pain during this movement</label>
          <textarea
            value={movementHurt.description}
            onChange={(e) => setMovementHurt(prev => ({ ...prev, description: e.target.value }))}
            placeholder="When does it hurt? What does it feel like? Does it get better or worse?"
            className="w-full p-3 border border-gray-300 rounded-lg h-20"
          />
        </div>

        <Button onClick={handleMovementHurtSubmit} className="w-full">
          Submit Movement Pain
        </Button>
      </Card>
    </div>
  )
}
