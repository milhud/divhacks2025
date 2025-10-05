import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/providers/exercises/assign?patientId=xxx&providerId=xxx
 * Get assigned exercises for a patient
 * 
 * Feature #5: Exercise Assignments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const providerId = searchParams.get('providerId')

    console.log('[ASSIGN API] GET request received')
    console.log('[ASSIGN API] Patient ID:', patientId)
    console.log('[ASSIGN API] Provider ID:', providerId)

    if (!patientId || !providerId) {
      return NextResponse.json(
        { error: 'Patient ID and Provider ID are required' },
        { status: 400 }
      )
    }

    // Verify relationship exists
    const { data: relationship } = await supabaseAdmin
      .from('patient_provider_relationships')
      .select('id, status')
      .eq('patient_id', patientId)
      .eq('provider_id', providerId)
      .single()

    if (!relationship) {
      return NextResponse.json(
        { error: 'Patient-provider relationship not found' },
        { status: 404 }
      )
    }

    // Get assigned exercises with exercise details
    const { data: assignments, error } = await supabaseAdmin
      .from('assigned_exercises')
      .select(`
        *,
        exercise:exercises (
          id,
          name,
          type,
          emoji,
          description,
          instructions,
          difficulty,
          target_muscle_groups,
          equipment_needed
        )
      `)
      .eq('patient_id', patientId)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[ASSIGN API] Error fetching assignments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      )
    }

    console.log('[ASSIGN API] Found assignments:', assignments?.length || 0)

    return NextResponse.json({
      success: true,
      assignments: assignments || [],
      count: assignments?.length || 0
    })

  } catch (error: any) {
    console.error('[ASSIGN API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/providers/exercises/assign
 * Assign exercise to patient
 * 
 * Feature #5: Exercise Assignments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      providerId,
      patientId,
      exerciseId,
      sets,
      reps,
      durationSeconds,
      targetFormScore,
      frequencyPerWeek,
      startDate,
      endDate,
      notes
    } = body

    console.log('[ASSIGN API] POST request received')
    console.log('[ASSIGN API] Provider:', providerId)
    console.log('[ASSIGN API] Patient:', patientId)
    console.log('[ASSIGN API] Exercise:', exerciseId)

    // Validate required fields
    if (!providerId || !patientId || !exerciseId) {
      return NextResponse.json(
        { error: 'Provider ID, Patient ID, and Exercise ID are required' },
        { status: 400 }
      )
    }

    if (!sets && !durationSeconds) {
      return NextResponse.json(
        { error: 'Either sets or duration must be specified' },
        { status: 400 }
      )
    }

    // Verify relationship exists
    const { data: relationship } = await supabaseAdmin
      .from('patient_provider_relationships')
      .select('id, status')
      .eq('patient_id', patientId)
      .eq('provider_id', providerId)
      .single()

    if (!relationship) {
      return NextResponse.json(
        { error: 'Patient-provider relationship not found' },
        { status: 404 }
      )
    }

    if (relationship.status !== 'active') {
      return NextResponse.json(
        { error: 'Patient-provider relationship is not active' },
        { status: 400 }
      )
    }

    // Verify exercise exists
    const { data: exercise } = await supabaseAdmin
      .from('exercises')
      .select('id, name, type')
      .eq('id', exerciseId)
      .single()

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Create assignment
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('assigned_exercises')
      .insert({
        patient_id: patientId,
        provider_id: providerId,
        exercise_id: exerciseId,
        sets: sets || null,
        reps: reps || null,
        duration_seconds: durationSeconds || null,
        target_form_score: targetFormScore || 75,
        frequency_per_week: frequencyPerWeek || 3,
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: endDate || null,
        status: 'not_started',
        notes: notes || null
      })
      .select(`
        *,
        exercise:exercises (
          id,
          name,
          type,
          emoji,
          description
        )
      `)
      .single()

    if (assignError) {
      console.error('[ASSIGN API] Error creating assignment:', assignError)
      return NextResponse.json(
        { 
          error: 'Failed to create assignment',
          debug: { message: assignError.message }
        },
        { status: 500 }
      )
    }

    // Create initial progress tracking entry
    const { error: progressError } = await supabaseAdmin
      .from('progress_tracking')
      .insert({
        patient_id: patientId,
        assigned_exercise_id: assignment.id,
        completion_percentage: 0,
        total_sessions: 0,
        completed_sessions: 0,
        is_completed: false
      })

    if (progressError) {
      console.warn('[ASSIGN API] Warning: Failed to create progress tracking:', progressError)
      // Don't fail the request, just log warning
    }

    console.log('[ASSIGN API] Assignment created:', assignment.id)

    return NextResponse.json({
      success: true,
      message: 'Exercise assigned successfully',
      assignment
    })

  } catch (error: any) {
    console.error('[ASSIGN API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/providers/exercises/assign
 * Update assignment
 * 
 * Feature #5: Exercise Assignments
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      assignmentId,
      sets,
      reps,
      durationSeconds,
      targetFormScore,
      frequencyPerWeek,
      status,
      notes
    } = body

    console.log('[ASSIGN API] PATCH request received')
    console.log('[ASSIGN API] Assignment ID:', assignmentId)

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() }
    if (sets !== undefined) updates.sets = sets
    if (reps !== undefined) updates.reps = reps
    if (durationSeconds !== undefined) updates.duration_seconds = durationSeconds
    if (targetFormScore !== undefined) updates.target_form_score = targetFormScore
    if (frequencyPerWeek !== undefined) updates.frequency_per_week = frequencyPerWeek
    if (status !== undefined) updates.status = status
    if (notes !== undefined) updates.notes = notes

    const { data: assignment, error } = await supabaseAdmin
      .from('assigned_exercises')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) {
      console.error('[ASSIGN API] Error updating assignment:', error)
      return NextResponse.json(
        { error: 'Failed to update assignment' },
        { status: 500 }
      )
    }

    console.log('[ASSIGN API] Assignment updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    })

  } catch (error: any) {
    console.error('[ASSIGN API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/providers/exercises/assign?assignmentId=xxx
 * Remove assignment
 * 
 * Feature #5: Exercise Assignments
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    console.log('[ASSIGN API] DELETE request received')
    console.log('[ASSIGN API] Assignment ID:', assignmentId)

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('assigned_exercises')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('[ASSIGN API] Error deleting assignment:', error)
      return NextResponse.json(
        { error: 'Failed to delete assignment' },
        { status: 500 }
      )
    }

    console.log('[ASSIGN API] Assignment deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Assignment removed successfully'
    })

  } catch (error: any) {
    console.error('[ASSIGN API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
