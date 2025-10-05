import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/providers/patients?providerId=xxx
 * Fetch all patients for a provider
 * 
 * SIMPLE VERSION - Just returns demo data for now to test the endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    console.log('[PATIENTS API] GET request received, providerId:', providerId)

    if (!providerId) {
      console.error('[PATIENTS API] Missing providerId')
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // FOR NOW: Return demo data to test the API connection
    // We'll connect to real database once this works
    const demoPatients = [
      {
        id: 'demo-patient-1',
        name: 'John Smith',
        email: 'john.smith@demo.com',
        condition: 'Lower back pain',
        assignedExercises: [],
        lastSession: new Date().toISOString(),
        progress: 75,
        painLevel: 3,
        status: 'active',
        providerCode: `PRV${providerId.slice(0, 6)}`.toUpperCase()
      },
      {
        id: 'demo-patient-2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@demo.com',
        condition: 'Knee rehabilitation',
        assignedExercises: [],
        lastSession: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        progress: 60,
        painLevel: 2,
        status: 'active',
        providerCode: `PRV${providerId.slice(0, 6)}`.toUpperCase()
      },
      {
        id: 'demo-patient-3',
        name: 'Mike Davis',
        email: 'mike.davis@demo.com',
        condition: 'Shoulder impingement',
        assignedExercises: [],
        lastSession: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        progress: 40,
        painLevel: 5,
        status: 'active',
        providerCode: `PRV${providerId.slice(0, 6)}`.toUpperCase()
      }
    ]

    console.log('[PATIENTS API] Returning demo patients:', demoPatients.length)

    return NextResponse.json({
      success: true,
      patients: demoPatients,
      message: 'Demo data - database integration pending'
    })

  } catch (error) {
    console.error('[PATIENTS API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST and PATCH endpoints will be added later after testing GET
