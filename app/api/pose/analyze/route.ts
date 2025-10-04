import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, videoUrl } = await request.json()

    if (!sessionId || !videoUrl) {
      return NextResponse.json(
        { error: 'Session ID and video URL are required' },
        { status: 400 }
      )
    }

    // Call Python video processing pipeline
    const pythonResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/python/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl,
        sessionId
      })
    })

    if (!pythonResponse.ok) {
      throw new Error('Python analysis failed')
    }

    const pythonResult = await pythonResponse.json()
    const analysis = pythonResult.analysis

    // Update the session with pose analysis results
    const { error: updateError } = await supabaseAdmin
      .from('workout_sessions')
      .update({
        pose_data: analysis,
        form_score: analysis.form_score,
        rep_count: analysis.rep_count,
        duration: Math.round(pythonResult.video_info?.duration / 60) || 0, // Convert to minutes
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Failed to update session:', updateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: 'Pose analysis completed',
      analysis: analysis,
    })
  } catch (error) {
    console.error('Pose analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
