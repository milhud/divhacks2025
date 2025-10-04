"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Avatar } from "@/components/avatar"

const recentSessions = [
  {
    id: 1,
    workout: "Full Body Strength",
    date: "2025-01-08",
    duration: "42 min",
    score: 92,
    feedback: "Excellent form on squats. Watch knee alignment on lunges.",
  },
  {
    id: 2,
    workout: "Upper Body Focus",
    date: "2025-01-06",
    duration: "28 min",
    score: 88,
    feedback: "Great shoulder stability. Consider deeper range on push-ups.",
  },
  {
    id: 3,
    workout: "Core & Stability",
    date: "2025-01-04",
    duration: "25 min",
    score: 95,
    feedback: "Perfect plank form. Maintain this consistency.",
  },
  {
    id: 4,
    workout: "Lower Body Power",
    date: "2025-01-02",
    duration: "38 min",
    score: 85,
    feedback: "Good depth on squats. Focus on controlled descent.",
  },
]

const stats = [
  { label: "Total Workouts", value: "24", change: "+3 this week" },
  { label: "Avg Form Score", value: "89%", change: "+5% vs last month" },
  { label: "Total Time", value: "18.5h", change: "+2.5h this month" },
  { label: "Current Streak", value: "7 days", change: "Personal best!" },
]

export default function ProgressPage() {
  const [showAuth, setShowAuth] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Spottr</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/workouts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Workouts
            </Link>
            <Link href="/progress" className="text-sm text-foreground font-medium transition-colors">
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
                <span className="text-sm text-muted-foreground hover:text-foreground">Profile</span>
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3 text-foreground">Your Progress</h2>
            <p className="text-lg text-muted-foreground">Track your improvement and celebrate your wins</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-secondary">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Form Score Chart Placeholder */}
          <div className="mb-12 p-8 bg-card rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-6">Form Score Over Time</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-muted-foreground mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Recent Sessions</h3>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{session.workout}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            session.score >= 90
                              ? "bg-secondary/10 text-secondary"
                              : session.score >= 80
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {session.score}% Form Score
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        <MarkdownRenderer content={session.feedback} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(session.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {session.duration}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Spottr. AI-powered fitness coaching for everyone.
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
