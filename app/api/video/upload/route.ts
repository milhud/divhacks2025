import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    const userId = formData.get('userId') as string
    const workoutId = formData.get('workoutId') as string

    if (!file || !userId || !workoutId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, MOV, AVI, and WebM are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${workoutId}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('workout-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('workout-videos')
      .getPublicUrl(fileName)

    // Create workout session record
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: workoutId,
        video_url: urlData.publicUrl,
        duration: 0, // Will be updated after analysis
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to create session record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Video uploaded successfully',
      sessionId: sessionData.id,
      videoUrl: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
