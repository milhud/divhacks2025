# Troubleshooting Guide

## Quick Diagnostic

1. **Run Diagnostics**: Click the "Run Diagnostics" button on the homepage
2. **Check Console**: Open browser dev tools (F12) and check for errors
3. **Check Terminal**: Look for server errors in your terminal

## Common Issues & Solutions

### 1. "Supabase not configured" Error

**Problem**: App shows demo mode even after adding credentials

**Solutions**:
- ✅ Make sure `.env.local` file exists in project root
- ✅ Check that all values are filled in (not placeholder text)
- ✅ Restart the development server after adding credentials
- ✅ Verify file is named exactly `.env.local` (not `.env` or `.env.local.txt`)

**Check**:
\`\`\`bash
# Make sure file exists
ls -la .env.local

# Check contents (don't commit this!)
cat .env.local
\`\`\`

### 2. Authentication Not Working

**Problem**: Sign in/sign up buttons don't work

**Solutions**:
- ✅ Verify Supabase URL format: `https://your-project.supabase.co`
- ✅ Check anon key is correct (starts with `eyJ`)
- ✅ Ensure service role key is correct
- ✅ Check Supabase project is active (not paused)

**Test**:
\`\`\`bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://YOUR_PROJECT.supabase.co/rest/v1/
\`\`\`

### 3. Video Upload Fails

**Problem**: Video upload shows error

**Solutions**:
- ✅ Check storage bucket exists in Supabase
- ✅ Verify bucket is named `workout-videos`
- ✅ Check file size is under 50MB
- ✅ Ensure file type is supported (MP4, MOV, AVI, WebM)

**Setup Storage**:
1. Go to Supabase Dashboard → Storage
2. Create bucket named `workout-videos`
3. Set to public if needed

### 4. Database Errors

**Problem**: API calls fail with database errors

**Solutions**:
- ✅ Run the database schema from `supabase/schema.sql`
- ✅ Check RLS policies are enabled
- ✅ Verify tables exist in Supabase dashboard

**Setup Database**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Run the SQL script

### 5. OpenAI API Errors

**Problem**: AI feedback not working

**Solutions**:
- ✅ Check OpenAI API key is valid
- ✅ Verify you have credits in your OpenAI account
- ✅ Check API key has correct permissions

**Test OpenAI**:
\`\`\`bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## Step-by-Step Debugging

### Step 1: Check Environment Variables

1. Open `.env.local` file
2. Verify all values are filled (not placeholder text)
3. Check for typos in variable names
4. Ensure no extra spaces or quotes

### Step 2: Test Supabase Connection

1. Go to Supabase Dashboard
2. Check project is active
3. Verify API keys in Settings → API
4. Test with a simple query in SQL Editor

### Step 3: Check Database Schema

1. Go to Supabase Dashboard → Table Editor
2. Verify these tables exist:
   - `profiles`
   - `workouts`
   - `workout_sessions`
   - `pose_analysis`
   - `user_progress`

### Step 4: Test API Endpoints

1. Open browser dev tools (F12)
2. Go to Network tab
3. Try uploading a video
4. Check for failed requests

### Step 5: Check Server Logs

1. Look at terminal where you ran `npm run dev`
2. Check for error messages
3. Look for database connection errors

## Environment Variable Checklist

Make sure your `.env.local` has these exact variable names:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (long string)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (long string)
OPENAI_API_KEY=sk-... (starts with sk-)
NEXTAUTH_SECRET=random-string-here
\`\`\`

## Still Having Issues?

1. **Run Diagnostics**: Use the diagnostic button on homepage
2. **Check Console**: Look for specific error messages
3. **Verify Setup**: Double-check all steps in BACKEND_SETUP.md
4. **Test Individually**: Test each service separately

## Getting Help

If you're still stuck:

1. Copy the diagnostic results from console
2. Check the specific error messages
3. Verify your Supabase project is active
4. Make sure all environment variables are correct

**Remember**: The app works in demo mode without any backend, so if it's not working at all, there might be a basic setup issue.
