import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/providers/patients/db-version?providerId=xxx
 * Fetch all patients for a provider from REAL DATABASE
 * 
 * Feature #2: Database Integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    console.log('[PATIENTS DB API] GET request received, providerId:', providerId)

    if (!providerId) {
      console.error('[PATIENTS DB API] Missing providerId')
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // Step 1: Verify the provider exists
    console.log('[PATIENTS DB API] Checking if provider exists...')
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('id, profile_id')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      console.error('[PATIENTS DB API] Provider not found:', providerError)
      return NextResponse.json(
        { 
          error: 'Provider not found',
          debug: {
            providerId,
            errorMessage: providerError?.message,
            hint: 'Make sure the provider exists in the providers table'
          }
        },
        { status: 404 }
      )
    }

    console.log('[PATIENTS DB API] Provider found:', provider.id)

    // Step 2: Get patient-provider relationships
    console.log('[PATIENTS DB API] Fetching patient relationships...')
    const { data: relationships, error: relationshipError } = await supabaseAdmin
      .from('patient_provider_relationships')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'active')

    if (relationshipError) {
      console.error('[PATIENTS DB API] Error fetching relationships:', relationshipError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch patient relationships',
          debug: {
            errorMessage: relationshipError.message,
            errorDetails: relationshipError.details
          }
        },
        { status: 500 }
      )
    }

    console.log('[PATIENTS DB API] Found relationships:', relationships?.length || 0)

    // If no patients, return empty array
    if (!relationships || relationships.length === 0) {
      console.log('[PATIENTS DB API] No patients found for this provider')
      return NextResponse.json({
        success: true,
        patients: [],
        message: 'No patients assigned to this provider yet'
      })
    }

    // Step 3: Get patient profiles
    const patientIds = relationships.map(r => r.patient_id)
    console.log('[PATIENTS DB API] Fetching patient profiles for IDs:', patientIds)

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, created_at')
      .in('id', patientIds)

    if (profilesError) {
      console.error('[PATIENTS DB API] Error fetching profiles:', profilesError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch patient profiles',
          debug: {
            errorMessage: profilesError.message
          }
        },
        { status: 500 }
      )
    }

    console.log('[PATIENTS DB API] Found profiles:', profiles?.length || 0)

    // Step 4: Build patient data
    const patients = relationships.map(rel => {
      const profile = profiles?.find(p => p.id === rel.patient_id)
      
      return {
        id: rel.patient_id,
        name: profile?.full_name || 'Unknown Patient',
        email: profile?.email || 'No email',
        condition: rel.notes || 'No condition specified',
        assignedExercises: [], // TODO: Fetch in next feature
        lastSession: rel.created_at, // TODO: Get from sessions table
        progress: 0, // TODO: Calculate from progress_tracking
        painLevel: 0, // TODO: Get from latest session
        status: rel.status,
        providerCode: `PRV${providerId.slice(0, 6)}`.toUpperCase(),
        relationshipId: rel.id,
        startDate: rel.start_date
      }
    })

    console.log('[PATIENTS DB API] Returning patients:', patients.length)

    return NextResponse.json({
      success: true,
      patients,
      source: 'database',
      debug: {
        totalRelationships: relationships.length,
        totalProfiles: profiles?.length || 0
      }
    })

  } catch (error: any) {
    console.error('[PATIENTS DB API] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
