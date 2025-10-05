"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any; message?: string }>
  signIn: (email: string, password: string) => Promise<{ error: any; message?: string }>
  signOut: () => Promise<{ error: any }>
  demoLogin: (type?: 'user' | 'provider') => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    
    if (configured) {
      // Get initial session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } else {
      // Demo mode - check localStorage for demo session
      const demoUser = localStorage.getItem('demo-user')
      const demoSession = localStorage.getItem('demo-session')
      
      if (demoUser && demoSession) {
        try {
          setUser(JSON.parse(demoUser))
          setSession(JSON.parse(demoSession))
        } catch (error) {
          console.error('Error parsing demo session:', error)
          localStorage.removeItem('demo-user')
          localStorage.removeItem('demo-session')
        }
      }
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return { 
        error: null,
        message: 'ℹ️ Demo mode active - Use the demo login buttons for quick access!' 
      }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    // Return success even if email confirmation is required
    if (data.user && !error) {
      return { 
        error: null, 
        message: data.user.email_confirmed_at 
          ? 'Account created successfully!' 
          : 'Please check your email and click the confirmation link to complete your registration.'
      }
    }
    
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return { 
        error: null,
        message: 'ℹ️ Demo mode active - Use the demo login buttons for quick access!' 
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error }
    }
    
    // Successful sign in
    return { error: null }
  }

  const signOut = async () => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      // For demo mode, just clear local state
      setUser(null)
      setSession(null)
      localStorage.removeItem('demo-user')
      localStorage.removeItem('demo-session')
      return { error: null }
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const demoLogin = async (type: 'user' | 'provider' = 'user') => {
    // For demo purposes, create a mock user session
    const isProvider = type === 'provider'
    
    const mockUser = {
      id: isProvider ? 'demo-provider-123' : 'demo-user-123',
      email: isProvider ? 'provider@vibecoach.health' : 'user@vibecoach.health',
      app_metadata: {},
      user_metadata: {
        full_name: isProvider ? 'Dr. Sarah Johnson' : 'Demo User',
        role: isProvider ? 'provider' : 'user'
      },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User

    const mockSession = {
      user: mockUser,
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_at: Date.now() + 3600000, // 1 hour from now
      expires_in: 3600,
      token_type: 'bearer'
    } as Session

    setUser(mockUser)
    setSession(mockSession)
    
    // Store in localStorage for persistence
    localStorage.setItem('demo-user', JSON.stringify(mockUser))
    localStorage.setItem('demo-session', JSON.stringify(mockSession))
    
    // Redirect based on role
    if (isProvider) {
      window.location.href = '/provider'
    } else {
      window.location.href = '/patient'
    }
    
    return { error: null }
  }

  const value = {
    user,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    demoLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}