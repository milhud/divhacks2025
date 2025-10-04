import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinicId')
    const timeRange = searchParams.get('timeRange') || '30' // days

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeRange))

    // Get clinic overview data
    const [
      { data: patients, error: patientsError },
      { data: therapists, error: therapistsError },
      { data: sessions, error: sessionsError },
      { data: assessments, error: assessmentsError }
    ] = await Promise.all([
      // Active patients
      supabaseAdmin
        .from('patients')
        .select('id, name, email, created_at, status')
        .eq('clinic_id', clinicId)
        .eq('status', 'active'),
      
      // Therapists
      supabaseAdmin
        .from('therapists')
        .select('id, name, email, specialization, patient_count')
        .eq('clinic_id', clinicId),
      
      // Recent sessions
      supabaseAdmin
        .from('workout_sessions')
        .select(`
          id, 
          created_at, 
          form_score, 
          pain_level, 
          compensation_detected,
          patients!inner(name, therapist_id)
        `)
        .eq('patients.clinic_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50),
      
      // Recent assessments
      supabaseAdmin
        .from('rehab_assessments')
        .select(`
          id,
          assessment_type,
          pain_level,
          created_at,
          patients!inner(name, therapist_id)
        `)
        .eq('patients.clinic_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    if (patientsError || therapistsError || sessionsError || assessmentsError) {
      console.error('Database errors:', { patientsError, therapistsError, sessionsError, assessmentsError })
    }

    // Calculate analytics
    const totalPatients = patients?.length || 0
    const totalTherapists = therapists?.length || 0
    const totalSessions = sessions?.length || 0
    const totalAssessments = assessments?.length || 0

    // Calculate average pain level
    const avgPainLevel = sessions?.length > 0 
      ? sessions.reduce((sum, session) => sum + (session.pain_level || 0), 0) / sessions.length 
      : 0

    // Calculate average form score
    const avgFormScore = sessions?.length > 0
      ? sessions.reduce((sum, session) => sum + (session.form_score || 0), 0) / sessions.length
      : 0

    // Calculate compensation rate
    const compensationRate = sessions?.length > 0
      ? (sessions.filter(s => s.compensation_detected).length / sessions.length) * 100
      : 0

    // Patient progress trends (last 7 days)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const daySessions = sessions?.filter(s => {
        const sessionDate = new Date(s.created_at)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      }) || []

      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        sessions: daySessions.length,
        avgPain: daySessions.length > 0 
          ? daySessions.reduce((sum, s) => sum + (s.pain_level || 0), 0) / daySessions.length 
          : 0,
        avgFormScore: daySessions.length > 0
          ? daySessions.reduce((sum, s) => sum + (s.form_score || 0), 0) / daySessions.length
          : 0
      })
    }

    // Recent high-pain patients (need attention)
    const highPainPatients = sessions
      ?.filter(s => s.pain_level >= 7)
      .map(s => ({
        patientName: s.patients?.name,
        painLevel: s.pain_level,
        sessionDate: s.created_at,
        compensationDetected: s.compensation_detected
      }))
      .slice(0, 10) || []

    // Therapist performance
    const therapistPerformance = therapists?.map(therapist => {
      const therapistSessions = sessions?.filter(s => s.patients?.therapist_id === therapist.id) || []
      const avgPain = therapistSessions.length > 0
        ? therapistSessions.reduce((sum, s) => sum + (s.pain_level || 0), 0) / therapistSessions.length
        : 0
      const avgFormScore = therapistSessions.length > 0
        ? therapistSessions.reduce((sum, s) => sum + (s.form_score || 0), 0) / therapistSessions.length
        : 0

      return {
        ...therapist,
        sessionCount: therapistSessions.length,
        avgPainLevel: Math.round(avgPain * 10) / 10,
        avgFormScore: Math.round(avgFormScore * 10) / 10
      }
    }) || []

    return NextResponse.json({
      overview: {
        totalPatients,
        totalTherapists,
        totalSessions,
        totalAssessments,
        avgPainLevel: Math.round(avgPainLevel * 10) / 10,
        avgFormScore: Math.round(avgFormScore * 10) / 10,
        compensationRate: Math.round(compensationRate * 10) / 10
      },
      trends: {
        last7Days
      },
      alerts: {
        highPainPatients
      },
      therapistPerformance,
      recentSessions: sessions?.slice(0, 10) || [],
      recentAssessments: assessments?.slice(0, 10) || []
    })

  } catch (error) {
    console.error('Clinic dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinic data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      clinicId, 
      action, 
      data 
    } = await request.json()

    if (!clinicId || !action) {
      return NextResponse.json(
        { error: 'Clinic ID and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'create_therapist':
        const { data: newTherapist, error: therapistError } = await supabaseAdmin
          .from('therapists')
          .insert({
            clinic_id: clinicId,
            name: data.name,
            email: data.email,
            specialization: data.specialization,
            license_number: data.licenseNumber
          })
          .select()
          .single()

        if (therapistError) {
          return NextResponse.json(
            { error: 'Failed to create therapist' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Therapist created successfully',
          therapist: newTherapist
        })

      case 'assign_patient':
        const { data: assignment, error: assignmentError } = await supabaseAdmin
          .from('patient_assignments')
          .insert({
            patient_id: data.patientId,
            therapist_id: data.therapistId,
            assigned_at: new Date().toISOString()
          })
          .select()
          .single()

        if (assignmentError) {
          return NextResponse.json(
            { error: 'Failed to assign patient' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Patient assigned successfully',
          assignment: assignment
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Clinic action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform clinic action' },
      { status: 500 }
    )
  }
}
