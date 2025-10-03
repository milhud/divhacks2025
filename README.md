# Vibe Coach - AI Fitness Assistant

A real-time AI workout assistant that uses computer vision and LLM-powered feedback to improve exercise form and support rehabilitation.

## 🚀 Features

- **Real-time Pose Detection**: Advanced pose analysis using TensorFlow.js
- **AI-Powered Feedback**: Personalized coaching with OpenAI integration
- **Video Upload & Analysis**: Upload workout videos for detailed form analysis
- **Progress Tracking**: Track your improvement over time
- **User Authentication**: Secure user accounts with Supabase
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **AI/ML**: TensorFlow.js, OpenAI GPT-4
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account
- An OpenAI API key
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd divhacks2025
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:

#### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard:
   - Go to Settings > API
   - Copy your Project URL and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your anon/public key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy your service_role key and paste it as `SUPABASE_SERVICE_ROLE_KEY`

#### OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key and paste it as `OPENAI_API_KEY`

#### NextAuth Setup
1. Generate a random secret for NextAuth:
   ```bash
   openssl rand -base64 32
   ```
2. Paste the result as `NEXTAUTH_SECRET`

### 4. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create all necessary tables and functions

### 5. Storage Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `workout-videos`
3. Set the bucket to public if you want public access to videos

### 6. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

### 7. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see your app!

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── video/         # Video upload endpoints
│   │   ├── pose/          # Pose analysis endpoints
│   │   ├── feedback/      # AI feedback endpoints
│   │   ├── workouts/      # Workout management
│   │   ├── sessions/      # Session management
│   │   └── progress/      # Progress tracking
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── auth-form.tsx     # Authentication form
│   └── video-upload.tsx  # Video upload component
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── auth-context.tsx  # Authentication context
│   └── pose-detection.ts # Pose detection utilities
├── supabase/             # Database schema
│   └── schema.sql        # Database setup
└── public/               # Static assets
```

## 🔧 API Endpoints

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

## 🎯 How It Works

1. **User Registration**: Users create accounts and sign in
2. **Video Upload**: Users upload workout videos
3. **Pose Analysis**: AI analyzes the video for pose keypoints
4. **Form Scoring**: System scores the user's form
5. **AI Feedback**: OpenAI generates personalized feedback
6. **Progress Tracking**: Results are stored and tracked over time

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🔒 Security

- All API routes are protected with proper authentication
- File uploads are validated for type and size
- Database queries use Row Level Security (RLS)
- Environment variables are used for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check the [SETUP.md](./SETUP.md) file for detailed setup instructions

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [Supabase](https://supabase.com/)
- AI powered by [OpenAI](https://openai.com/)
- Pose detection with [TensorFlow.js](https://www.tensorflow.org/js/)

---

**Happy coding! 🏋️‍♀️💪**
