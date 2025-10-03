# Vibe Coach Backend API

A real-time AI fitness and rehabilitation assistant backend built with Next.js, Supabase, OpenAI, and ElevenLabs. This backend provides APIs for pose analysis, AI-powered feedback, text-to-speech, and workout management.

## 🚀 Features

- **Real-time Pose Analysis**: Analyze exercise form using computer vision
- **AI-Powered Feedback**: Generate personalized workout feedback using OpenAI
- **Text-to-Speech**: Convert feedback to audio using ElevenLabs
- **Workout Management**: Create, manage, and track workouts and sessions
- **User Authentication**: Secure user management with Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Google Cloud Ready**: Optimized for deployment on Google Cloud Platform

## 🛠 Tech Stack

- **Framework**: Next.js 15.1.8 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 for feedback generation
- **TTS**: ElevenLabs for text-to-speech
- **Pose Analysis**: Custom pose detection algorithms
- **Deployment**: Google Cloud Platform ready

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- A Supabase project set up
- OpenAI API key
- ElevenLabs API key
- Google Cloud Project (for deployment)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-coach-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

4. **Configure your environment variables in `.env.local`**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # ElevenLabs Configuration
   ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # Google Cloud Configuration (for deployment)
   GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
   GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_key.json

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
   ```

5. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL script from `supabase/schema.sql` to create all tables and policies

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": { ... },
  "session": { ... }
}
```

#### POST `/api/auth/signin`
Sign in an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/signout`
Sign out the current user.

### Pose Analysis Endpoints

#### POST `/api/pose/analyze`
Analyze pose data for form correction.

**Request Body:**
```json
{
  "session_exercise_id": "uuid",
  "keypoints": [
    {
      "x": 0.5,
      "y": 0.3,
      "confidence": 0.95
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "form_metrics": {
    "rep_count": 5,
    "form_score": 85,
    "corrections": ["Keep your back straight"],
    "confidence_score": 92
  },
  "should_give_feedback": true
}
```

### Feedback Endpoints

#### POST `/api/feedback/generate`
Generate AI-powered feedback for workouts.

**Request Body:**
```json
{
  "session_id": "uuid",
  "exercise_id": "uuid",
  "feedback_type": "post_session",
  "session_data": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "id": "uuid",
    "content": "Great workout! Your form improved throughout the session...",
    "severity": "info",
    "feedback_type": "post_session",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Text-to-Speech Endpoints

#### POST `/api/tts/generate`
Convert text to speech using ElevenLabs.

**Request Body:**
```json
{
  "text": "Keep your back straight",
  "voice_id": "JBFqnCBsd6RMkjVDRZzb",
  "session_id": "uuid",
  "feedback_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "audio_url": "data:audio/mp3;base64,base64_encoded_audio",
  "voice_id": "JBFqnCBsd6RMkjVDRZzb",
  "text_length": 20
}
```

### Workout Management Endpoints

#### GET `/api/workouts`
Get workouts for a user.

**Query Parameters:**
- `user_id`: Filter by user ID
- `gym_id`: Filter by gym ID
- `is_public`: Filter public workouts

#### POST `/api/workouts`
Create a new workout.

**Request Body:**
```json
{
  "name": "Upper Body Strength",
  "description": "A comprehensive upper body workout",
  "exercises": [
    {
      "exercise_id": "uuid",
      "sets": 3,
      "reps": 12,
      "rest_seconds": 60
    }
  ],
  "is_public": false,
  "difficulty_level": 3,
  "estimated_duration": 45
}
```

#### GET `/api/workouts/[id]`
Get a specific workout by ID.

#### PUT `/api/workouts/[id]`
Update a workout.

#### DELETE `/api/workouts/[id]`
Delete a workout.

### Session Tracking Endpoints

#### GET `/api/sessions`
Get user's workout sessions.

**Query Parameters:**
- `status`: Filter by session status
- `limit`: Number of sessions to return
- `offset`: Pagination offset

#### POST `/api/sessions`
Start a new workout session.

**Request Body:**
```json
{
  "workout_id": "uuid",
  "assignment_id": "uuid"
}
```

#### GET `/api/sessions/[id]`
Get a specific session by ID.

#### PUT `/api/sessions/[id]`
Update a session.

#### DELETE `/api/sessions/[id]`
Delete a session.

### Exercise Management Endpoints

#### GET `/api/exercises`
Get exercises.

**Query Parameters:**
- `category`: Filter by exercise category
- `difficulty_level`: Filter by difficulty
- `search`: Search by name or description
- `limit`: Number of exercises to return
- `offset`: Pagination offset

#### POST `/api/exercises`
Create a new exercise.

**Request Body:**
```json
{
  "name": "Push-ups",
  "description": "Classic bodyweight exercise",
  "category": "strength",
  "difficulty_level": 2,
  "target_muscles": ["chest", "shoulders", "triceps"],
  "instructions": "Start in plank position...",
  "demo_video_url": "https://example.com/video.mp4",
  "pose_keypoints": { ... }
}
```

## 🗄 Database Schema

The database includes the following main tables:

- **profiles**: User profiles and roles
- **gyms**: Gym/clinic information
- **exercises**: Exercise definitions and pose templates
- **workouts**: Workout plans with exercise sequences
- **workout_sessions**: Individual workout sessions
- **session_exercises**: Exercises within a session
- **feedback**: AI-generated feedback
- **pose_analysis**: Real-time pose analysis data

All tables have Row Level Security (RLS) enabled for data protection.

## 🚀 Deployment

### Google Cloud Platform

1. **Set up Google Cloud Project**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

3. **Build and deploy**
   ```bash
   npm run build
   gcloud builds submit --tag gcr.io/your-project-id/vibe-coach-backend
   gcloud run deploy vibe-coach-backend \
     --image gcr.io/your-project-id/vibe-coach-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Set environment variables in Google Cloud Run**
   - Go to Cloud Run console
   - Select your service
   - Go to "Edit & Deploy New Revision"
   - Set all environment variables from your `.env.local`

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `NODE_ENV=production`
- `ALLOWED_ORIGINS` (your frontend domains)

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- JWT-based authentication via Supabase
- CORS configuration for allowed origins
- Input validation on all API endpoints
- Rate limiting (recommended for production)

## 🧪 Testing

Run the development server and test endpoints using:

```bash
npm run dev
```

Test with tools like Postman or curl:

```bash
# Test pose analysis
curl -X POST http://localhost:3000/api/pose/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "session_exercise_id": "uuid",
    "keypoints": [{"x": 0.5, "y": 0.3, "confidence": 0.95}]
  }'
```

## 📝 API Rate Limits

- OpenAI API: Follows OpenAI's rate limits
- ElevenLabs API: Follows ElevenLabs' rate limits
- Supabase: Follows Supabase's rate limits
- Recommended: Implement rate limiting middleware for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the API documentation above
2. Review the database schema in `supabase/schema.sql`
3. Check environment variable configuration
4. Ensure all required services are properly set up

## 🔄 Frontend Integration

This backend is designed to work with a Next.js frontend. The frontend should:

1. Handle user authentication using Supabase Auth
2. Capture video/pose data using WebRTC
3. Send pose data to `/api/pose/analyze`
4. Display real-time feedback and audio cues
5. Manage workouts and sessions through the provided APIs

The backend provides all necessary APIs for a complete real-time AI fitness coaching experience.
