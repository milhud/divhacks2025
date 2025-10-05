import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/providers/exercises?search=quad&filter=difficulty:beginner
 * Fetch exercises from library
 * 
 * Feature #4: Exercise Library
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const filterParam = searchParams.get('filter')

    console.log('[EXERCISES API] GET request received')
    console.log('[EXERCISES API] Search:', search)
    console.log('[EXERCISES API] Filter:', filterParam)

    // Start building query
    let query = supabaseAdmin
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })

    // Apply search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      console.log('[EXERCISES API] Applied search filter:', search)
    }

    // Apply custom filters (e.g., difficulty:beginner, type:squat)
    if (filterParam) {
      const filters = filterParam.split(',')
      filters.forEach(filter => {
        const [key, value] = filter.split(':')
        if (key && value) {
          query = query.eq(key.trim(), value.trim())
          console.log('[EXERCISES API] Applied filter:', key, '=', value)
        }
      })
    }

    const { data: exercises, error } = await query

    if (error) {
      console.error('[EXERCISES API] Database error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch exercises',
          debug: {
            message: error.message,
            details: error.details
          }
        },
        { status: 500 }
      )
    }

    console.log('[EXERCISES API] Found exercises:', exercises?.length || 0)

    return NextResponse.json({
      success: true,
      exercises: exercises || [],
      count: exercises?.length || 0
    })

  } catch (error: any) {
    console.error('[EXERCISES API] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: {
          message: error.message
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/providers/exercises
 * Create custom exercise
 * 
 * Feature #4: Exercise Library
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      emoji,
      description,
      instructions,
      difficulty,
      targetMuscleGroups,
      equipmentNeeded,
      isRehabExercise,
      durationSeconds
    } = body

    console.log('[EXERCISES API] POST request received')
    console.log('[EXERCISES API] Creating exercise:', name)

    // Validate required fields
    if (!name || !type) {
      console.error('[EXERCISES API] Missing required fields')
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Create exercise
    const { data: exercise, error } = await supabaseAdmin
      .from('exercises')
      .insert({
        name: name.trim(),
        type,
        emoji: emoji || '💪',
        description: description?.trim() || '',
        instructions: instructions || [],
        difficulty: difficulty || 'beginner',
        target_muscle_groups: targetMuscleGroups || [],
        equipment_needed: equipmentNeeded || [],
        is_rehab_exercise: isRehabExercise || false,
        duration_seconds: durationSeconds || null
      })
      .select()
      .single()

    if (error) {
      console.error('[EXERCISES API] Error creating exercise:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create exercise',
          debug: {
            message: error.message,
            details: error.details
          }
        },
        { status: 500 }
      )
    }

    console.log('[EXERCISES API] Exercise created successfully:', exercise.id)

    return NextResponse.json({
      success: true,
      message: 'Exercise created successfully',
      exercise
    })

  } catch (error: any) {
    console.error('[EXERCISES API] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: {
          message: error.message
        }
      },
      { status: 500 }
    )
  }
}
