# Vibe Coach - AI Fitness Assistant

A real-time AI fitness and rehabilitation assistant built with Next.js, featuring both frontend and backend components. The application provides pose analysis, AI-powered feedback, text-to-speech, and comprehensive workout management.

## 🚀 Features

### Frontend
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Responsive Design**: Mobile-first design with beautiful components
- **Real-time Video**: WebRTC integration for live pose analysis
- **Workout Tracking**: Progress tracking and workout management
- **Theme Support**: Dark/light mode with next-themes

### Backend
- **Real-time Pose Analysis**: Analyze exercise form using computer vision
- **AI-Powered Feedback**: Generate personalized workout feedback using OpenAI
- **Text-to-Speech**: Convert feedback to audio using ElevenLabs
- **Workout Management**: Create, manage, and track workouts and sessions
- **User Authentication**: Secure user management with Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Google Cloud Ready**: Optimized for deployment on Google Cloud Platform

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 with TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend
- **Framework**: Next.js API routes
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
   cd vibe-coach-app
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

The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

#### POST `/api/auth/signin`
Sign in an existing user.

#### POST `/api/auth/signout`
Sign out the current user.

### Pose Analysis Endpoints

#### POST `/api/pose/analyze`
Analyze pose data for form correction.

### Feedback Endpoints

#### POST `/api/feedback/generate`
Generate AI-powered feedback for workouts.

### Text-to-Speech Endpoints

#### POST `/api/tts/generate`
Convert text to speech using ElevenLabs.

### Workout Management Endpoints

- `GET /api/workouts` - Get workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts/[id]` - Get specific workout
- `PUT /api/workouts/[id]` - Update workout
- `DELETE /api/workouts/[id]` - Delete workout

### Session Tracking Endpoints

- `GET /api/sessions` - Get user's workout sessions
- `POST /api/sessions` - Start a new workout session
- `GET /api/sessions/[id]` - Get specific session
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

### Exercise Management Endpoints

- `GET /api/exercises` - Get exercises
- `POST /api/exercises` - Create exercise

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

2. **Deploy using the deployment script**
   ```bash
   # Set environment variables
   export GOOGLE_CLOUD_PROJECT_ID=your-project-id
   export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

   # Run deployment
   npm run deploy
   ```

3. **Manual deployment**
   ```bash
   # Build and push Docker image
   npm run docker:build
   docker tag vibe-coach-app gcr.io/your-project-id/vibe-coach-app
   docker push gcr.io/your-project-id/vibe-coach-app

   # Deploy to Cloud Run
   gcloud run deploy vibe-coach-app \
     --image gcr.io/your-project-id/vibe-coach-app \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## 🧪 Testing

Run the development server and test endpoints using:

```bash
npm run dev
```

Test with tools like Postman or curl:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test pose analysis
curl -X POST http://localhost:3000/api/pose/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "session_exercise_id": "uuid",
    "keypoints": [{"x": 0.5, "y": 0.3, "confidence": 0.95}]
  }'
```

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- JWT-based authentication via Supabase
- CORS configuration for allowed origins
- Input validation on all API endpoints
- Rate limiting (recommended for production)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Google Cloud
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run health` - Test health endpoint

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

## 🔄 Frontend-Backend Integration

This full-stack application provides:

1. **Frontend**: Modern React-based UI with real-time video capture
2. **Backend**: Comprehensive API for pose analysis, AI feedback, and data management
3. **Database**: Secure PostgreSQL database with real-time capabilities
4. **AI Integration**: OpenAI for intelligent feedback and ElevenLabs for audio
5. **Deployment**: Production-ready Google Cloud Platform deployment

The application is designed to work seamlessly with both frontend and backend components running together, providing a complete real-time AI fitness coaching experience.