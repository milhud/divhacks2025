# Supabase Authentication Fix

## 🔴 Problem: Demo Mode Shows Instead of Real Login

You were experiencing "demo mode" even though you have user credentials in Supabase.

### Root Cause

The `isSupabaseConfigured()` function was checking for `SUPABASE_SERVICE_ROLE_KEY` which is **NOT available in the browser** (it's not prefixed with `NEXT_PUBLIC_`).

This caused the function to always return `false` in client-side code, triggering demo mode.

---

## ✅ Solution Applied

Fixed `/lib/supabase.ts` to only check browser-accessible environment variables:

```typescript
// Before (BROKEN):
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.SUPABASE_SERVICE_ROLE_KEY  // ❌ Not available in browser!
}

// After (FIXED):
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(
    url && 
    key && 
    url !== 'https://placeholder.supabase.co' &&
    key !== 'placeholder-key'
  )
}
```

---

## 📋 Verify Your Environment Variables

Check your `.env.local` file has these variables:

```bash
# Required for authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Required for server-side operations (video upload, etc.)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Where to Find These Values:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Testing

### 1. Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Important:** Next.js only reads `.env.local` on startup!

### 2. Check Configuration Status

Open your browser and visit: http://localhost:3000

Look for the Supabase status indicator on the auth form:
- ✅ **Green dot**: "Supabase Connected" - Authentication will work!
- ⚠️ **Yellow dot**: "Demo Mode - Supabase Not Configured" - Need to add env vars

### 3. Test Sign In

Try signing in with your Supabase user:
1. Enter your email and password
2. Click "Sign In"
3. Should authenticate successfully (no "demo mode" message!)

### 4. If Still Showing Demo Mode

Check browser console (F12) for errors:

```javascript
// Open browser console and run:
console.log({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
})
```

If both show `undefined`, your environment variables aren't loading.

---

## 🔧 Troubleshooting

### Issue: Variables are undefined in browser

**Solution:** 
- Verify `.env.local` is in the root directory (next to `package.json`)
- Restart dev server after changing `.env.local`
- Make sure there are no typos in variable names
- Ensure there are no extra spaces around `=` signs

Example correct format:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
# Not this:
NEXT_PUBLIC_SUPABASE_URL = https://abc123.supabase.co  # ❌ Extra spaces
```

### Issue: Auth still not working

**Check Supabase Auth Settings:**

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Under **Authentication** → **Email Templates**, verify templates are set up
4. Check **Authentication** → **Users** to see if your user exists

### Issue: "Email not confirmed"

If you signed up but haven't confirmed your email:

1. Check your email for confirmation link
2. OR in Supabase Dashboard:
   - Go to **Authentication** → **Users**
   - Find your user
   - Click the options menu (...)
   - Select "Verify email"

---

## 🎯 Expected Behavior After Fix

### ✅ With Supabase Configured:

1. Sign Up form works - creates real users in Supabase
2. Sign In form works - authenticates with your credentials
3. Sessions persist across page refreshes
4. Sign Out works properly
5. No "demo mode" messages

### 🎭 Without Supabase (Demo Mode):

1. Shows info message: "Demo mode active - Use demo login buttons"
2. Can use Demo User / Demo Provider buttons
3. Mock sessions stored in localStorage
4. Good for testing UI without a database

---

## 📊 Supabase Tables Needed

For full functionality, ensure these tables exist in your Supabase database:

**Required for Authentication:**
- `profiles` - User profile data (created by schema.sql)
- `auth.users` - Supabase auth table (built-in)

**Required for Video Analysis:**
- `workout_sessions` - Stores analysis results (see SUPABASE_FIX.md)

**Run your schema:**
```sql
-- In Supabase Dashboard → SQL Editor:
-- Copy and paste contents of /supabase/schema.sql
-- Then run /supabase/migrations/add_workout_sessions.sql
```

---

## 🚀 Quick Start Checklist

- [ ] Add Supabase credentials to `.env.local`
- [ ] Restart dev server (`npm run dev`)
- [ ] Verify green "Supabase Connected" indicator
- [ ] Test sign in with your credentials
- [ ] Run schema migrations in Supabase Dashboard
- [ ] Test video upload feature

---

## 💡 Pro Tips

1. **Never commit `.env.local`** - It's gitignored for security
2. **Use different Supabase projects** for dev/prod environments
3. **Service role key** has admin privileges - keep it secret!
4. **anon/public key** is safe to use in browser code

---

## Need More Help?

Check these files:
- `lib/supabase.ts` - Supabase client configuration
- `lib/auth-context.tsx` - Authentication logic
- `components/auth-form.tsx` - Login/signup UI
- `SUPABASE_FIX.md` - Database table setup

Or visit: https://supabase.com/docs/guides/auth
