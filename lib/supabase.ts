import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'trainer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'trainer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'trainer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      gyms: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          difficulty_level: number
          target_muscles: string[] | null
          instructions: string | null
          demo_video_url: string | null
          pose_keypoints: any | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          difficulty_level?: number
          target_muscles?: string[] | null
          instructions?: string | null
          demo_video_url?: string | null
          pose_keypoints?: any | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          difficulty_level?: number
          target_muscles?: string[] | null
          instructions?: string | null
          demo_video_url?: string | null
          pose_keypoints?: any | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          gym_id: string | null
          is_public: boolean
          difficulty_level: number
          estimated_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          gym_id?: string | null
          is_public?: boolean
          difficulty_level?: number
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string | null
          gym_id?: string | null
          is_public?: boolean
          difficulty_level?: number
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          workout_id: string | null
          assignment_id: string | null
          started_at: string
          completed_at: string | null
          status: 'in_progress' | 'completed' | 'abandoned'
          total_duration: number | null
          overall_score: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id?: string | null
          assignment_id?: string | null
          started_at?: string
          completed_at?: string | null
          status?: 'in_progress' | 'completed' | 'abandoned'
          total_duration?: number | null
          overall_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string | null
          assignment_id?: string | null
          started_at?: string
          completed_at?: string | null
          status?: 'in_progress' | 'completed' | 'abandoned'
          total_duration?: number | null
          overall_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_id: string | null
          order_index: number
          started_at: string | null
          completed_at: string | null
          duration_seconds: number | null
          rep_count: number
          form_score: number | null
          feedback: string | null
          pose_data: any | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id?: string | null
          order_index: number
          started_at?: string | null
          completed_at?: string | null
          duration_seconds?: number | null
          rep_count?: number
          form_score?: number | null
          feedback?: string | null
          pose_data?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string | null
          order_index?: number
          started_at?: string | null
          completed_at?: string | null
          duration_seconds?: number | null
          rep_count?: number
          form_score?: number | null
          feedback?: string | null
          pose_data?: any | null
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          session_id: string
          exercise_id: string | null
          feedback_type: 'real_time' | 'post_session' | 'form_correction'
          content: string
          audio_url: string | null
          severity: 'info' | 'warning' | 'error'
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id?: string | null
          feedback_type: 'real_time' | 'post_session' | 'form_correction'
          content: string
          audio_url?: string | null
          severity?: 'info' | 'warning' | 'error'
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string | null
          feedback_type?: 'real_time' | 'post_session' | 'form_correction'
          content?: string
          audio_url?: string | null
          severity?: 'info' | 'warning' | 'error'
          timestamp?: string
          created_at?: string
        }
      }
      pose_analysis: {
        Row: {
          id: string
          session_exercise_id: string
          timestamp: string
          keypoints: any
          angles: any | null
          form_metrics: any | null
          corrections: any | null
          confidence_score: number | null
        }
        Insert: {
          id?: string
          session_exercise_id: string
          timestamp?: string
          keypoints: any
          angles?: any | null
          form_metrics?: any | null
          corrections?: any | null
          confidence_score?: number | null
        }
        Update: {
          id?: string
          session_exercise_id?: string
          timestamp?: string
          keypoints?: any
          angles?: any | null
          form_metrics?: any | null
          corrections?: any | null
          confidence_score?: number | null
        }
      }
    }
  }
}
