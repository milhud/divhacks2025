"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { isSupabaseConfigured } from "@/lib/supabase"

export function DemoCredentials() {
  const [isOpen, setIsOpen] = useState(false)
  const { demoLogin, user } = useAuth()
  const isConfigured = isSupabaseConfigured()

  const demoCredentials = {
    user: {
      email: "user@vibecoach.health",
      password: "user123",
      name: "Demo User"
    },
    provider: {
      email: "provider@vibecoach.health", 
      password: "provider123",
      name: "Dr. Sarah Johnson"
    }
  }

  // Don't show if user is already logged in
  if (user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 animate-pulse"
        title="Demo Credentials - Click for quick access!"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Credentials Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-[calc(100vw-3rem)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Demo Credentials</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Status Indicator */}
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            isConfigured 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium">
                {isConfigured ? 'Supabase Connected' : 'Demo Mode - Supabase Not Configured'}
              </span>
            </div>
            {!isConfigured && (
              <p className="text-xs mt-1 opacity-75">
                Using demo login. Configure Supabase for full functionality.
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            {/* User Credentials */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-blue-600">👤</span>
                <h4 className="font-semibold text-blue-900">Patient/User Account</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-blue-700 mb-1">Email</div>
                  <div className="text-blue-800 font-mono text-sm">{demoCredentials.user.email}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-700 mb-1">Password</div>
                  <div className="text-blue-800 font-mono text-sm">{demoCredentials.user.password}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-700 mb-1">Name</div>
                  <div className="text-blue-800 font-mono text-sm">{demoCredentials.user.name}</div>
                </div>
              </div>
            </div>

            {/* Provider Credentials */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600">👨‍⚕️</span>
                <h4 className="font-semibold text-green-900">Healthcare Provider</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-green-700 mb-1">Email</div>
                  <div className="text-green-800 font-mono text-sm">{demoCredentials.provider.email}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-green-700 mb-1">Password</div>
                  <div className="text-green-800 font-mono text-sm">{demoCredentials.provider.password}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-green-700 mb-1">Name</div>
                  <div className="text-green-800 font-mono text-sm">{demoCredentials.provider.name}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Quick Start:</div>
                <div>1. Choose your role (User or Provider)</div>
                <div>2. Click the login button above</div>
                <div>3. Start your AI-powered workout!</div>
                <div className="mt-2 text-xs text-yellow-700">
                  💡 Users can track exercises, Providers can monitor patients
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  await demoLogin('user')
                  setIsOpen(false)
                }}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                👤 Login as User
              </button>
              <button
                onClick={async () => {
                  await demoLogin('provider')
                  setIsOpen(false)
                }}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                👨‍⚕️ Login as Provider
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`User: ${demoCredentials.user.email}\nPassword: ${demoCredentials.user.password}\n\nProvider: ${demoCredentials.provider.email}\nPassword: ${demoCredentials.provider.password}`)
                }}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                📋 Copy All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
