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

    // Generate AI feedback based on pose data
    const prompt = `
You are an expert fitness coach analyzing a workout session. Based on the following pose analysis data, provide detailed feedback:

Workout Type: ${workoutType || 'General Workout'}
Form Score: ${poseData.form_score || 'N/A'}
Rep Count: ${poseData.rep_count || 'N/A'}
Overall Confidence: ${poseData.overall_confidence || 'N/A'}

Keypoints Data: ${JSON.stringify(poseData.keypoints, null, 2)}

Please provide detailed feedback using markdown formatting:

## Overall Assessment
- Brief summary of the workout performance

## Areas for Improvement
- Specific form issues to address
- Use bullet points for clarity

## Positive Aspects
- What you did well
- Strengths to maintain

## Recommendations
- Specific actionable advice
- Focus on technique improvements

## Next Steps
- Motivational encouragement
- Suggested focus areas for next workout

Use **bold** for emphasis, bullet points for lists, and keep the tone encouraging and constructive.
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
