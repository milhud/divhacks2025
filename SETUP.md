# Vibe Coach - Backend Setup Guide

This guide will help you set up the complete backend infrastructure for the Vibe Coach AI fitness assistant.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- An OpenAI API key
- Git installed

## 1. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard:
   - Go to Settings > API
   - Copy your Project URL and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your anon/public key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy your service_role key and paste it as `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key and paste it as `OPENAI_API_KEY`

### NextAuth Setup

1. Generate a random secret for NextAuth:
   ```bash
   openssl rand -base64 32
   ```
2. Paste the result as `NEXTAUTH_SECRET`

## 2. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create all necessary tables and functions

## 3. Storage Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `workout-videos`
3. Set the bucket to public if you want public access to videos
4. Configure RLS policies for the bucket if needed

## 4. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 5. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## 6. Test the Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. Try uploading a video file
3. Check the browser console for any errors
4. Verify that data is being stored in your Supabase database

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Video Processing
- `POST /api/video/upload` - Upload workout video
- `POST /api/pose/analyze` - Analyze pose from video
- `POST /api/feedback/generate` - Generate AI feedback

### Data Management
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create new workout
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `GET /api/progress` - Get user progress

## Database Schema

The database includes the following tables:

- `profiles` - User profiles
- `workouts` - Workout templates
- `workout_sessions` - Individual workout sessions
- `pose_analysis` - Detailed pose analysis data
- `user_progress` - User progress tracking

## Features Implemented

✅ **Authentication System**
- User registration and login
- Session management
- Profile creation

✅ **Video Upload & Storage**
- File upload to Supabase Storage
- Video format validation
- File size limits

✅ **Pose Detection**
- Mock pose analysis (ready for MediaPipe integration)
- Form scoring system
- Rep counting

✅ **AI Feedback Generation**
- OpenAI integration for personalized feedback
- Exercise-specific analysis
- Motivational coaching

✅ **Progress Tracking**
- Session history
- Form score tracking
- Streak counting
- Statistics dashboard

## Next Steps for Production

1. **Real Pose Detection**: Integrate MediaPipe or MoveNet for actual pose detection
2. **Real-time Analysis**: Implement WebRTC for live video analysis
3. **Advanced AI**: Add more sophisticated form analysis algorithms
4. **User Management**: Complete the authentication UI
5. **Mobile Optimization**: Ensure mobile compatibility
6. **Performance**: Optimize for production deployment

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your environment variables
   - Verify your Supabase project is active
   - Ensure RLS policies are correctly set

2. **OpenAI API Error**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the API key has the necessary permissions

3. **File Upload Issues**
   - Check file size limits
   - Verify file format is supported
   - Ensure Supabase Storage bucket exists

4. **Database Errors**
   - Run the schema.sql file completely
   - Check for any SQL syntax errors
   - Verify all tables were created successfully

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

## Security Notes

- Never commit your `.env.local` file
- Use environment variables for all sensitive data
- Implement proper RLS policies in Supabase
- Validate all user inputs
- Use HTTPS in production

## Deployment

For production deployment:
1. Set up production environment variables
2. Configure your domain in Supabase
3. Deploy to Vercel, Netlify, or your preferred platform
4. Set up monitoring and logging
5. Configure CDN for video storage if needed