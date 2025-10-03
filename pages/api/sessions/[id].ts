import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  if (req.method === 'GET') {
    // Get specific session
    try {
      const user_id = req.headers['x-user-id'] as string

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      const { data: session, error } = await supabaseAdmin
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
          ),
          feedback(
            id,
            exercise_id,
            feedback_type,
            content,
            audio_url,
            severity,
            timestamp
          )
        `)
        .eq('id', id)
        .eq('user_id', user_id)
        .single()

      if (error) {
        console.error('Error fetching session:', error)
        return res.status(404).json({ error: 'Session not found' })
      }

      return res.status(200).json({ session })

    } catch (error) {
      console.error('Session fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    // Update session
    try {
      const { status, total_duration, overall_score, notes } = req.body
      const user_id = req.headers['x-user-id'] as string

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      // Check if session belongs to user
      const { data: existing_session, error: fetch_error } = await supabaseAdmin
        .from('workout_sessions')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetch_error || !existing_session) {
        return res.status(404).json({ error: 'Session not found' })
      }

      if (existing_session.user_id !== user_id) {
        return res.status(403).json({ error: 'Not authorized to update this session' })
      }

      const update_data: any = {
        updated_at: new Date().toISOString()
      }

      if (status) {
        update_data.status = status
        if (status === 'completed') {
          update_data.completed_at = new Date().toISOString()
        }
      }

      if (total_duration !== undefined) {
        update_data.total_duration = total_duration
      }

      if (overall_score !== undefined) {
        update_data.overall_score = overall_score
      }

      if (notes !== undefined) {
        update_data.notes = notes
      }

      const { data: session, error: update_error } = await supabaseAdmin
        .from('workout_sessions')
        .update(update_data)
        .eq('id', id)
        .select()
        .single()

      if (update_error) {
        console.error('Error updating session:', update_error)
        return res.status(500).json({ error: 'Failed to update session' })
      }

      return res.status(200).json({ session })

    } catch (error) {
      console.error('Session update error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    // Delete session
    try {
      const user_id = req.headers['x-user-id'] as string

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      // Check if session belongs to user
      const { data: existing_session, error: fetch_error } = await supabaseAdmin
        .from('workout_sessions')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetch_error || !existing_session) {
        return res.status(404).json({ error: 'Session not found' })
      }

      if (existing_session.user_id !== user_id) {
        return res.status(403).json({ error: 'Not authorized to delete this session' })
      }

      // Delete session (cascade will handle related records)
      const { error: delete_error } = await supabaseAdmin
        .from('workout_sessions')
        .delete()
        .eq('id', id)

      if (delete_error) {
        console.error('Error deleting session:', delete_error)
        return res.status(500).json({ error: 'Failed to delete session' })
      }

      return res.status(200).json({ message: 'Session deleted successfully' })

    } catch (error) {
      console.error('Session deletion error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
