# Vibe Coach Backend - Setup Guide

This guide will walk you through setting up the Vibe Coach backend API step by step.

## 🚀 Quick Start

### 1. Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Git** installed
- **Docker** installed (for containerization)
- **Google Cloud CLI** installed (for deployment)
- Access to the following services:
  - Supabase account
  - OpenAI API key
  - ElevenLabs API key
  - Google Cloud Platform account

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd vibe-coach-backend

# Install dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy the environment template
cp env.example .env.local

# Edit the environment file
nano .env.local  # or use your preferred editor
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Google Cloud Configuration (for deployment)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 4. Database Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Set up the Database Schema**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL script to create all tables and policies

3. **Verify Database Setup**:
   - Check that all tables are created
   - Verify Row Level Security (RLS) is enabled
   - Test the connection

### 5. API Keys Setup

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local`

#### ElevenLabs API Key
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Create an account or sign in
3. Go to your profile settings
4. Copy your API key
5. Add it to your `.env.local`

### 6. Development Server

```bash
# Start the development server
npm run dev

# The API will be available at http://localhost:3000/api
```

### 7. Test the Setup

```bash
# Test health endpoint
npm run health

# Or manually test
curl http://localhost:3000/api/health
```

You should see a response like:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": "connected",
    "openai": "configured",
    "elevenlabs": "configured"
  }
}
```

## 🧪 Testing the APIs

### Test Authentication

```bash
# Sign up a new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Pose Analysis

```bash
# Analyze pose (replace with actual session_exercise_id)
curl -X POST http://localhost:3000/api/pose/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "session_exercise_id": "your-session-exercise-id",
    "keypoints": [
      {
        "x": 0.5,
        "y": 0.3,
        "confidence": 0.95
      }
    ]
  }'
```

### Test Feedback Generation

```bash
# Generate feedback (replace with actual session_id)
curl -X POST http://localhost:3000/api/feedback/generate \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "feedback_type": "post_session"
  }'
```

## 🚀 Deployment

### Google Cloud Platform Deployment

1. **Set up Google Cloud Project**:
   ```bash
   # Install Google Cloud CLI if not already installed
   # https://cloud.google.com/sdk/docs/install

   # Authenticate
   gcloud auth login

   # Create a project (replace with your project ID)
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Deploy using the deployment script**:
   ```bash
   # Set environment variables
   export GOOGLE_CLOUD_PROJECT_ID=your-project-id
   export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

   # Run deployment
   npm run deploy
   ```

3. **Manual deployment**:
   ```bash
   # Build and push Docker image
   npm run docker:build
   docker tag vibe-coach-backend gcr.io/your-project-id/vibe-coach-backend
   docker push gcr.io/your-project-id/vibe-coach-backend

   # Deploy to Cloud Run
   gcloud run deploy vibe-coach-backend \
     --image gcr.io/your-project-id/vibe-coach-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Environment Variables for Production

Make sure to set these in your Google Cloud Run service:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `NODE_ENV=production`
- `ALLOWED_ORIGINS` (your frontend domains)

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check your Supabase URL and keys
   - Verify the database schema is set up correctly
   - Check if RLS policies are properly configured

2. **OpenAI API Errors**:
   - Verify your API key is correct
   - Check if you have sufficient credits
   - Ensure the API key has the right permissions

3. **ElevenLabs API Errors**:
   - Verify your API key is correct
   - Check your account limits
   - Ensure the voice ID is valid

4. **CORS Issues**:
   - Check your `ALLOWED_ORIGINS` environment variable
   - Ensure your frontend domain is included
   - Verify the CORS middleware is working

5. **Authentication Issues**:
   - Check if the user exists in Supabase
   - Verify the JWT token is valid
   - Ensure RLS policies allow the operation

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=vibe-coach:*
```

### Logs

Check application logs:
```bash
# For local development
npm run dev

# For Google Cloud Run
gcloud logs read --service=vibe-coach-backend --limit=50
```

## 📚 Next Steps

1. **Frontend Integration**: Connect your Next.js frontend to these APIs
2. **Real-time Features**: Implement WebSocket connections for live feedback
3. **Monitoring**: Set up monitoring and alerting
4. **Scaling**: Configure auto-scaling based on usage
5. **Security**: Implement rate limiting and additional security measures

## 🆘 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Test individual API endpoints
4. Check the database connection and schema
5. Review the API documentation in the README

For additional help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ElevenLabs Documentation](https://docs.elevenlabs.io)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
