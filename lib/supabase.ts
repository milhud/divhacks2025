import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.SUPABASE_SERVICE_ROLE_KEY
}

// Create Supabase client (works even with placeholder values)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

export interface Workout {
  id: string
  title: string
  description?: string
  duration?: number
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  exercises: Exercise[]
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Exercise {
  name: string
  reps: number
  sets: number
  duration?: number // in seconds
  rest?: number // in seconds
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string
  video_url?: string
  pose_data?: any
  form_score?: number
  ai_feedback?: string
  duration?: number
  rep_count?: number
  created_at: string
  updated_at: string
}

export interface PoseAnalysis {
  id: string
  session_id: string
  frame_number: number
  timestamp: number
  keypoints: any
  confidence?: number
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  total_workouts: number
  total_duration: number
  average_form_score: number
  current_streak: number
  longest_streak: number
  last_workout_date?: string
  created_at: string
  updated_at: string
}