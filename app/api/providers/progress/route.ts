import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/providers/progress?patientId=xxx&assignedExerciseId=xxx
 * Get progress tracking data
 * 
 * Feature #6: Progress Tracking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const assignedExerciseId = searchParams.get('assignedExerciseId')

    console.log('[PROGRESS API] GET request received')
    console.log('[PROGRESS API] Patient ID:', patientId)
    console.log('[PROGRESS API] Assigned Exercise ID:', assignedExerciseId)

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabaseAdmin
      .from('progress_tracking')
      .select(`
        *,
        assigned_exercise:assigned_exercises (
          id,
          sets,
          reps,
          target_form_score,
          frequency_per_week,
          status,
          exercise:exercises (
            id,
            name,
            type,
            emoji
          )
        )
      `)
      .eq('patient_id', patientId)

    // Filter by specific assignment if provided
    if (assignedExerciseId) {
      query = query.eq('assigned_exercise_id', assignedExerciseId)
    }

    const { data: progress, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[PROGRESS API] Error fetching progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    // Get recent sessions if specific assignment
    let recentSessions = []
    if (assignedExerciseId) {
      const { data: sessions } = await supabaseAdmin
        .from('exercise_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('assigned_exercise_id', assignedExerciseId)
        .order('created_at', { ascending: false })
        .limit(10)

      recentSessions = sessions || []
    }

    console.log('[PROGRESS API] Found progress records:', progress?.length || 0)

    return NextResponse.json({
      success: true,
      progress: progress || [],
      recentSessions,
      count: progress?.length || 0
    })

  } catch (error: any) {
    console.error('[PROGRESS API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/providers/progress
 * Record completed exercise session
 * 
 * Feature #6: Progress Tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patientId,
      assignedExerciseId,
      durationSeconds,
      totalRepsCompleted,
      averageFormScore,
      notes,
      analysisData
    } = body

    console.log('[PROGRESS API] POST request received')
    console.log('[PROGRESS API] Patient ID:', patientId)
    console.log('[PROGRESS API] Assignment ID:', assignedExerciseId)
    console.log('[PROGRESS API] Form Score:', averageFormScore)

    // Validate required fields
    if (!patientId || !assignedExerciseId) {
      return NextResponse.json(
        { error: 'Patient ID and Assigned Exercise ID are required' },
        { status: 400 }
      )
    }

    // Verify assignment exists
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assigned_exercises')
      .select('*, exercise:exercises(id, name, type)')
      .eq('id', assignedExerciseId)
      .eq('patient_id', patientId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Create session record
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('exercise_sessions')
      .insert({
        patient_id: patientId,
        assigned_exercise_id: assignedExerciseId,
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds || null,
        total_reps_completed: totalRepsCompleted || 0,
        average_form_score: averageFormScore || null,
        notes: notes || null
      })
      .select()
      .single()

    if (sessionError) {
      console.error('[PROGRESS API] Error creating session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    console.log('[PROGRESS API] Session created:', session.id)

    // Update progress tracking
    const { data: existingProgress } = await supabaseAdmin
      .from('progress_tracking')
      .select('*')
      .eq('assigned_exercise_id', assignedExerciseId)
      .single()

    let updatedProgress
    if (existingProgress) {
      // Calculate new values
      const completedSessions = (existingProgress.completed_sessions || 0) + 1
      const totalSessions = existingProgress.total_sessions || 0
      
      // Calculate average form score
      let newAvgFormScore = averageFormScore
      if (existingProgress.average_form_score && averageFormScore) {
        const oldTotal = existingProgress.average_form_score * (completedSessions - 1)
        newAvgFormScore = (oldTotal + averageFormScore) / completedSessions
      }

      // Calculate completion percentage based on frequency
      const frequencyPerWeek = assignment.frequency_per_week || 3
      const startDate = new Date(assignment.start_date || assignment.created_at)
      const today = new Date()
      const weeksElapsed = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
      const expectedSessions = frequencyPerWeek * weeksElapsed
      const completionPercentage = Math.min(100, (completedSessions / expectedSessions) * 100)

      // Check if completed
      const isCompleted = completionPercentage >= 100

      // Update progress
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('progress_tracking')
        .update({
          completed_sessions: completedSessions,
          total_sessions: Math.max(totalSessions, completedSessions),
          average_form_score: newAvgFormScore,
          completion_percentage: completionPercentage,
          last_session_date: new Date().toISOString(),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : existingProgress.completed_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (updateError) {
        console.warn('[PROGRESS API] Error updating progress:', updateError)
      }

      updatedProgress = updated || existingProgress
    } else {
      // Create new progress record (shouldn't happen if assignment was created properly)
      const { data: created } = await supabaseAdmin
        .from('progress_tracking')
        .insert({
          patient_id: patientId,
          assigned_exercise_id: assignedExerciseId,
          completed_sessions: 1,
          total_sessions: 1,
          average_form_score: averageFormScore,
          completion_percentage: 0,
          last_session_date: new Date().toISOString(),
          is_completed: false
        })
        .select()
        .single()

      updatedProgress = created
    }

    // Send notification if form score is low
    if (averageFormScore && averageFormScore < 60) {
      console.log('[PROGRESS API] Low form score detected, creating notification...')
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: assignment.provider_id,
          title: 'Low Form Score Alert',
          message: `Patient has a low form score (${averageFormScore}%) on ${assignment.exercise.name}`,
          type: 'alert',
          is_read: false,
          related_entity_type: 'exercise_session',
          related_entity_id: session.id
        })
        .select()
    }

    console.log('[PROGRESS API] Progress updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Session recorded successfully',
      session,
      progress: updatedProgress
    })

  } catch (error: any) {
    console.error('[PROGRESS API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
