import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data: workouts, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch workouts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workouts })
  } catch (error) {
    console.error('Workouts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, duration, difficulty, category, exercises, imageUrl } = await request.json()

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        title,
        description,
        duration,
        difficulty,
        category,
        exercises: exercises || [],
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create workout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Workout created successfully',
      workout,
    })
  } catch (error) {
    console.error('Workout creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
