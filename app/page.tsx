"use client"

import { VideoUpload } from "@/components/video-upload"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">V</span>
            </div>
            <h1 className="text-2xl font-bold text-balance">
              Vibe <span className="text-primary">Coach</span>
            </h1>
          </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-foreground font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/workouts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Workouts
              </Link>
              <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Progress
              </Link>
              <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Plans
              </Link>
              <Link href="/wearable" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Wearable
              </Link>
            </nav>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                Profile
              </Link>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
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


        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Vibe Coach. AI-powered fitness coaching for everyone.
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative my-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg z-10 text-gray-600 text-2xl"
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