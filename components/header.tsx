"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Avatar } from "@/components/avatar"

interface HeaderProps {
  currentPage?: string
  onShowAuth?: () => void
}

export function Header({ currentPage, onShowAuth }: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">V</span>
          </div>
          <h1 className="text-2xl font-bold text-balance">
            Vibe <span className="text-primary">Coach</span>
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/workouts" 
            className={`text-sm transition-colors ${
              currentPage === 'workouts' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Exercises
          </Link>
          <Link 
            href="/my-workouts" 
            className={`text-sm transition-colors ${
              currentPage === 'my-workouts' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Workouts
          </Link>
          <Link 
            href="/progress" 
            className={`text-sm transition-colors ${
              currentPage === 'progress' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Progress
          </Link>
          <Link 
            href="/plans" 
            className={`text-sm transition-colors ${
              currentPage === 'plans' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Plans
          </Link>
          <Link 
            href="/pricing" 
            className={`text-sm transition-colors ${
              currentPage === 'pricing' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pricing
          </Link>
        </nav>
        
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar 
                name={user?.user_metadata?.full_name || user?.email || 'User'} 
                size="sm" 
              />
              <span className="text-sm text-muted-foreground hover:text-foreground">
                Profile
              </span>
            </Link>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/providers"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Provider Sign In
            </Link>
            <button 
              onClick={onShowAuth}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            >
              User Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
