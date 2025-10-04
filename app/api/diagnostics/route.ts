import { NextRequest, NextResponse } from 'next/server'
import { checkSupabaseConfig, testSupabaseConnection } from '@/lib/diagnostics'

export async function GET(request: NextRequest) {
  try {
    const configCheck = checkSupabaseConfig()
    const connectionTest = await testSupabaseConnection()

    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Missing',
      },
      configuration: configCheck,
      connection: connectionTest,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
