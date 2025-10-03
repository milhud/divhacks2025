import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get exercises
    try {
      const { category, difficulty_level, search, limit = 50, offset = 0 } = req.query

      let query = supabaseAdmin
        .from('exercises')
        .select(`
          *,
          created_by_profile:profiles!exercises_created_by_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1)

      if (category) {
        query = query.eq('category', category)
      }

      if (difficulty_level) {
        query = query.eq('difficulty_level', difficulty_level)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data: exercises, error } = await query

      if (error) {
        console.error('Error fetching exercises:', error)
        return res.status(500).json({ error: 'Failed to fetch exercises' })
      }

      return res.status(200).json({ exercises })

    } catch (error) {
      console.error('Exercises fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Create exercise
    try {
      const {
        name,
        description,
        category,
        difficulty_level = 1,
        target_muscles = [],
        instructions,
        demo_video_url,
        pose_keypoints
      } = req.body

      const created_by = req.headers['x-user-id'] as string

      if (!name) {
        return res.status(400).json({ error: 'Name is required' })
      }

      if (!created_by) {
        return res.status(401).json({ error: 'User ID is required' })
      }

      const { data: exercise, error } = await supabaseAdmin
        .from('exercises')
        .insert({
          name,
          description,
          category,
          difficulty_level,
          target_muscles,
          instructions,
          demo_video_url,
          pose_keypoints,
          created_by
        })
        .select(`
          *,
          created_by_profile:profiles!exercises_created_by_fkey(full_name, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error creating exercise:', error)
        return res.status(500).json({ error: 'Failed to create exercise' })
      }

      return res.status(201).json({ exercise })

    } catch (error) {
      console.error('Exercise creation error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
