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

    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workouts (
          id,
          title,
          category,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, workoutId, videoUrl, poseData, formScore, aiFeedback, duration, repCount } = await request.json()

    if (!userId || !workoutId) {
      return NextResponse.json(
        { error: 'User ID and workout ID are required' },
        { status: 400 }
      )
    }

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: workoutId,
        video_url: videoUrl,
        pose_data: poseData,
        form_score: formScore,
        ai_feedback: aiFeedback,
        duration,
        rep_count: repCount,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Session created successfully',
      session,
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
