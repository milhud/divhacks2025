import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get user's workout sessions
    try {
      const user_id = req.headers['x-user-id'] as string
      const { status, limit = 20, offset = 0 } = req.query

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      let query = supabaseAdmin
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(
            id,
            name,
            description,
            difficulty_level,
            estimated_duration
          ),
          session_exercises(
            *,
            exercise:exercises(
              id,
              name,
              description,
              target_muscles
            )
          )
        `)
        .eq('user_id', user_id)
        .order('started_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1)

      if (status) {
        query = query.eq('status', status)
      }

      const { data: sessions, error } = await query

      if (error) {
        console.error('Error fetching sessions:', error)
        return res.status(500).json({ error: 'Failed to fetch sessions' })
      }

      return res.status(200).json({ sessions })

    } catch (error) {
      console.error('Sessions fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Start a new workout session
    try {
      const { workout_id, assignment_id } = req.body
      const user_id = req.headers['x-user-id'] as string

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      // Create session
      const { data: session, error: session_error } = await supabaseAdmin
        .from('workout_sessions')
        .insert({
          user_id,
          workout_id,
          assignment_id,
          started_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .select()
        .single()

      if (session_error) {
        console.error('Error creating session:', session_error)
        return res.status(500).json({ error: 'Failed to create session' })
      }

      // If workout_id is provided, create session exercises
      if (workout_id) {
        const { data: workout_exercises, error: exercises_error } = await supabaseAdmin
          .from('workout_exercises')
          .select('*')
          .eq('workout_id', workout_id)
          .order('order_index')

        if (exercises_error) {
          console.error('Error fetching workout exercises:', exercises_error)
          return res.status(500).json({ error: 'Failed to fetch workout exercises' })
        }

        const session_exercises = workout_exercises.map(we => ({
          session_id: session.id,
          exercise_id: we.exercise_id,
          order_index: we.order_index,
          rep_count: 0,
          form_score: null,
          feedback: null,
          pose_data: null
        }))

        const { error: create_exercises_error } = await supabaseAdmin
          .from('session_exercises')
          .insert(session_exercises)

        if (create_exercises_error) {
          console.error('Error creating session exercises:', create_exercises_error)
          return res.status(500).json({ error: 'Failed to create session exercises' })
        }
      }

      // Fetch complete session with exercises
      const { data: complete_session, error: fetch_error } = await supabaseAdmin
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(
            id,
            name,
            description,
            difficulty_level,
            estimated_duration
          ),
          session_exercises(
            *,
            exercise:exercises(
              id,
              name,
              description,
              target_muscles,
              instructions
            )
          )
        `)
        .eq('id', session.id)
        .single()

      if (fetch_error) {
        console.error('Error fetching complete session:', fetch_error)
        return res.status(500).json({ error: 'Failed to fetch complete session' })
      }

      return res.status(201).json({ session: complete_session })

    } catch (error) {
      console.error('Session creation error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
