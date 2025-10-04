// Diagnostic tool to check Supabase configuration
export function checkSupabaseConfig() {
  const issues: string[] = []
  const warnings: string[] = []

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing')
  } else if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is still set to placeholder value')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is still set to placeholder value')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY is missing')
  } else if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key') {
    issues.push('SUPABASE_SERVICE_ROLE_KEY is still set to placeholder value')
  }

  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY is missing - AI feedback will use fallback')
  } else if (process.env.OPENAI_API_KEY === 'your_openai_api_key') {
    warnings.push('OPENAI_API_KEY is still set to placeholder value')
  }

  return {
    isConfigured: issues.length === 0,
    issues,
    warnings
  }
}

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      }
    }
    
    return {
      success: true,
      message: 'Supabase connection successful'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}
