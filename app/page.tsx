"use client"

import { VideoUpload } from "@/components/video-upload"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/lib/auth-context"
import { Avatar } from "@/components/avatar"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Spottr</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-foreground font-semibold transition-colors hover:text-primary">
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
              <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar name={user?.user_metadata?.full_name || user?.email || "User"} size="sm" />
                <span className="text-sm text-muted-foreground hover:text-foreground hidden lg:block">Profile</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium transition-all text-foreground"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border border-primary/30 text-primary text-sm font-bold rounded-full mb-8 shadow-lg backdrop-blur-sm">
              <span className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse shadow-sm"></span>
              ✨ AI-Powered Form Analysis
            </div>
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 text-balance leading-none">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Perfect Your</span>
              <br />
              <span className="text-foreground">Form</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
              Upload your workout video and get instant 
              <span className="text-primary font-semibold">AI-powered analysis</span> on your form, technique, and movement patterns.
            </p>
          </div>

          {/* Video Upload Component */}
          <div className="mb-20">
            <VideoUpload />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group p-8 bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-border hover:border-primary/50 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                <svg
                  className="w-9 h-9 text-primary drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">🎥 Video Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced pose detection tracks your movements frame by frame for precise feedback
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-card via-card to-secondary/5 rounded-2xl border border-border hover:border-secondary/50 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                <svg
                  className="w-9 h-9 text-secondary drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">🎵 Audio Feedback</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time voice coaching guides you through proper form and technique
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl border border-border hover:border-accent/50 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/30 to-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                <svg
                  className="w-9 h-9 text-accent drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">📊 Progress Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Detailed analytics show your improvement and performance over time
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2025 Spottr. AI-powered fitness coaching for everyone.</p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">4.9★</div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative my-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-xl z-10 text-foreground hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
}
