import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/providers/patients/add
 * Add a new patient to a provider
 * 
 * Feature #3: Add Patient
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, patientEmail, condition, notes } = body

    console.log('[ADD PATIENT API] POST request received')
    console.log('[ADD PATIENT API] Provider ID:', providerId)
    console.log('[ADD PATIENT API] Patient Email:', patientEmail)

    // Step 1: Validate required fields
    if (!providerId) {
      console.error('[ADD PATIENT API] Missing providerId')
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    if (!patientEmail) {
      console.error('[ADD PATIENT API] Missing patientEmail')
      return NextResponse.json(
        { error: 'Patient email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(patientEmail)) {
      console.error('[ADD PATIENT API] Invalid email format')
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Step 2: Verify the provider exists
    console.log('[ADD PATIENT API] Verifying provider exists...')
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('id, profile_id')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      console.error('[ADD PATIENT API] Provider not found:', providerError)
      return NextResponse.json(
        { 
          error: 'Provider not found',
          debug: {
            providerId,
            hint: 'Make sure the provider exists in the providers table'
          }
        },
        { status: 404 }
      )
    }

    console.log('[ADD PATIENT API] Provider verified:', provider.id)

    // Step 3: Find the patient by email in profiles
    console.log('[ADD PATIENT API] Looking up patient by email...')
    const { data: patientProfile, error: patientError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('email', patientEmail.toLowerCase().trim())
      .single()

    if (patientError || !patientProfile) {
      console.error('[ADD PATIENT API] Patient not found:', patientError)
      return NextResponse.json(
        { 
          error: 'Patient not found',
          message: 'No user found with this email. The patient must sign up first.',
          debug: {
            email: patientEmail,
            hint: 'Patient needs to create an account at /signup first'
          }
        },
        { status: 404 }
      )
    }

    console.log('[ADD PATIENT API] Patient found:', patientProfile.id)

    // Step 4: Check if relationship already exists
    console.log('[ADD PATIENT API] Checking for existing relationship...')
    const { data: existingRelationship, error: checkError } = await supabaseAdmin
      .from('patient_provider_relationships')
      .select('id, status')
      .eq('patient_id', patientProfile.id)
      .eq('provider_id', providerId)
      .maybeSingle()

    if (checkError) {
      console.error('[ADD PATIENT API] Error checking relationship:', checkError)
      return NextResponse.json(
        { error: 'Database error while checking relationship' },
        { status: 500 }
      )
    }

    if (existingRelationship) {
      if (existingRelationship.status === 'active') {
        console.log('[ADD PATIENT API] Active relationship already exists')
        return NextResponse.json(
          { 
            error: 'Patient already assigned',
            message: 'This patient is already assigned to you',
            existingRelationship: {
              id: existingRelationship.id,
              status: existingRelationship.status
            }
          },
          { status: 409 } // Conflict
        )
      } else {
        // Reactivate inactive relationship
        console.log('[ADD PATIENT API] Reactivating inactive relationship...')
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('patient_provider_relationships')
          .update({ 
            status: 'active',
            notes: notes || condition || existingRelationship.status,
            start_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', existingRelationship.id)
          .select()
          .single()

        if (updateError) {
          console.error('[ADD PATIENT API] Error reactivating:', updateError)
          return NextResponse.json(
            { error: 'Failed to reactivate patient relationship' },
            { status: 500 }
          )
        }

        console.log('[ADD PATIENT API] Relationship reactivated successfully')
        return NextResponse.json({
          success: true,
          message: 'Patient relationship reactivated',
          relationship: updated,
          patient: {
            id: patientProfile.id,
            name: patientProfile.full_name || 'Unknown',
            email: patientProfile.email
          }
        })
      }
    }

    // Step 5: Create new relationship
    console.log('[ADD PATIENT API] Creating new patient-provider relationship...')
    const { data: newRelationship, error: createError } = await supabaseAdmin
      .from('patient_provider_relationships')
      .insert({
        patient_id: patientProfile.id,
        provider_id: providerId,
        status: 'active',
        notes: notes || condition || 'New patient',
        start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (createError) {
      console.error('[ADD PATIENT API] Error creating relationship:', createError)
      return NextResponse.json(
        { 
          error: 'Failed to create patient relationship',
          debug: {
            message: createError.message,
            details: createError.details
          }
        },
        { status: 500 }
      )
    }

    console.log('[ADD PATIENT API] Patient added successfully!')
    console.log('[ADD PATIENT API] Relationship ID:', newRelationship.id)

    return NextResponse.json({
      success: true,
      message: 'Patient added successfully',
      relationship: newRelationship,
      patient: {
        id: patientProfile.id,
        name: patientProfile.full_name || 'Unknown',
        email: patientProfile.email,
        role: patientProfile.role
      }
    })

  } catch (error: any) {
    console.error('[ADD PATIENT API] Unexpected error:', error)
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
