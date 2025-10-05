-- VibeCoach.Health Database Schema
-- Updated for comprehensive rehabilitation and healthcare provider system

-- Drop all tables first (in reverse dependency order)
DROP TABLE IF EXISTS provider_dashboard CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS progress_tracking CASCADE;
DROP TABLE IF EXISTS exercise_analysis CASCADE;
DROP TABLE IF EXISTS exercise_sessions CASCADE;
DROP TABLE IF EXISTS assigned_exercises CASCADE;
DROP TABLE IF EXISTS program_exercises CASCADE;
DROP TABLE IF EXISTS exercise_programs CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS patient_provider_relationships CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS progress_status CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS exercise_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin');

-- Exercise types enum
CREATE TYPE exercise_type AS ENUM (
  'squat', 'bicep_curl', 'pushup', 'plank', 'lunge', 'shoulder_press',
  'knee_flexion', 'shoulder_abduction', 'ankle_pumps', 'hip_flexion', 
  'wrist_flexion', 'neck_rotation'
);

-- Exercise difficulty levels
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'rehab');

-- Progress status
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  date_of_birth DATE,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_level difficulty_level DEFAULT 'beginner',
  goals TEXT,
  bio TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create healthcare providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE,
  specialization TEXT,
  years_experience INTEGER,
  hospital_affiliation TEXT,
  phone_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient-provider relationships
CREATE TABLE patient_provider_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, provider_id)
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type exercise_type NOT NULL,
  emoji TEXT,
  description TEXT,
  instructions TEXT[],
  difficulty difficulty_level DEFAULT 'beginner',
  target_muscle_groups TEXT[],
  equipment_needed TEXT[],
  duration_seconds INTEGER, -- for time-based exercises
  is_rehab_exercise BOOLEAN DEFAULT false,
  motion_control JSONB, -- stores angle ranges, form cues, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise programs (workout plans)
CREATE TABLE exercise_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  difficulty difficulty_level DEFAULT 'beginner',
  estimated_duration_weeks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program exercises (many-to-many relationship)
CREATE TABLE program_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES exercise_programs(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL,
  reps INTEGER,
  duration_seconds INTEGER, -- for time-based exercises
  rest_seconds INTEGER DEFAULT 60,
  order_index INTEGER,
  target_form_score INTEGER DEFAULT 75,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assigned exercises (provider assigns to patients)
CREATE TABLE assigned_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  program_id UUID REFERENCES exercise_programs(id), -- optional, if part of a program
  sets INTEGER NOT NULL,
  reps INTEGER,
  duration_seconds INTEGER,
  target_form_score INTEGER DEFAULT 75,
  frequency_per_week INTEGER DEFAULT 3,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status progress_status DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise sessions (when patient performs exercises)
CREATE TABLE exercise_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_exercise_id UUID REFERENCES assigned_exercises(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  total_reps_completed INTEGER DEFAULT 0,
  average_form_score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise analysis (AI analysis results)
CREATE TABLE exercise_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exercise_type exercise_type NOT NULL,
  form_score INTEGER NOT NULL CHECK (form_score >= 0 AND form_score <= 100),
  rep_count INTEGER DEFAULT 0,
  primary_angle DECIMAL(5,2),
  joint_angles JSONB, -- stores all joint angle data
  feedback TEXT[],
  warnings TEXT[],
  recommendations TEXT[],
  keypoints JSONB, -- MediaPipe pose landmarks
  video_url TEXT, -- optional, if video was recorded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress tracking
CREATE TABLE progress_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_exercise_id UUID REFERENCES assigned_exercises(id) ON DELETE CASCADE,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  average_form_score DECIMAL(5,2),
  last_session_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, assigned_exercise_id)
);

-- Create notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exercise_reminder', 'progress_update', 'provider_message', 'system')),
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- additional data for the notification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider dashboard data
CREATE TABLE provider_dashboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_exercise_id UUID REFERENCES assigned_exercises(id) ON DELETE CASCADE,
  last_activity TIMESTAMP WITH TIME ZONE,
  compliance_rate DECIMAL(5,2), -- percentage of completed sessions
  average_form_score DECIMAL(5,2),
  needs_attention BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_assigned_exercises_patient ON assigned_exercises(patient_id);
CREATE INDEX idx_assigned_exercises_provider ON assigned_exercises(provider_id);
CREATE INDEX idx_exercise_sessions_patient ON exercise_sessions(patient_id);
CREATE INDEX idx_exercise_sessions_date ON exercise_sessions(started_at);
CREATE INDEX idx_exercise_analysis_session ON exercise_analysis(session_id);
CREATE INDEX idx_progress_tracking_patient ON progress_tracking(patient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_provider_dashboard_provider ON provider_dashboard(provider_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_programs_updated_at BEFORE UPDATE ON exercise_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assigned_exercises_updated_at BEFORE UPDATE ON assigned_exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_dashboard_updated_at BEFORE UPDATE ON provider_dashboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default exercises
INSERT INTO exercises (name, type, emoji, description, instructions, difficulty, target_muscle_groups, is_rehab_exercise, motion_control) VALUES
-- Regular exercises
('Squat', 'squat', '🏋️', 'Lower body strength exercise', ARRAY['Stand with feet shoulder-width apart', 'Lower down until thighs are parallel to floor', 'Keep knees over toes', 'Drive through heels to stand up'], 'intermediate', ARRAY['quadriceps', 'glutes', 'hamstrings'], false, '{"primaryAngle": "knee", "targetRange": [60, 120], "formCues": ["Keep knees over toes", "Maintain straight back"]}'),
('Bicep Curl', 'bicep_curl', '💪', 'Arm strength exercise', ARRAY['Stand with arms at sides', 'Curl weights up to shoulders', 'Keep elbows close to body', 'Control the movement down'], 'beginner', ARRAY['biceps'], false, '{"primaryAngle": "elbow", "targetRange": [30, 150], "formCues": ["Keep elbows still", "Control the weight"]}'),
('Pushup', 'pushup', '🔥', 'Upper body strength exercise', ARRAY['Start in plank position', 'Lower chest to ground', 'Keep body straight', 'Push back up to start'], 'intermediate', ARRAY['chest', 'triceps', 'shoulders'], false, '{"primaryAngle": "elbow", "targetRange": [60, 150], "formCues": ["Keep body straight", "Full range of motion"]}'),
('Plank', 'plank', '🧘', 'Core stability exercise', ARRAY['Hold straight body position', 'Keep hips level', 'Engage core muscles', 'Breathe steadily'], 'intermediate', ARRAY['core', 'shoulders'], false, '{"primaryAngle": "hip", "targetRange": [160, 180], "formCues": ["Keep body straight", "Don''t sag hips"]}'),
('Lunge', 'lunge', '🦵', 'Single leg strength exercise', ARRAY['Step forward with one leg', 'Lower back knee toward ground', 'Keep front knee over ankle', 'Push back to starting position'], 'intermediate', ARRAY['quadriceps', 'glutes'], false, '{"primaryAngle": "knee", "targetRange": [60, 120], "formCues": ["Keep front knee over ankle", "Control the movement"]}'),
('Shoulder Press', 'shoulder_press', '💪', 'Overhead strength exercise', ARRAY['Start with weights at shoulder level', 'Press straight up overhead', 'Keep core engaged', 'Lower with control'], 'intermediate', ARRAY['shoulders', 'triceps'], false, '{"primaryAngle": "elbow", "targetRange": [120, 180], "formCues": ["Press straight up", "Keep core tight"]}'),

-- Rehab exercises
('Knee Flexion', 'knee_flexion', '🦵', 'Gentle knee bending for mobility and strength', ARRAY['Sit or lie down comfortably', 'Slowly bend your knee as far as comfortable', 'Hold for 2 seconds', 'Slowly straighten your leg', 'Keep movements controlled and smooth'], 'rehab', ARRAY['quadriceps', 'hamstrings'], true, '{"primaryAngle": "knee", "targetRange": [60, 120], "formCues": ["Keep hip stable", "Control the movement", "Don''t force the range"]}'),
('Shoulder Abduction', 'shoulder_abduction', '🤲', 'Lifting arm to the side for shoulder mobility', ARRAY['Stand or sit with good posture', 'Start with arm at your side', 'Slowly lift arm out to the side', 'Lift to shoulder height or as comfortable', 'Lower slowly and controlled'], 'rehab', ARRAY['shoulders'], true, '{"primaryAngle": "shoulder", "targetRange": [0, 90], "formCues": ["Keep shoulder blade stable", "Don''t shrug", "Move slowly"]}'),
('Ankle Pumps', 'ankle_pumps', '👣', 'Ankle movement for circulation and mobility', ARRAY['Sit or lie down comfortably', 'Point your toes away from you', 'Then pull your toes toward you', 'Keep the movement smooth', 'Don''t force the range of motion'], 'rehab', ARRAY['calves', 'ankles'], true, '{"primaryAngle": "ankle", "targetRange": [80, 120], "formCues": ["Keep leg still", "Move only the ankle", "Smooth motion"]}'),
('Hip Flexion', 'hip_flexion', '🦴', 'Lifting leg for hip mobility and strength', ARRAY['Lie on your back or sit in a chair', 'Slowly lift one knee toward your chest', 'Hold for 2 seconds', 'Lower slowly', 'Keep your back straight'], 'rehab', ARRAY['hip_flexors'], true, '{"primaryAngle": "hip", "targetRange": [90, 150], "formCues": ["Keep back straight", "Control the movement", "Don''t arch back"]}'),
('Wrist Flexion', 'wrist_flexion', '✋', 'Wrist bending for flexibility and strength', ARRAY['Sit with forearm supported', 'Bend wrist up as far as comfortable', 'Hold for 2 seconds', 'Bend wrist down as far as comfortable', 'Keep movements controlled'], 'rehab', ARRAY['forearms', 'wrists'], true, '{"primaryAngle": "wrist", "targetRange": [60, 120], "formCues": ["Keep forearm still", "Move only the wrist", "Smooth motion"]}'),
('Neck Rotation', 'neck_rotation', '👤', 'Gentle neck turning for mobility', ARRAY['Sit or stand with good posture', 'Slowly turn head to the right', 'Hold for 3 seconds', 'Return to center', 'Repeat to the left'], 'rehab', ARRAY['neck'], true, '{"primaryAngle": "neck", "targetRange": [0, 45], "formCues": ["Keep shoulders level", "Move slowly", "Don''t force the turn"]}');

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_provider_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_dashboard ENABLE ROW LEVEL SECURITY;

-- Profiles can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Providers can view their patients' data
CREATE POLICY "Providers can view patient data" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      JOIN providers p ON ppr.provider_id = p.id
      WHERE ppr.patient_id = profiles.id
      AND p.profile_id = auth.uid()
    )
  );

-- Patients can view their assigned exercises
CREATE POLICY "Patients can view own assigned exercises" ON assigned_exercises
  FOR SELECT USING (patient_id = auth.uid());

-- Providers can view and manage their assigned exercises
CREATE POLICY "Providers can manage assigned exercises" ON assigned_exercises
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM providers WHERE profile_id = auth.uid()
    )
  );

-- Patients can view their own exercise sessions
CREATE POLICY "Patients can view own sessions" ON exercise_sessions
  FOR SELECT USING (patient_id = auth.uid());

-- Providers can view their patients' sessions
CREATE POLICY "Providers can view patient sessions" ON exercise_sessions
  FOR SELECT USING (
    patient_id IN (
      SELECT ppr.patient_id FROM patient_provider_relationships ppr
      JOIN providers p ON ppr.provider_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can view own dashboard" ON provider_dashboard
  FOR SELECT USING (
    provider_id IN (
      SELECT id FROM providers WHERE profile_id = auth.uid()
    )
  );