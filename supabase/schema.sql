-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gyms table
CREATE TABLE public.gyms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_members table (many-to-many relationship)
CREATE TABLE public.gym_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'trainer', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id, user_id)
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'strength', 'cardio', 'flexibility', 'rehab'
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  target_muscles TEXT[], -- array of muscle groups
  instructions TEXT,
  demo_video_url TEXT,
  pose_keypoints JSONB, -- store reference pose keypoints
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  gym_id UUID REFERENCES public.gyms(id),
  is_public BOOLEAN DEFAULT false,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_exercises table (many-to-many relationship)
CREATE TABLE public.workout_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER DEFAULT 1,
  reps INTEGER,
  duration_seconds INTEGER, -- for time-based exercises
  rest_seconds INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(workout_id, order_index)
);

-- Create workout_assignments table
CREATE TABLE public.workout_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id),
  assignment_id UUID REFERENCES public.workout_assignments(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  total_duration INTEGER, -- in seconds
  overall_score DECIMAL(5,2), -- 0-100
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_exercises table (tracks individual exercises within a session)
CREATE TABLE public.session_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  rep_count INTEGER DEFAULT 0,
  form_score DECIMAL(5,2), -- 0-100
  feedback TEXT,
  pose_data JSONB, -- store pose keypoints data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table (stores AI-generated feedback)
CREATE TABLE public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  feedback_type TEXT CHECK (feedback_type IN ('real_time', 'post_session', 'form_correction')),
  content TEXT NOT NULL,
  audio_url TEXT, -- for TTS feedback
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pose_analysis table (stores real-time pose analysis data)
CREATE TABLE public.pose_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  keypoints JSONB NOT NULL, -- pose keypoints data
  angles JSONB, -- calculated joint angles
  form_metrics JSONB, -- form analysis metrics
  corrections JSONB, -- suggested corrections
  confidence_score DECIMAL(5,2) -- 0-100
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for gyms
CREATE POLICY "Anyone can view public gyms" ON public.gyms
  FOR SELECT USING (true);

CREATE POLICY "Gym admins can manage their gym" ON public.gyms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_members 
      WHERE gym_id = gyms.id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'trainer')
    )
  );

-- RLS Policies for gym_members
CREATE POLICY "Users can view gym memberships" ON public.gym_members
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.gym_members gm2 
    WHERE gm2.gym_id = gym_members.gym_id 
    AND gm2.user_id = auth.uid() 
    AND gm2.role IN ('admin', 'trainer')
  ));

-- RLS Policies for exercises
CREATE POLICY "Anyone can view public exercises" ON public.exercises
  FOR SELECT USING (true);

CREATE POLICY "Users can create exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for workouts
CREATE POLICY "Users can view public workouts or their own" ON public.workouts
  FOR SELECT USING (
    is_public = true OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workout_assignments 
      WHERE workout_id = workouts.id 
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Users can create workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own sessions" ON public.workout_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions" ON public.workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for session_exercises
CREATE POLICY "Users can view their session exercises" ON public.session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = session_exercises.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create session exercises" ON public.session_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = session_exercises.session_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for feedback
CREATE POLICY "Users can view their feedback" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = feedback.session_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for pose_analysis
CREATE POLICY "Users can view their pose analysis" ON public.pose_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions ws ON se.session_id = ws.id
      WHERE se.id = pose_analysis.session_exercise_id 
      AND ws.user_id = auth.uid()
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_assignments_updated_at BEFORE UPDATE ON public.workout_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
