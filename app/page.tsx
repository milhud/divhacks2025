"use client"

import { VideoUpload } from "@/components/video-upload"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const { user, signOut, isConfigured } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vibe <span className="text-blue-600">Coach</span>
              </h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/workouts" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Workouts
              </Link>
              <Link href="/progress" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Progress
              </Link>
            </nav>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                <button 
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isConfigured ? 'Sign In' : 'Demo Mode'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Configuration Banner */}
      {!isConfigured && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Add your Supabase credentials to .env.local to enable full functionality
                </p>
              </div>
              <a 
                href="#setup" 
                className="text-sm text-yellow-800 hover:text-yellow-900 underline"
              >
                Setup Guide
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
              AI-Powered Form Analysis
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Perfect Your Form with <span className="text-blue-600">Real-Time</span> Feedback
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Upload your workout video and get instant AI-powered analysis on your form, technique, and movement
              patterns. Train smarter, not harder.
            </p>
          </div>

          {/* Video Upload Component */}
          <VideoUpload />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Video Analysis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Advanced pose detection tracks your movements frame by frame
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Audio Feedback</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Real-time voice coaching guides you through proper form
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Progress Tracking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Detailed summaries show your improvement over time
              </p>
            </div>
          </div>


          {/* Setup Instructions */}
          {!isConfigured && (
            <div id="setup" className="mt-8 p-8 bg-white rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Backend Setup Instructions</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">1. Create .env.local file</h4>
                  <p className="text-gray-600 mb-3">Create a file named <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> in your project root with these variables:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key</div>
                    <div>OPENAI_API_KEY=your_openai_api_key</div>
                    <div>NEXTAUTH_SECRET=your_random_secret</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">2. Get Supabase Credentials</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Go to <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a> and create a new project</li>
                    <li>In your project dashboard, go to Settings → API</li>
                    <li>Copy your Project URL and paste it as <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                    <li>Copy your anon/public key and paste it as <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                    <li>Copy your service_role key and paste it as <code className="bg-gray-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">3. Get OpenAI API Key</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Go to <a href="https://platform.openai.com" target="_blank" className="text-blue-600 hover:underline">platform.openai.com</a></li>
                    <li>Create an account and generate an API key</li>
                    <li>Copy the key and paste it as <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY</code></li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">4. Set up Database</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>In your Supabase dashboard, go to SQL Editor</li>
                    <li>Copy and run the contents of <code className="bg-gray-100 px-1 rounded">supabase/schema.sql</code></li>
                    <li>Go to Storage and create a bucket called <code className="bg-gray-100 px-1 rounded">workout-videos</code></li>
                  </ol>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 Tip:</strong> Once you add the credentials and restart the dev server, you'll have full functionality including user authentication, real video analysis, and data persistence!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-600">
            © 2025 Vibe Coach. AI-powered fitness coaching for everyone.
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            >
              ×
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
}