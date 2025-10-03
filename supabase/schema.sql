-- =====================================================
-- VIBE COACH - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This script creates the entire database structure for Vibe Coach
-- Run this single command to set up everything needed

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  height_cm INTEGER CHECK (height_cm >= 100 AND height_cm <= 250),
  weight_kg DECIMAL(5,2) CHECK (weight_kg >= 20 AND weight_kg <= 300),
  fitness_level TEXT CHECK (fitness_level IN ('Beginner', 'Intermediate', 'Advanced')),
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create workouts table
CREATE TABLE workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  exercises JSONB DEFAULT '[]'::jsonb, -- array of exercise objects
  image_url TEXT,
  youtube_url TEXT,
  video_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workout_sessions table
CREATE TABLE workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_id UUID REFERENCES workouts NOT NULL,
  video_url TEXT, -- URL to uploaded video in Supabase storage
  pose_data JSONB, -- pose detection results
  form_score INTEGER CHECK (form_score >= 0 AND form_score <= 100),
  ai_feedback TEXT,
  duration INTEGER, -- actual duration in minutes
  rep_count INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create pose_analysis table for storing detailed pose data
CREATE TABLE pose_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions NOT NULL,
  frame_number INTEGER NOT NULL,
  timestamp REAL NOT NULL, -- timestamp in seconds
  keypoints JSONB NOT NULL, -- pose keypoints data
  confidence REAL, -- overall confidence score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_progress table for tracking overall progress
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total_workouts INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- in minutes
  average_form_score REAL DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  total_calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id)
);

-- Create feedback table for AI-generated feedback
CREATE TABLE feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  feedback_text TEXT NOT NULL,
  improvement_areas TEXT[],
  positive_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create wearable_data table
CREATE TABLE wearable_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  summary JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workout_plans table
CREATE TABLE workout_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  workouts JSONB NOT NULL, -- array of workout IDs and schedule
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create meal_plans table
CREATE TABLE meal_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  calories_per_day INTEGER,
  meals JSONB NOT NULL, -- array of meal objects
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pose_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Workouts policies
CREATE POLICY "Workouts are viewable by everyone." ON workouts
  FOR SELECT USING (true);

-- Workout sessions policies
CREATE POLICY "Users can view their own sessions." ON workout_sessions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own sessions." ON workout_sessions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own sessions." ON workout_sessions
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Pose analysis policies
CREATE POLICY "Users can view pose analysis for their sessions." ON pose_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = pose_analysis.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pose analysis for their sessions." ON pose_analysis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = pose_analysis.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- User progress policies
CREATE POLICY "Users can view their own progress." ON user_progress
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own progress." ON user_progress
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own progress." ON user_progress
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Feedback policies
CREATE POLICY "Users can view their own feedback." ON feedback
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own feedback." ON feedback
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Wearable data policies
CREATE POLICY "Users can view their own wearable data." ON wearable_data
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own wearable data." ON wearable_data
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own wearable data." ON wearable_data
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Workout plans policies
CREATE POLICY "Users can view their own workout plans." ON workout_plans
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own workout plans." ON workout_plans
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own workout plans." ON workout_plans
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Meal plans policies
CREATE POLICY "Users can view their own meal plans." ON meal_plans
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own meal plans." ON meal_plans
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own meal plans." ON meal_plans
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user progress
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user progress when a new session is created
  IF TG_OP = 'INSERT' THEN
    UPDATE user_progress
    SET 
      total_workouts = total_workouts + 1,
      total_duration = total_duration + COALESCE(NEW.duration, 0),
      total_calories_burned = total_calories_burned + COALESCE(NEW.calories_burned, 0),
      average_form_score = (
        SELECT AVG(form_score) 
        FROM workout_sessions 
        WHERE user_id = NEW.user_id AND form_score IS NOT NULL
      ),
      last_workout_date = current_date,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update user progress
CREATE TRIGGER on_workout_session_created
  AFTER INSERT ON workout_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_progress();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at 
  BEFORE UPDATE ON workouts 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at 
  BEFORE UPDATE ON workout_sessions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pose_analysis_updated_at 
  BEFORE UPDATE ON pose_analysis 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_wearable_data_updated_at 
  BEFORE UPDATE ON wearable_data 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at 
  BEFORE UPDATE ON workout_plans 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON meal_plans 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- 6. SAMPLE DATA
-- =====================================================

-- Insert sample workouts
INSERT INTO workouts (title, description, duration, difficulty, category, tags, exercises, image_url, youtube_url, video_id) VALUES
('Full Body Strength', 'Build overall strength with compound movements', 45, 'Intermediate', 'Strength', 
 ARRAY['Strength', 'Full Body'], 
 '[{"name": "Squats", "reps": 12, "sets": 3}, {"name": "Push-ups", "reps": 10, "sets": 3}, {"name": "Lunges", "reps": 10, "sets": 3}]', 
 '/person-doing-strength-training-workout.jpg', 'https://www.youtube.com/embed/R6gZoAzAhCg', 'R6gZoAzAhCg'),
 
('Upper Body Focus', 'Target chest, back, shoulders, and arms', 30, 'Beginner', 'Strength',
 ARRAY['Strength', 'Upper Body'],
 '[{"name": "Push-ups", "reps": 8, "sets": 3}, {"name": "Pull-ups", "reps": 5, "sets": 3}, {"name": "Shoulder Press", "reps": 10, "sets": 3}]',
 '/person-doing-upper-body-exercises.jpg', 'https://www.youtube.com/embed/IODxDxX7oi4', 'IODxDxX7oi4'),
 
('Lower Body Power', 'Explosive leg and glute exercises', 40, 'Advanced', 'Strength',
 ARRAY['Strength', 'Lower Body'],
 '[{"name": "Squats", "reps": 15, "sets": 4}, {"name": "Lunges", "reps": 12, "sets": 3}, {"name": "Jump Squats", "reps": 10, "sets": 3}]',
 '/person-doing-squats-and-leg-exercises.jpg', 'https://www.youtube.com/embed/2C7P2FBHHQo', '2C7P2FBHHQo'),
 
('Core & Stability', 'Strengthen your core and improve balance', 25, 'Beginner', 'Core',
 ARRAY['Core', 'Abs'],
 '[{"name": "Plank", "reps": 1, "sets": 3, "duration": 30}, {"name": "Crunches", "reps": 15, "sets": 3}, {"name": "Mountain Climbers", "reps": 20, "sets": 3}]',
 '/person-doing-core-exercises-and-planks.jpg', 'https://www.youtube.com/embed/DHD1-2P94DI', 'DHD1-2P94DI'),
 
('HIIT Cardio Blast', 'High-intensity intervals for maximum burn', 20, 'Intermediate', 'Cardio',
 ARRAY['Cardio', 'HIIT'],
 '[{"name": "Burpees", "reps": 10, "sets": 4, "rest": 30}, {"name": "Jumping Jacks", "reps": 30, "sets": 4, "rest": 30}, {"name": "High Knees", "reps": 30, "sets": 4, "rest": 30}]',
 '/high-intensity-cardio.png', 'https://www.youtube.com/embed/ml6cT4AZdqI', 'ml6cT4AZdqI'),
 
('Mobility & Flexibility', 'Improve range of motion and prevent injury', 30, 'Beginner', 'Mobility',
 ARRAY['Mobility', 'Flexibility'],
 '[{"name": "Cat-Cow Stretch", "reps": 1, "sets": 3, "duration": 30}, {"name": "Hip Flexor Stretch", "reps": 1, "sets": 2, "duration": 45}, {"name": "Shoulder Rolls", "reps": 10, "sets": 3}]',
 '/person-doing-stretching-and-mobility-exercises.jpg', 'https://www.youtube.com/embed/v7AYKMP6rOE', 'v7AYKMP6rOE');

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX idx_workout_sessions_created_at ON workout_sessions(created_at);
CREATE INDEX idx_pose_analysis_session_id ON pose_analysis(session_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_session_id ON feedback(session_id);
CREATE INDEX idx_wearable_data_user_id ON wearable_data(user_id);
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);

-- =====================================================
-- COMPLETE! 
-- =====================================================
-- The entire Vibe Coach database is now set up with:
-- ✅ All tables created
-- ✅ Row Level Security enabled
-- ✅ All policies configured
-- ✅ Functions and triggers set up
-- ✅ Sample data inserted
-- ✅ Performance indexes created
-- 
-- You can now run this single SQL script to create everything!