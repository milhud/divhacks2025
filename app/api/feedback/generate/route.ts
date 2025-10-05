import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, poseData, workoutType } = await request.json()

    if (!sessionId || !poseData) {
      return NextResponse.json(
        { error: 'Session ID and pose data are required' },
        { status: 400 }
      )
    }

    const confidencePercent = poseData.confidence ?? (poseData.overall_confidence ? Math.round(Number(poseData.overall_confidence) * 100) : null)
    const averageVelocity = poseData.average_velocity ?? poseData.avg_velocity ?? null
    const maxVelocity = poseData.max_velocity ?? null
    const tempoRating = poseData.tempo_rating ?? null
    const rangeOfMotion = poseData.range_of_motion ?? null
    const stabilityScore = poseData.stability_score ?? null
    const durationSeconds = poseData.duration_seconds ?? poseData.duration ?? null
    const detectedCompensations = Array.isArray(poseData.movement_compensations) ? poseData.movement_compensations : []
    const compensationSummary = detectedCompensations
      .slice(0, 4)
      .map((item: any) => `${item.joint || 'joint'}: ${item.compensation_type || 'compensation'} (${item.severity || 'n/a'})`)
      .join('\n- ')
    const painSummary = Array.isArray(poseData.pain_indicators) && poseData.pain_indicators.length > 0
      ? poseData.pain_indicators.map((item: any) => `${item.area || 'area'} intensity ${item.intensity ?? 'n/a'} triggered by ${item.movement_trigger || 'movement'}`).join('\n- ')
      : 'None reported'

    const prompt = `
You are an expert fitness coach analyzing a recorded session. Review the metrics and deliver specific, biomechanically sound feedback.

Workout Type: ${poseData.exercise_type ? poseData.exercise_type.replace(/_/g, ' ') : (workoutType || 'General Workout')}
Form Score: ${poseData.form_score ?? poseData.movement_quality_score ?? 'N/A'}
Rep Count: ${poseData.rep_count ?? 'N/A'}
Confidence: ${confidencePercent !== null && confidencePercent !== undefined ? confidencePercent + '%' : 'N/A'}
Duration: ${durationSeconds ? `${Math.round(durationSeconds)} sec` : 'N/A'}
Tempo: ${tempoRating ?? 'N/A'}
Average Velocity: ${averageVelocity ? `${Math.round(averageVelocity)}°/s` : 'N/A'}
Max Velocity: ${maxVelocity ? `${Math.round(maxVelocity)}°/s` : 'N/A'}
Range of Motion: ${rangeOfMotion !== null && rangeOfMotion !== undefined ? `${rangeOfMotion}%` : 'N/A'}
Stability Score: ${stabilityScore ?? 'N/A'}
Movement Compensations:\n- ${compensationSummary || 'None detected'}
Pain Indicators:\n- ${painSummary}

Keypoints (for reference): ${poseData.keypoints ? JSON.stringify(poseData.keypoints).slice(0, 2000) : 'Not available'}

Create feedback in markdown with these sections:

## Overall Assessment
- Brief summary referencing the form score, tempo, and confidence.

## Areas for Improvement
- Bullet list of technique fixes tied to the detected compensations, range of motion, or velocity data.
- Mention pacing if average velocity or tempo is problematic.

## Positive Aspects
- Bullet list of strengths anchored to the metrics (e.g., consistency, depth, tempo).

## Recommendations
- 2-3 actionable drills, cues, or setup tips personalized to this exercise type.
- Include volume cue (reps/sets) when relevant.

## Next Steps
- Encouraging close-out with what to focus on in the next session.

Keep the tone supportive, cite the numbers you reference, and avoid generic advice.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert fitness coach with years of experience in form analysis and corrective exercise. Provide detailed, constructive feedback that helps users improve their workout form and technique."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiFeedback = completion.choices[0]?.message?.content || "Unable to generate feedback at this time."

    // Update the session with AI feedback
    const { error: updateError } = await supabaseAdmin
      .from('workout_sessions')
      .update({
        ai_feedback: aiFeedback,
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Failed to update session with AI feedback:', updateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: 'AI feedback generated successfully',
      feedback: aiFeedback,
    })
  } catch (error) {
    console.error('AI feedback generation error:', error)
    
    // Fallback feedback if AI fails
    const fallbackFeedback = "Great job completing your workout! Keep practicing to improve your form and technique. Consider focusing on controlled movements and proper breathing."
    
    return NextResponse.json({
      message: 'AI feedback generated with fallback',
      feedback: fallbackFeedback,
    })
  }
}
