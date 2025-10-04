# Google Cloud Video Intelligence Setup

This document outlines the environment variables and setup required for the Google Video Intelligence integration.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
GOOGLE_CLOUD_STORAGE_BUCKET=vibe-coach-videos

# OpenAI Configuration (for feedback generation)
OPENAI_API_KEY=your-openai-api-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Google Cloud Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your Project ID

### 2. Enable Required APIs
Enable these APIs in your Google Cloud project:
- Video Intelligence API
- Cloud Storage API

### 3. Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Create a new service account
3. Grant these roles:
   - Video Intelligence API User
   - Storage Object Admin
   - Storage Admin

### 4. Generate Service Account Key
1. Click on your service account
2. Go to Keys tab
3. Add Key > Create new key > JSON
4. Download the JSON file
5. Place it in your project root or secure location
6. Update `GOOGLE_APPLICATION_CREDENTIALS` path

### 5. Create Cloud Storage Bucket
1. Go to Cloud Storage
2. Create a new bucket
3. Choose appropriate region and settings
4. Update `GOOGLE_CLOUD_STORAGE_BUCKET` with bucket name

## Features Implemented

### Video Analysis Pipeline
1. **Upload**: Video uploaded to Google Cloud Storage
2. **Analysis**: Google Video Intelligence processes video for:
   - Person detection
   - Pose landmarks
   - Movement patterns
3. **AI Feedback**: OpenAI generates personalized coaching feedback
4. **Storage**: Results stored in Supabase database
5. **Cleanup**: Temporary videos deleted after analysis

### Exercise Detection
- Automatic exercise type identification
- Rep counting based on movement patterns
- Form scoring (0-100%)
- Movement quality assessment

### AI Feedback Generation
- Comprehensive form analysis
- Personalized coaching recommendations
- Safety considerations
- Progressive training suggestions

## API Endpoints

### `/api/video/analyze-gvi`
- **Method**: POST
- **Body**: FormData with video file, userId, exerciseType
- **Response**: Analysis results with AI feedback

## Component Integration

The video upload component now includes:
- **Basic Upload**: Original functionality
- **AI Video Analysis**: New Google Video Intelligence mode
- **Live Camera**: Real-time analysis
- **Pain Assessment**: Healthcare features

## Fallback Behavior

If Google Cloud services are unavailable:
- Falls back to mock analysis data
- Still generates OpenAI feedback
- Graceful error handling
- User-friendly error messages

## Security Considerations

- Service account keys should be kept secure
- Use IAM roles with minimal required permissions
- Videos are automatically cleaned up after analysis
- Environment variables should not be committed to version control
