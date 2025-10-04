"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, fullName)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error.message)
      } else if (result.message) {
        setSuccess(result.message)
        if (isSignUp) {
          setEmail("")
          setPassword("")
          setFullName("")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">S</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Spottr</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p className="text-muted-foreground">
              {isSignUp ? "Start your fitness journey today" : "Sign in to continue your progress"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-accent-foreground bg-accent/10 p-4 rounded-lg border border-accent/20">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Right Side - Hero */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-primary via-secondary to-primary p-12 text-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-background rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-background rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-4xl font-bold mb-6 leading-tight">Transform Your Fitness Journey</h3>
              <p className="text-background/90 text-lg leading-relaxed">
                Join thousands of users improving their workout form with AI-powered analysis and real-time feedback.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-background/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">AI Video Analysis</h4>
                  <p className="text-background/80 text-sm">Upload your workouts and get instant form feedback</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-background/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Track Progress</h4>
                  <p className="text-background/80 text-sm">Monitor your improvement over time</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-background/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Personalized Feedback</h4>
                  <p className="text-background/80 text-sm">Get AI-powered coaching tailored to you</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-background/20">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <p className="text-background/80 text-sm">Active Users</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <p className="text-background/80 text-sm">Workouts Analyzed</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.9★</div>
                  <p className="text-background/80 text-sm">User Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
