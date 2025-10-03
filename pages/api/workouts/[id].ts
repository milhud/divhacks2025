import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Workout ID is required' })
  }

  if (req.method === 'GET') {
    // Get specific workout
    try {
      const { data: workout, error } = await supabaseAdmin
        .from('workouts')
        .select(`
          *,
          created_by_profile:profiles!workouts_created_by_fkey(full_name, avatar_url),
          exercises:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching workout:', error)
        return res.status(404).json({ error: 'Workout not found' })
      }

      return res.status(200).json({ workout })

    } catch (error) {
      console.error('Workout fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    // Update workout
    try {
      const { name, description, exercises, is_public, difficulty_level, estimated_duration } = req.body
      const user_id = req.headers['x-user-id'] as string

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      // Check if user owns the workout
      const { data: existing_workout, error: fetch_error } = await supabaseAdmin
        .from('workouts')
        .select('created_by')
        .eq('id', id)
        .single()

      if (fetch_error || !existing_workout) {
        return res.status(404).json({ error: 'Workout not found' })
      }

      if (existing_workout.created_by !== user_id) {
        return res.status(403).json({ error: 'Not authorized to update this workout' })
      }

      // Update workout
      const { data: workout, error: update_error } = await supabaseAdmin
        .from('workouts')
        .update({
          name,
          description,
          is_public,
          difficulty_level,
          estimated_duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (update_error) {
        console.error('Error updating workout:', update_error)
        return res.status(500).json({ error: 'Failed to update workout' })
      }

      // Update exercises if provided
      if (exercises && Array.isArray(exercises)) {
        // Delete existing exercises
        await supabaseAdmin
          .from('workout_exercises')
          .delete()
          .eq('workout_id', id)

        // Add new exercises
        const workout_exercises = exercises.map((exercise: any, index: number) => ({
          workout_id: id,
          exercise_id: exercise.exercise_id,
          order_index: index,
          sets: exercise.sets || 1,
          reps: exercise.reps,
          duration_seconds: exercise.duration_seconds,
          rest_seconds: exercise.rest_seconds || 0,
          notes: exercise.notes
        }))

        const { error: exercises_error } = await supabaseAdmin
          .from('workout_exercises')
          .insert(workout_exercises)

        if (exercises_error) {
          console.error('Error updating workout exercises:', exercises_error)
          return res.status(500).json({ error: 'Failed to update workout exercises' })
        }
      }

      // Fetch the complete workout with exercises
      const { data: complete_workout, error: fetch_complete_error } = await supabaseAdmin
        .from('workouts')
        .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .eq('id', id)
        .single()

      if (fetch_complete_error) {
        console.error('Error fetching complete workout:', fetch_complete_error)
        return res.status(500).json({ error: 'Failed to fetch complete workout' })
      }

      return res.status(200).json({ workout: complete_workout })

    } catch (error) {
      console.error('Workout update error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    // Delete workout
    try {
      const user_id = req.headers['x-user-id'] as string

      if (!user_id) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      // Check if user owns the workout
      const { data: existing_workout, error: fetch_error } = await supabaseAdmin
        .from('workouts')
        .select('created_by')
        .eq('id', id)
        .single()

      if (fetch_error || !existing_workout) {
        return res.status(404).json({ error: 'Workout not found' })
      }

      if (existing_workout.created_by !== user_id) {
        return res.status(403).json({ error: 'Not authorized to delete this workout' })
      }

      // Delete workout (cascade will handle related records)
      const { error: delete_error } = await supabaseAdmin
        .from('workouts')
        .delete()
        .eq('id', id)

      if (delete_error) {
        console.error('Error deleting workout:', delete_error)
        return res.status(500).json({ error: 'Failed to delete workout' })
      }

      return res.status(200).json({ message: 'Workout deleted successfully' })

    } catch (error) {
      console.error('Workout deletion error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
