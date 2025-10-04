-- =====================================================
-- VIBE COACH - COMPLETE DATABASE SCHEMA WITH DEMO DATA
-- =====================================================
-- This script creates the entire database structure for Vibe Coach
-- Run this single command to set up everything needed

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- RESET EXISTING DATA (FOR DEMO PURPOSES)
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS exercise_sessions CASCADE;
DROP TABLE IF EXISTS rehab_assessments CASCADE;
DROP TABLE IF EXISTS patient_assignments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS pose_analysis CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS wearable_data CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

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
-- REHABILITATION-SPECIFIC TABLES
-- =====================================================

-- Create clinics table
CREATE TABLE clinics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create therapists table
CREATE TABLE therapists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID REFERENCES clinics NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialization TEXT,
  license_number TEXT,
  patient_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID REFERENCES clinics NOT NULL,
  therapist_id UUID REFERENCES therapists,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  medical_conditions TEXT[],
  current_medications TEXT[],
  emergency_contact TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patient_assignments table
CREATE TABLE patient_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients NOT NULL,
  therapist_id UUID REFERENCES therapists NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id, therapist_id)
);

-- Create rehab_assessments table
CREATE TABLE rehab_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients NOT NULL,
  assessment_type TEXT NOT NULL, -- 'initial', 'progress', 'discharge'
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  affected_areas TEXT[],
  movement_limitations TEXT,
  current_medications TEXT[],
  previous_injuries TEXT,
  session_data JSONB,
  ai_assessment TEXT,
  therapist_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create exercise_sessions table
CREATE TABLE exercise_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients NOT NULL,
  exercise_id TEXT NOT NULL,
  session_data JSONB,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add rehabilitation columns to workout_sessions
ALTER TABLE workout_sessions 
ADD COLUMN pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
ADD COLUMN compensation_detected BOOLEAN DEFAULT false,
ADD COLUMN range_of_motion INTEGER CHECK (range_of_motion >= 0 AND range_of_motion <= 100),
ADD COLUMN stability_score INTEGER CHECK (stability_score >= 0 AND stability_score <= 100),
ADD COLUMN movement_compensations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN pain_indicators JSONB DEFAULT '[]'::jsonb;

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
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehab_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;

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
-- REHABILITATION RLS POLICIES
-- =====================================================

-- Clinics policies (admin access only for now)
CREATE POLICY "Clinics are viewable by authenticated users." ON clinics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Clinics can be inserted by service role." ON clinics
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Therapists policies
CREATE POLICY "Therapists are viewable by clinic members." ON therapists
  FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Therapists can be inserted by service role." ON therapists
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Patients policies
CREATE POLICY "Patients are viewable by clinic members." ON patients
  FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Patients can be inserted by service role." ON patients
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Patient assignments policies
CREATE POLICY "Patient assignments are viewable by clinic members." ON patient_assignments
  FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Patient assignments can be inserted by service role." ON patient_assignments
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Rehab assessments policies
CREATE POLICY "Rehab assessments are viewable by clinic members." ON rehab_assessments
  FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Rehab assessments can be inserted by service role." ON rehab_assessments
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Exercise sessions policies
CREATE POLICY "Exercise sessions are viewable by clinic members." ON exercise_sessions
  FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Exercise sessions can be inserted by service role." ON exercise_sessions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

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
-- DEMO DATA FOR JUDGES PRESENTATION
-- =====================================================

-- Insert demo clinic
INSERT INTO clinics (id, name, address, phone, email, license_number, subscription_tier, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Rehabilitation Clinic', '123 Healthcare Ave, Medical City, MC 12345', '(555) 123-4567', 'info@demorehab.com', 'CLINIC-2024-001', 'enterprise', true);

-- Insert demo therapist
INSERT INTO therapists (id, clinic_id, name, email, specialization, license_number, patient_count, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Dr. Sarah Wilson, PT', 'sarah.wilson@demorehab.com', 'Orthopedic Physical Therapy', 'PT-2024-001', 3, true);

-- Insert demo patients
INSERT INTO patients (id, clinic_id, therapist_id, name, email, phone, date_of_birth, medical_conditions, current_medications, emergency_contact, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@email.com', '(555) 111-2222', '1985-03-15', ARRAY['Lower back pain', 'Hip impingement'], ARRAY['Ibuprofen 400mg'], 'Jane Smith (555) 111-2223', 'active'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 333-4444', '1990-07-22', ARRAY['Knee rehabilitation', 'ACL reconstruction'], ARRAY['Acetaminophen 500mg'], 'Mike Johnson (555) 333-4445', 'active'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Mike Davis', 'mike.davis@email.com', '(555) 555-6666', '1978-11-08', ARRAY['Shoulder impingement', 'Rotator cuff tear'], ARRAY['Naproxen 220mg'], 'Lisa Davis (555) 555-6667', 'active');

-- Insert patient assignments
INSERT INTO patient_assignments (patient_id, therapist_id) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001');

-- Insert demo rehab assessments
INSERT INTO rehab_assessments (id, patient_id, assessment_type, pain_level, affected_areas, movement_limitations, current_medications, previous_injuries, session_data, ai_assessment, therapist_notes, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'initial', 6, ARRAY['lower_back', 'left_hip'], 'Difficulty with forward bending and sitting for long periods', ARRAY['Ibuprofen 400mg'], 'Previous lower back strain in 2022', '{"range_of_motion": 75, "strength_tests": {"hip_flexors": 4, "core": 3}}', 'Patient presents with moderate lower back pain and hip impingement. Limited forward flexion and hip mobility. Recommend core strengthening and hip mobility exercises.', 'Initial assessment shows significant movement compensations. Will focus on core stability and hip mobility.', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'initial', 4, ARRAY['right_knee'], 'Difficulty with stairs and prolonged standing', ARRAY['Acetaminophen 500mg'], 'ACL reconstruction 6 months ago', '{"range_of_motion": 85, "strength_tests": {"quadriceps": 3, "hamstrings": 4}}', 'Post-surgical knee rehabilitation progressing well. Good range of motion but quadriceps strength needs improvement. Focus on functional movements.', 'Patient is compliant with home exercises. Good progress since surgery.', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'initial', 7, ARRAY['right_shoulder'], 'Difficulty with overhead movements and sleeping on right side', ARRAY['Naproxen 220mg'], 'Previous shoulder dislocation 2 years ago', '{"range_of_motion": 60, "strength_tests": {"rotator_cuff": 2, "deltoids": 3}}', 'Significant shoulder impingement with limited overhead range of motion. Rotator cuff weakness evident. Need aggressive strengthening program.', 'Patient experiencing significant pain. Will start with gentle range of motion exercises.', NOW() - INTERVAL '1 day');

-- Insert demo exercise sessions
INSERT INTO exercise_sessions (id, patient_id, exercise_id, session_data, pain_level, difficulty, notes, completed_at) VALUES
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'knee_001', '{"reps_completed": 10, "form_score": 85, "compensations": ["hip_hiking"]}', 3, 'beginner', 'Good form overall, slight hip hiking noted', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'knee_002', '{"reps_completed": 12, "form_score": 92, "compensations": []}', 2, 'beginner', 'Excellent form, no compensations detected', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'shoulder_001', '{"reps_completed": 8, "form_score": 78, "compensations": ["shoulder_elevation"]}', 5, 'beginner', 'Some shoulder elevation noted, will adjust technique', NOW() - INTERVAL '30 minutes');

-- Insert demo workout sessions with rehabilitation data
INSERT INTO workout_sessions (id, user_id, workout_id, video_url, pose_data, form_score, ai_feedback, duration, rep_count, calories_burned, pain_level, compensation_detected, range_of_motion, stability_score, movement_compensations, pain_indicators, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'https://demo-videos.com/john-squat-session.mp4', '{"keypoints": [], "analysis": "good_form"}', 85, 'Great squat form! Keep your chest up and maintain that depth.', 15, 12, 120, 3, true, 85, 80, '[{"joint": "left_hip", "compensation_type": "anterior_tilt", "severity": "mild"}]', '[{"area": "lower_back", "intensity": 3, "movement_trigger": "squat"}]', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440014', 'https://demo-videos.com/sarah-lunge-session.mp4', '{"keypoints": [], "analysis": "excellent_form"}', 92, 'Perfect lunge technique! Your knee tracking is spot on.', 20, 15, 150, 2, false, 90, 88, '[]', '[{"area": "right_knee", "intensity": 2, "movement_trigger": "lunge"}]', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440016', 'https://demo-videos.com/mike-shoulder-session.mp4', '{"keypoints": [], "analysis": "needs_improvement"}', 78, 'Good effort! Try to keep your shoulder blades down and back.', 12, 8, 80, 5, true, 60, 70, '[{"joint": "right_shoulder", "compensation_type": "elevation", "severity": "moderate"}]', '[{"area": "right_shoulder", "intensity": 5, "movement_trigger": "overhead_press"}]', NOW() - INTERVAL '30 minutes');

-- Insert demo workouts for rehabilitation with real YouTube videos
INSERT INTO workouts (id, title, description, duration, difficulty, category, tags, exercises, image_url, youtube_url, video_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Lower Back Pain Relief Exercises', 'Physical therapy exercises for lower back pain relief and core strengthening', 15, 'Beginner', 'Rehabilitation', ARRAY['Rehabilitation', 'Lower Back', 'Core', 'Pain Relief'], '[{"name": "Cat-Cow Stretch", "reps": 10, "sets": 3}, {"name": "Knee to Chest", "reps": 8, "sets": 3}, {"name": "Pelvic Tilts", "reps": 12, "sets": 3}]', '/person-doing-core-exercises-and-planks.jpg', 'https://www.youtube.com/embed/2LtF0U5vcd4', '2LtF0U5vcd4', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Knee Rehabilitation Exercises', 'Physical therapy exercises for knee pain and strengthening', 20, 'Beginner', 'Rehabilitation', ARRAY['Rehabilitation', 'Knee', 'Lower Body', 'Strengthening'], '[{"name": "Quad Sets", "reps": 15, "sets": 3}, {"name": "Straight Leg Raises", "reps": 12, "sets": 3}, {"name": "Heel Slides", "reps": 10, "sets": 3}]', '/person-doing-squats-and-leg-exercises.jpg', 'https://www.youtube.com/embed/2C7P2FBHHQo', '2C7P2FBHHQo', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', 'Shoulder Pain Relief Exercises', 'Physical therapy exercises for shoulder pain and rotator cuff strengthening', 18, 'Beginner', 'Rehabilitation', ARRAY['Rehabilitation', 'Shoulder', 'Upper Body', 'Rotator Cuff'], '[{"name": "Pendulum Exercises", "reps": 10, "sets": 3}, {"name": "Wall Slides", "reps": 8, "sets": 3}, {"name": "External Rotation", "reps": 12, "sets": 3}]', '/person-doing-upper-body-exercises.jpg', 'https://www.youtube.com/embed/IODxDxX7oi4', 'IODxDxX7oi4', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'Hip Pain Relief Exercises', 'Physical therapy exercises for hip pain and mobility', 12, 'Beginner', 'Rehabilitation', ARRAY['Rehabilitation', 'Hip', 'Mobility', 'Pain Relief'], '[{"name": "Hip Flexor Stretch", "reps": 8, "sets": 3}, {"name": "Clamshells", "reps": 15, "sets": 3}, {"name": "Hip Bridges", "reps": 12, "sets": 3}]', '/person-doing-core-exercises-and-planks.jpg', 'https://www.youtube.com/embed/7Ng3k8k1dQo', '7Ng3k8k1dQo', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'Neck Pain Relief Exercises', 'Physical therapy exercises for neck pain and tension relief', 10, 'Beginner', 'Rehabilitation', ARRAY['Rehabilitation', 'Neck', 'Tension Relief', 'Mobility'], '[{"name": "Neck Rolls", "reps": 8, "sets": 2}, {"name": "Chin Tucks", "reps": 10, "sets": 3}, {"name": "Shoulder Shrugs", "reps": 12, "sets": 3}]', '/person-doing-upper-body-exercises.jpg', 'https://www.youtube.com/embed/2LtF0U5vcd4', '2LtF0U5vcd4', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440019', 'Ankle Sprain Recovery', 'Physical therapy exercises for ankle sprain recovery and strengthening', 15, 'Beginner', 'Rehabilitation', ARRAY['Rehabilitation', 'Ankle', 'Sprain Recovery', 'Balance'], '[{"name": "Ankle Circles", "reps": 10, "sets": 3}, {"name": "Calf Raises", "reps": 15, "sets": 3}, {"name": "Balance Exercises", "reps": 8, "sets": 3}]', '/person-doing-squats-and-leg-exercises.jpg', 'https://www.youtube.com/embed/2C7P2FBHHQo', '2C7P2FBHHQo', NOW(), NOW());

-- =====================================================
-- DEMO USER ACCOUNTS (for testing)
-- =====================================================

-- Note: These would normally be created through Supabase Auth
-- For demo purposes, we'll reference them by ID

-- Demo provider account (Dr. Sarah Wilson)
-- Email: sarah.wilson@demorehab.com
-- Password: DemoProvider123!

-- Demo user accounts
-- Email: john.smith@email.com, Password: DemoUser123!
-- Email: sarah.johnson@email.com, Password: DemoUser123!
-- Email: mike.davis@email.com, Password: DemoUser123!

-- =====================================================
-- COMPLETE! 
-- =====================================================
-- The entire Vibe Coach database is now set up with:
-- ✅ All tables created
-- ✅ Row Level Security enabled
-- ✅ All policies configured
-- ✅ Functions and triggers set up
-- ✅ Demo data inserted for judges presentation
-- ✅ Performance indexes created
-- 
-- You can now run this single SQL script to create everything!