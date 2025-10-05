"use client"

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Card } from '@/components/ui/card'

export default function SupabaseCheckPage() {
  const [status, setStatus] = useState({
    configured: false,
    connected: false,
    tablesExist: {
      profiles: false,
      workout_sessions: false,
      exercises: false,
    },
    error: null as string | null,
  })

  useEffect(() => {
    checkSupabase()
  }, [])

  const checkSupabase = async () => {
    const configured = isSupabaseConfigured()
    setStatus(prev => ({ ...prev, configured }))

    if (!configured) {
      setStatus(prev => ({ ...prev, error: 'Supabase not configured - check .env.local' }))
      return
    }

    try {
      // Test connection by checking if we can query
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      const { error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id')
        .limit(1)

      const { error: exercisesError } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)

      setStatus({
        configured: true,
        connected: true,
        tablesExist: {
          profiles: !profilesError || profilesError.code !== 'PGRST204',
          workout_sessions: !sessionsError || sessionsError.code !== 'PGRST204',
          exercises: !exercisesError || exercisesError.code !== 'PGRST204',
        },
        error: null,
      })
    } catch (err: any) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        error: err.message,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Configuration Check</h1>

        {/* Configuration Status */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.configured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">Configuration Status:</span>
              <span>{status.configured ? '✅ Configured' : '❌ Not Configured'}</span>
            </div>
            
            {typeof window !== 'undefined' && (
              <>
                <div className="ml-6 text-sm text-gray-600">
                  <code>NEXT_PUBLIC_SUPABASE_URL:</code> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                </div>
                <div className="ml-6 text-sm text-gray-600">
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY:</code> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                </div>
              </>
            )}
          </div>

          {!status.configured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Action Required:</strong> Add Supabase credentials to <code>.env.local</code>
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                See <code>SUPABASE_AUTH_FIX.md</code> for instructions
              </p>
            </div>
          )}
        </Card>

        {/* Connection Status */}
        {status.configured && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">Database Connection:</span>
              <span>{status.connected ? '✅ Connected' : '❌ Failed'}</span>
            </div>

            {status.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {status.error}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Tables Status */}
        {status.configured && status.connected && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.tablesExist.profiles ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <code className="text-sm">profiles</code>
                <span className="text-sm">{status.tablesExist.profiles ? '✅ Exists' : '⚠️ Missing'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.tablesExist.workout_sessions ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <code className="text-sm">workout_sessions</code>
                <span className="text-sm">{status.tablesExist.workout_sessions ? '✅ Exists' : '⚠️ Missing'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.tablesExist.exercises ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <code className="text-sm">exercises</code>
                <span className="text-sm">{status.tablesExist.exercises ? '✅ Exists' : '⚠️ Missing'}</span>
              </div>
            </div>

            {(!status.tablesExist.workout_sessions || !status.tablesExist.exercises) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Missing Tables:</strong> Run SQL migrations in Supabase Dashboard
                </p>
                <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Run <code>/supabase/schema.sql</code></li>
                  <li>Run <code>/supabase/migrations/add_workout_sessions.sql</code></li>
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          
          {status.configured && status.connected && 
           status.tablesExist.profiles && 
           status.tablesExist.workout_sessions ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 Everything looks good! Your Supabase setup is complete.
              </p>
              <p className="text-sm text-green-700 mt-2">
                Authentication and video analysis features should work correctly.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                ⚠️ Setup incomplete. Please address the issues above.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Check <code>SUPABASE_AUTH_FIX.md</code> and <code>SUPABASE_FIX.md</code> for detailed instructions.
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={checkSupabase}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Recheck Status
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
