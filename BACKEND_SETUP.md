# Backend Setup Instructions

## Quick Setup (5 minutes)

### 1. Create Environment File

Create a file named `.env.local` in your project root with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret

# File Upload Configuration
MAX_FILE_SIZE=52428800
ALLOWED_VIDEO_TYPES=video/mp4,video/mov,video/avi,video/webm
```

### 2. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to **Settings → API**
3. Copy your **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy your **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy your **service_role key** and paste it as `SUPABASE_SERVICE_ROLE_KEY`

### 3. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and generate an API key
3. Copy the key and paste it as `OPENAI_API_KEY`

### 4. Generate NextAuth Secret

Run this command to generate a random secret:
```bash
openssl rand -base64 32
```
Copy the result and paste it as `NEXTAUTH_SECRET`

### 5. Set up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and run the contents of `supabase/schema.sql`
3. Go to **Storage** and create a bucket called `workout-videos`

### 6. Restart Development Server

```bash
npm run dev
```

## What You Get

Once configured, you'll have:

✅ **Real Authentication**: User signup/signin with Supabase
✅ **Video Upload**: Upload to Supabase Storage
✅ **Pose Analysis**: Real AI analysis (currently mocked)
✅ **AI Feedback**: OpenAI-powered personalized feedback
✅ **Data Persistence**: All data stored in Supabase
✅ **Progress Tracking**: User progress and session history

## Current Status

- **Frontend**: ✅ Working (demo mode without backend)
- **Backend**: ⚠️ Needs Supabase credentials
- **Database**: ⚠️ Needs schema setup
- **AI**: ⚠️ Needs OpenAI API key

## Troubleshooting

### Common Issues

1. **"Supabase not configured"**: Add your credentials to `.env.local`
2. **Authentication not working**: Check your Supabase keys
3. **Video upload fails**: Ensure storage bucket exists
4. **AI feedback not working**: Check your OpenAI API key

### Getting Help

- Check browser console for errors
- Check terminal for server errors
- Verify all environment variables are set
- Ensure database schema is created

## Next Steps

1. Add your credentials to `.env.local`
2. Set up the database schema
3. Restart the development server
4. Test the full functionality!

**Happy coding! 🏋️‍♀️💪**
