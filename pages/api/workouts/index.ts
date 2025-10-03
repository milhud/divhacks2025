import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get workouts
    try {
      const { user_id, gym_id, is_public } = req.query

      let query = supabaseAdmin
        .from('workouts')
        .select(`
          *,
          created_by_profile:profiles!workouts_created_by_fkey(full_name, avatar_url),
          exercises:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `)

      if (user_id) {
        // Get workouts assigned to user
        query = query.or(`created_by.eq.${user_id},is_public.eq.true`)
      }

      if (gym_id) {
        query = query.eq('gym_id', gym_id)
      }

      if (is_public === 'true') {
        query = query.eq('is_public', true)
      }

      const { data: workouts, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching workouts:', error)
        return res.status(500).json({ error: 'Failed to fetch workouts' })
      }

      return res.status(200).json({ workouts })

    } catch (error) {
      console.error('Workouts fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Create workout
    try {
      const { name, description, exercises, gym_id, is_public = false, difficulty_level = 1, estimated_duration } = req.body
      const created_by = req.headers['x-user-id'] as string

      if (!name || !exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ error: 'Name and exercises are required' })
      }

      if (!created_by) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      // Create workout
      const { data: workout, error: workout_error } = await supabaseAdmin
        .from('workouts')
        .insert({
          name,
          description,
          created_by,
          gym_id,
          is_public,
          difficulty_level,
          estimated_duration
        })
        .select()
        .single()

      if (workout_error) {
        console.error('Error creating workout:', workout_error)
        return res.status(500).json({ error: 'Failed to create workout' })
      }

      // Add exercises to workout
      const workout_exercises = exercises.map((exercise: any, index: number) => ({
        workout_id: workout.id,
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
        console.error('Error adding exercises to workout:', exercises_error)
        // Rollback workout creation
        await supabaseAdmin.from('workouts').delete().eq('id', workout.id)
        return res.status(500).json({ error: 'Failed to add exercises to workout' })
      }

      // Fetch the complete workout with exercises
      const { data: complete_workout, error: fetch_error } = await supabaseAdmin
        .from('workouts')
        .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .eq('id', workout.id)
        .single()

      if (fetch_error) {
        console.error('Error fetching complete workout:', fetch_error)
        return res.status(500).json({ error: 'Failed to fetch complete workout' })
      }

      return res.status(201).json({ workout: complete_workout })

    } catch (error) {
      console.error('Workout creation error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
