-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Create workouts table
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  duration integer, -- in minutes
  difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  category text not null,
  exercises jsonb default '[]'::jsonb, -- array of exercise objects
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for workouts
alter table workouts enable row level security;

-- Create policies for workouts
create policy "Workouts are viewable by everyone." on workouts
  for select using (true);

-- Create workout_sessions table
create table workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  workout_id uuid references workouts not null,
  video_url text, -- URL to uploaded video in Supabase storage
  pose_data jsonb, -- pose detection results
  form_score integer check (form_score >= 0 and form_score <= 100),
  ai_feedback text,
  duration integer, -- actual duration in minutes
  rep_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for workout_sessions
alter table workout_sessions enable row level security;

-- Create policies for workout_sessions
create policy "Users can view their own sessions." on workout_sessions
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own sessions." on workout_sessions
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own sessions." on workout_sessions
  for update using ((select auth.uid()) = user_id);

-- Create pose_analysis table for storing detailed pose data
create table pose_analysis (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references workout_sessions not null,
  frame_number integer not null,
  timestamp real not null, -- timestamp in seconds
  keypoints jsonb not null, -- pose keypoints data
  confidence real, -- overall confidence score
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for pose_analysis
alter table pose_analysis enable row level security;

-- Create policies for pose_analysis
create policy "Users can view pose analysis for their sessions." on pose_analysis
  for select using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = pose_analysis.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert pose analysis for their sessions." on pose_analysis
  for insert with check (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = pose_analysis.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

-- Create user_progress table for tracking overall progress
create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  total_workouts integer default 0,
  total_duration integer default 0, -- in minutes
  average_form_score real default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_workout_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id)
);

-- Enable RLS for user_progress
alter table user_progress enable row level security;

-- Create policies for user_progress
create policy "Users can view their own progress." on user_progress
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress." on user_progress
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress." on user_progress
  for update using ((select auth.uid()) = user_id);

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_progress (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update user progress
create or replace function public.update_user_progress()
returns trigger as $$
begin
  -- Update user progress when a new session is created
  if TG_OP = 'INSERT' then
    update user_progress
    set 
      total_workouts = total_workouts + 1,
      total_duration = total_duration + coalesce(new.duration, 0),
      average_form_score = (
        select avg(form_score) 
        from workout_sessions 
        where user_id = new.user_id and form_score is not null
      ),
      last_workout_date = current_date,
      updated_at = now()
    where user_id = new.user_id;
  end if;
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Create trigger to update user progress
create trigger on_workout_session_created
  after insert on workout_sessions
  for each row execute procedure public.update_user_progress();

-- Insert sample workouts
insert into workouts (title, description, duration, difficulty, category, exercises, image_url) values
('Full Body Strength', 'Build overall strength with compound movements', 45, 'Intermediate', 'Strength', 
 '[{"name": "Squats", "reps": 12, "sets": 3}, {"name": "Push-ups", "reps": 10, "sets": 3}, {"name": "Lunges", "reps": 10, "sets": 3}]', 
 '/person-doing-strength-training-workout.jpg'),
 
('Upper Body Focus', 'Target chest, back, shoulders, and arms', 30, 'Beginner', 'Strength',
 '[{"name": "Push-ups", "reps": 8, "sets": 3}, {"name": "Pull-ups", "reps": 5, "sets": 3}, {"name": "Shoulder Press", "reps": 10, "sets": 3}]',
 '/person-doing-upper-body-exercises.jpg'),
 
('Lower Body Power', 'Explosive leg and glute exercises', 40, 'Advanced', 'Strength',
 '[{"name": "Squats", "reps": 15, "sets": 4}, {"name": "Lunges", "reps": 12, "sets": 3}, {"name": "Jump Squats", "reps": 10, "sets": 3}]',
 '/person-doing-squats-and-leg-exercises.jpg'),
 
('Core & Stability', 'Strengthen your core and improve balance', 25, 'Beginner', 'Core',
 '[{"name": "Plank", "reps": 1, "sets": 3, "duration": 30}, {"name": "Crunches", "reps": 15, "sets": 3}, {"name": "Mountain Climbers", "reps": 20, "sets": 3}]',
 '/person-doing-core-exercises-and-planks.jpg'),
 
('HIIT Cardio Blast', 'High-intensity intervals for maximum burn', 20, 'Intermediate', 'Cardio',
 '[{"name": "Burpees", "reps": 10, "sets": 4, "rest": 30}, {"name": "Jumping Jacks", "reps": 30, "sets": 4, "rest": 30}, {"name": "High Knees", "reps": 30, "sets": 4, "rest": 30}]',
 '/high-intensity-cardio.png'),
 
('Mobility & Flexibility', 'Improve range of motion and prevent injury', 30, 'Beginner', 'Mobility',
 '[{"name": "Cat-Cow Stretch", "reps": 1, "sets": 3, "duration": 30}, {"name": "Hip Flexor Stretch", "reps": 1, "sets": 2, "duration": 45}, {"name": "Shoulder Rolls", "reps": 10, "sets": 3}]',
 '/person-doing-stretching-and-mobility-exercises.jpg');
