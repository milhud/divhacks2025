import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      patientId, 
      assessmentType, 
      painLevel, 
      affectedAreas, 
      movementLimitations, 
      currentMedications,
      previousInjuries,
      sessionData 
    } = await request.json()

    if (!patientId || !assessmentType) {
      return NextResponse.json(
        { error: 'Patient ID and assessment type are required' },
        { status: 400 }
      )
    }

    // Generate AI-powered assessment and recommendations
    const assessmentPrompt = `
You are a licensed physical therapist conducting a comprehensive movement assessment. Based on the patient's information, provide a detailed analysis and treatment recommendations.

Patient Information:
- Pain Level: ${painLevel}/10
- Affected Areas: ${affectedAreas?.join(', ') || 'Not specified'}
- Movement Limitations: ${movementLimitations || 'Not specified'}
- Current Medications: ${currentMedications || 'None'}
- Previous Injuries: ${previousInjuries || 'None'}
- Assessment Type: ${assessmentType}

Session Data: ${JSON.stringify(sessionData, null, 2)}

Please provide a comprehensive assessment in the following format:

## Movement Assessment Summary
- **Overall Movement Quality**: [Score 1-10 with explanation]
- **Pain Assessment**: [Detailed pain analysis and triggers]
- **Compensation Patterns**: [Identified movement compensations]
- **Range of Motion**: [ROM assessment for affected joints]

## Risk Factors
- **High Risk Indicators**: [List any concerning patterns]
- **Movement Restrictions**: [Areas requiring immediate attention]
- **Pain Triggers**: [Specific movements causing pain]

## Treatment Recommendations
- **Immediate Interventions**: [Urgent care recommendations]
- **Exercise Modifications**: [How to modify exercises]
- **Pain Management**: [Non-pharmacological pain relief strategies]
- **Progression Plan**: [How to gradually increase activity]

## Home Exercise Program
- **Phase 1 Exercises** (Week 1-2): [Gentle, pain-free movements]
- **Phase 2 Exercises** (Week 3-4): [Progressive strengthening]
- **Phase 3 Exercises** (Week 5-8): [Advanced rehabilitation]

## Monitoring & Follow-up
- **Key Metrics to Track**: [What to monitor]
- **Red Flags**: [Warning signs to watch for]
- **Follow-up Schedule**: [Recommended check-in frequency]

## Provider Notes
- **Clinical Observations**: [Professional insights]
- **Treatment Modifications**: [Adjustments to standard protocol]
- **Patient Education**: [Important information for the patient]

Use **bold** for emphasis and bullet points for easy reading. Focus on evidence-based rehabilitation principles.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a licensed physical therapist with 15+ years of experience in musculoskeletal rehabilitation. Provide evidence-based, clinically sound assessments and treatment recommendations. Always prioritize patient safety and pain management."
        },
        {
          role: "user",
          content: assessmentPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent clinical recommendations
    })

    const assessment = completion.choices[0]?.message?.content || "Assessment completed. Please review the patient's movement patterns and pain levels to develop an appropriate treatment plan."

    // Store assessment in database
    const { data: assessmentRecord, error: assessmentError } = await supabaseAdmin
      .from('rehab_assessments')
      .insert({
        patient_id: patientId,
        assessment_type: assessmentType,
        pain_level: painLevel,
        affected_areas: affectedAreas,
        movement_limitations: movementLimitations,
        current_medications: currentMedications,
        previous_injuries: previousInjuries,
        session_data: sessionData,
        ai_assessment: assessment,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Failed to store assessment:', assessmentError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: 'Assessment completed successfully',
      assessment: assessment,
      assessmentId: assessmentRecord?.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json(
      { error: 'Assessment failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const assessmentType = searchParams.get('assessmentType')

    let query = supabaseAdmin
      .from('rehab_assessments')
      .select('*')
      .order('created_at', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType)
    }

    const { data: assessments, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      assessments: assessments || [],
      count: assessments?.length || 0
    })

  } catch (error) {
    console.error('Fetch assessments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
