import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/providers/analytics?providerId=xxx&timeRange=30
 * Get comprehensive analytics for provider dashboard
 * 
 * Feature #7: Analytics Dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')
    const timeRange = parseInt(searchParams.get('timeRange') || '30')

    console.log('[ANALYTICS API] GET request received')
    console.log('[ANALYTICS API] Provider ID:', providerId)
    console.log('[ANALYTICS API] Time Range:', timeRange, 'days')

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const startDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000)

    // 1. Get all patients for this provider
    const { data: relationships } = await supabaseAdmin
      .from('patient_provider_relationships')
      .select('patient_id, status')
      .eq('provider_id', providerId)

    const patientIds = relationships?.map(r => r.patient_id) || []
    const totalPatients = patientIds.length
    const activePatients = relationships?.filter(r => r.status === 'active').length || 0

    console.log('[ANALYTICS API] Total patients:', totalPatients)

    if (totalPatients === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          overview: {
            totalPatients: 0,
            activePatients: 0,
            totalSessions: 0,
            averageFormScore: 0,
            averageProgress: 0,
            totalExercisesAssigned: 0
          },
          trends: [],
          topPerformers: [],
          needsAttention: [],
          exercisePopularity: []
        }
      })
    }

    // 2. Get all assigned exercises for these patients
    const { data: assignments } = await supabaseAdmin
      .from('assigned_exercises')
      .select('id, exercise_id, exercise:exercises(name)')
      .eq('provider_id', providerId)
      .in('patient_id', patientIds)

    const totalExercisesAssigned = assignments?.length || 0
    const assignmentIds = assignments?.map(a => a.id) || []

    // 3. Get all sessions within time range
    const { data: sessions } = await supabaseAdmin
      .from('exercise_sessions')
      .select('*')
      .in('patient_id', patientIds)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    const totalSessions = sessions?.length || 0

    // Calculate average form score
    const sessionsWithScore = sessions?.filter(s => s.average_form_score !== null) || []
    const averageFormScore = sessionsWithScore.length > 0
      ? sessionsWithScore.reduce((sum, s) => sum + (s.average_form_score || 0), 0) / sessionsWithScore.length
      : 0

    console.log('[ANALYTICS API] Total sessions:', totalSessions)
    console.log('[ANALYTICS API] Average form score:', averageFormScore.toFixed(2))

    // 4. Get progress tracking for all assignments
    const { data: progressData } = await supabaseAdmin
      .from('progress_tracking')
      .select(`
        *,
        assigned_exercise:assigned_exercises (
          id,
          patient_id,
          exercise:exercises (
            name
          )
        )
      `)
      .in('assigned_exercise_id', assignmentIds)

    // Calculate average progress
    const averageProgress = progressData && progressData.length > 0
      ? progressData.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / progressData.length
      : 0

    console.log('[ANALYTICS API] Average progress:', averageProgress.toFixed(2), '%')

    // 5. Build 7-day trends (daily breakdown)
    const trends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySessions = sessions?.filter(s => 
        s.created_at.startsWith(dateStr)
      ) || []

      const daySessionsWithScore = daySessions.filter(s => s.average_form_score !== null)
      const avgFormScore = daySessionsWithScore.length > 0
        ? daySessionsWithScore.reduce((sum, s) => sum + (s.average_form_score || 0), 0) / daySessionsWithScore.length
        : 0

      trends.push({
        date: dateStr,
        sessions: daySessions.length,
        avgFormScore: Math.round(avgFormScore * 100) / 100
      })
    }

    // 6. Top Performers (highest completion % and form scores)
    const topPerformers = progressData
      ?.filter(p => p.completion_percentage > 0)
      .sort((a, b) => {
        const scoreA = (a.completion_percentage || 0) + (a.average_form_score || 0)
        const scoreB = (b.completion_percentage || 0) + (b.average_form_score || 0)
        return scoreB - scoreA
      })
      .slice(0, 5)
      .map(p => ({
        patientId: p.assigned_exercise?.patient_id,
        exerciseName: p.assigned_exercise?.exercise?.name || 'Unknown',
        completionPercentage: Math.round((p.completion_percentage || 0) * 100) / 100,
        averageFormScore: Math.round((p.average_form_score || 0) * 100) / 100,
        completedSessions: p.completed_sessions || 0
      })) || []

    // 7. Needs Attention (low form scores or low completion)
    const needsAttention = progressData
      ?.filter(p => 
        (p.average_form_score !== null && p.average_form_score < 65) || 
        (p.completion_percentage < 30 && p.completed_sessions > 0)
      )
      .sort((a, b) => (a.average_form_score || 100) - (b.average_form_score || 100))
      .slice(0, 5)
      .map(p => ({
        patientId: p.assigned_exercise?.patient_id,
        exerciseName: p.assigned_exercise?.exercise?.name || 'Unknown',
        completionPercentage: Math.round((p.completion_percentage || 0) * 100) / 100,
        averageFormScore: Math.round((p.average_form_score || 0) * 100) / 100,
        lastSessionDate: p.last_session_date,
        issue: p.average_form_score < 65 ? 'Low form score' : 'Low completion rate'
      })) || []

    // 8. Exercise Popularity (most assigned exercises)
    const exerciseCount = new Map<string, number>()
    assignments?.forEach(a => {
      const exerciseName = (a.exercise as any)?.name || 'Unknown'
      exerciseCount.set(exerciseName, (exerciseCount.get(exerciseName) || 0) + 1)
    })

    const exercisePopularity = Array.from(exerciseCount.entries())
      .map(([name, count]) => ({ exerciseName: name, assignmentCount: count }))
      .sort((a, b) => b.assignmentCount - a.assignmentCount)
      .slice(0, 10)

    // 9. Build analytics response
    const analytics = {
      overview: {
        totalPatients,
        activePatients,
        totalSessions,
        averageFormScore: Math.round(averageFormScore * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
        totalExercisesAssigned
      },
      trends,
      topPerformers,
      needsAttention,
      exercisePopularity,
      timeRange: {
        days: timeRange,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      }
    }

    console.log('[ANALYTICS API] Analytics compiled successfully')
    console.log('[ANALYTICS API] Top performers:', topPerformers.length)
    console.log('[ANALYTICS API] Needs attention:', needsAttention.length)

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error: any) {
    console.error('[ANALYTICS API] Error:', error)
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
