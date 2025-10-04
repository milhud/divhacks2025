import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Comprehensive rehabilitation exercise library
const exerciseLibrary = {
  "knee_rehabilitation": [
    {
      id: "knee_001",
      name: "Quad Sets",
      description: "Isometric quadriceps strengthening exercise",
      difficulty: "beginner",
      duration: "10-15 minutes",
      equipment: "none",
      instructions: [
        "Sit or lie down with legs extended",
        "Tighten quadriceps muscle by pushing knee down into surface",
        "Hold for 5-10 seconds, then relax",
        "Repeat 10-15 times per leg"
      ],
      precautions: "Stop if pain increases beyond 3/10",
      progressions: ["Add resistance band", "Increase hold time to 15 seconds"],
      video_url: "https://example.com/quad-sets",
      body_parts: ["knee", "quadriceps"],
      pain_level: "0-2/10"
    },
    {
      id: "knee_002", 
      name: "Straight Leg Raises",
      description: "Hip flexor and quadriceps strengthening",
      difficulty: "beginner",
      duration: "10-15 minutes",
      equipment: "none",
      instructions: [
        "Lie on back with one leg bent, other straight",
        "Lift straight leg 6-8 inches off ground",
        "Hold for 3-5 seconds, lower slowly",
        "Repeat 10-15 times per leg"
      ],
      precautions: "Keep back flat, avoid arching",
      progressions: ["Add ankle weights", "Increase hold time"],
      video_url: "https://example.com/straight-leg-raises",
      body_parts: ["knee", "hip", "quadriceps"],
      pain_level: "0-3/10"
    }
  ],
  "shoulder_rehabilitation": [
    {
      id: "shoulder_001",
      name: "Pendulum Exercises",
      description: "Gentle shoulder mobility and pain relief",
      difficulty: "beginner", 
      duration: "5-10 minutes",
      equipment: "table or chair",
      instructions: [
        "Lean forward, support with unaffected arm on table",
        "Let affected arm hang freely",
        "Gently swing arm in small circles",
        "Progress to larger circles as tolerated"
      ],
      precautions: "Stop if sharp pain occurs",
      progressions: ["Add light weight", "Increase range of motion"],
      video_url: "https://example.com/pendulum-exercises",
      body_parts: ["shoulder", "rotator_cuff"],
      pain_level: "0-2/10"
    },
    {
      id: "shoulder_002",
      name: "Wall Slides",
      description: "Shoulder blade mobility and strengthening",
      difficulty: "intermediate",
      duration: "10-15 minutes", 
      equipment: "wall",
      instructions: [
        "Stand with back against wall",
        "Place arms against wall at shoulder height",
        "Slowly slide arms up overhead",
        "Return to starting position"
      ],
      precautions: "Keep shoulder blades against wall",
      progressions: ["Add resistance band", "Increase repetitions"],
      video_url: "https://example.com/wall-slides",
      body_parts: ["shoulder", "scapula", "upper_back"],
      pain_level: "0-4/10"
    }
  ],
  "back_rehabilitation": [
    {
      id: "back_001",
      name: "Cat-Cow Stretch",
      description: "Spinal mobility and pain relief",
      difficulty: "beginner",
      duration: "5-10 minutes",
      equipment: "none",
      instructions: [
        "Start on hands and knees",
        "Arch back and look up (cow)",
        "Round spine and tuck chin (cat)",
        "Move slowly between positions"
      ],
      precautions: "Move within pain-free range",
      progressions: ["Hold each position longer", "Add gentle rotation"],
      video_url: "https://example.com/cat-cow-stretch",
      body_parts: ["spine", "lower_back", "upper_back"],
      pain_level: "0-3/10"
    },
    {
      id: "back_002",
      name: "Bird Dog",
      description: "Core stability and back strengthening",
      difficulty: "intermediate",
      duration: "10-15 minutes",
      equipment: "none",
      instructions: [
        "Start on hands and knees",
        "Extend opposite arm and leg",
        "Hold for 3-5 seconds",
        "Return to start, switch sides"
      ],
      precautions: "Keep core engaged, avoid arching back",
      progressions: ["Increase hold time", "Add resistance"],
      video_url: "https://example.com/bird-dog",
      body_parts: ["core", "lower_back", "glutes"],
      pain_level: "0-4/10"
    }
  ],
  "ankle_rehabilitation": [
    {
      id: "ankle_001",
      name: "Ankle Alphabet",
      description: "Ankle mobility and range of motion",
      difficulty: "beginner",
      duration: "5-10 minutes",
      equipment: "none",
      instructions: [
        "Sit with leg extended",
        "Trace alphabet letters with big toe",
        "Move ankle through full range of motion",
        "Complete entire alphabet"
      ],
      precautions: "Stop if pain increases",
      progressions: ["Add resistance band", "Increase speed"],
      video_url: "https://example.com/ankle-alphabet",
      body_parts: ["ankle", "foot"],
      pain_level: "0-2/10"
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bodyPart = searchParams.get('bodyPart')
    const difficulty = searchParams.get('difficulty')
    const painLevel = searchParams.get('painLevel')

    let exercises = []

    // Filter exercises based on parameters
    if (bodyPart) {
      const bodyPartKey = bodyPart.toLowerCase().replace(' ', '_')
      exercises = exerciseLibrary[bodyPartKey] || []
    } else {
      // Return all exercises if no specific body part
      exercises = Object.values(exerciseLibrary).flat()
    }

    // Filter by difficulty
    if (difficulty) {
      exercises = exercises.filter(ex => ex.difficulty === difficulty)
    }

    // Filter by pain level
    if (painLevel) {
      const maxPain = parseInt(painLevel)
      exercises = exercises.filter(ex => {
        const exerciseMaxPain = parseInt(ex.pain_level.split('-')[1].split('/')[0])
        return exerciseMaxPain <= maxPain
      })
    }

    return NextResponse.json({
      exercises: exercises,
      count: exercises.length,
      filters: {
        bodyPart: bodyPart || 'all',
        difficulty: difficulty || 'all',
        painLevel: painLevel || 'all'
      }
    })

  } catch (error) {
    console.error('Fetch exercises error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      patientId, 
      exerciseId, 
      sessionData, 
      painLevel, 
      difficulty, 
      notes 
    } = await request.json()

    if (!patientId || !exerciseId) {
      return NextResponse.json(
        { error: 'Patient ID and exercise ID are required' },
        { status: 400 }
      )
    }

    // Store exercise session in database
    const { data: session, error } = await supabaseAdmin
      .from('exercise_sessions')
      .insert({
        patient_id: patientId,
        exercise_id: exerciseId,
        session_data: sessionData,
        pain_level: painLevel,
        difficulty: difficulty,
        notes: notes,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to record exercise session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Exercise session recorded successfully',
      session: session
    })

  } catch (error) {
    console.error('Record exercise error:', error)
    return NextResponse.json(
      { error: 'Failed to record exercise session' },
      { status: 500 }
    )
  }
}
