# Vibe Coach - Quick Start Guide

This is a simplified, clean version of the Vibe Coach AI fitness assistant with minimal dependencies to avoid package conflicts.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

**Windows:**
\`\`\`bash
install.bat
\`\`\`

**Mac/Linux:**
\`\`\`bash
chmod +x install.sh
./install.sh
\`\`\`

**Manual:**
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### 2. Environment Setup

1. Copy the environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Get your Supabase credentials:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings > API
   - Copy your Project URL and anon key

3. Get your OpenAI API key:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an API key

4. Fill in `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   NEXTAUTH_SECRET=your_random_secret
   \`\`\`

### 3. Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Copy and run the contents of `supabase/schema.sql`
3. Go to Storage and create a bucket called `workout-videos`

### 4. Run the App

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 🎯 What's Included

### ✅ Working Features
- **Clean UI**: Simple, responsive design with Tailwind CSS
- **Authentication**: User signup/signin with Supabase
- **Video Upload**: Upload workout videos with validation
- **Mock AI Analysis**: Simulated pose detection and feedback
- **Database**: Complete schema with user management
- **API Routes**: All backend endpoints ready

### 🛠️ Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS (minimal setup)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 integration
- **Auth**: Supabase Auth

### 📦 Minimal Dependencies
- `@supabase/supabase-js` - Database and auth
- `@tensorflow/tfjs` - Pose detection (ready for real implementation)
- `openai` - AI feedback generation
- `next` - React framework
- `react` & `react-dom` - UI library
- `lucide-react` - Icons
- `tailwindcss` - Styling

## 🔧 API Endpoints

All endpoints are ready and working:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/video/upload` - Upload workout video
- `POST /api/pose/analyze` - Analyze pose (mock)
- `POST /api/feedback/generate` - Generate AI feedback
- `GET /api/workouts` - Get workouts
- `GET /api/sessions` - Get user sessions
- `GET /api/progress` - Get user progress

## 🎨 UI Components

Simple, clean components without complex dependencies:

- `Button` - Custom button component
- `Card` - Card container
- `VideoUpload` - Video upload with drag & drop
- `AuthForm` - Sign in/sign up form
- `ThemeProvider` - Simple theme management

## 🚀 Next Steps

1. **Test the app**: Sign up, upload a video, see the mock analysis
2. **Add real pose detection**: Replace mock with MediaPipe/MoveNet
3. **Customize styling**: Modify Tailwind classes as needed
4. **Add features**: Real-time analysis, more workout types, etc.

## 🐛 Troubleshooting

### Common Issues

1. **Package conflicts**: Use the clean install scripts provided
2. **Environment variables**: Make sure all are set correctly
3. **Supabase setup**: Ensure database schema is created
4. **OpenAI API**: Check your API key and credits

### Getting Help

- Check browser console for errors
- Check terminal for server errors
- Verify environment variables
- Ensure all dependencies installed

## 📁 Project Structure

\`\`\`
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   ├── ui/            # UI components
│   ├── auth-form.tsx  # Authentication
│   └── video-upload.tsx # Video upload
├── lib/
│   ├── supabase.ts    # Database client
│   ├── auth-context.tsx # Auth context
│   └── pose-detection.ts # Pose detection
├── supabase/
│   └── schema.sql     # Database schema
└── public/            # Static assets
\`\`\`

## 🎉 Success!

You now have a working AI fitness assistant with:
- Clean, minimal codebase
- No package conflicts
- All backend functionality
- Ready for customization and enhancement

**Happy coding! 🏋️‍♀️💪**
