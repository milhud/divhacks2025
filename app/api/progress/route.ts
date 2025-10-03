import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (progressError) {
      return NextResponse.json(
        { error: 'Failed to fetch user progress' },
        { status: 500 }
      )
    }

    // Get recent sessions for detailed progress
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        form_score,
        duration,
        created_at,
        workouts (
          title,
          category
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (sessionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch recent sessions' },
        { status: 500 }
      )
    }

    // Calculate additional stats
    const totalSessions = recentSessions?.length || 0
    const averageScore = recentSessions?.length > 0 
      ? recentSessions.reduce((sum, session) => sum + (session.form_score || 0), 0) / recentSessions.length
      : 0
    const totalDuration = recentSessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    for (const session of recentSessions || []) {
      const sessionDate = new Date(session.created_at)
      if (sessionDate >= oneDayAgo) {
        currentStreak++
      } else {
        break
      }
    }

    const progressData = {
      ...progress,
      total_sessions: totalSessions,
      average_form_score: Math.round(averageScore),
      total_duration: totalDuration,
      current_streak: currentStreak,
      recent_sessions: recentSessions?.map(session => ({
        id: session.id,
        workout_title: session.workouts?.title,
        category: session.workouts?.category,
        form_score: session.form_score,
        duration: session.duration,
        date: session.created_at,
      })) || []
    }

    return NextResponse.json({ progress: progressData })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
