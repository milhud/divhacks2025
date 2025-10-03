import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { supabaseAdmin } from '../../../lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FeedbackRequest {
  session_id: string
  exercise_id?: string
  feedback_type: 'post_session' | 'form_correction'
  session_data?: any
  form_metrics?: any
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { session_id, exercise_id, feedback_type, session_data, form_metrics }: FeedbackRequest = req.body

    if (!session_id || !feedback_type) {
      return res.status(400).json({ error: 'session_id and feedback_type are required' })
    }

    // Get session data from database
    const { data: session, error: session_error } = await supabaseAdmin
      .from('workout_sessions')
      .select(`
        *,
        session_exercises (
          *,
          exercises (
            name,
            instructions,
            target_muscles
          )
        )
      `)
      .eq('id', session_id)
      .single()

    if (session_error || !session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Get pose analysis data
    const { data: pose_analyses, error: pose_error } = await supabaseAdmin
      .from('pose_analysis')
      .select('*')
      .in('session_exercise_id', session.session_exercises.map((se: any) => se.id))

    if (pose_error) {
      console.error('Error fetching pose analyses:', pose_error)
    }

    // Generate feedback based on type
    let feedback_content = ''
    let severity: 'info' | 'warning' | 'error' = 'info'

    if (feedback_type === 'post_session') {
      // Generate comprehensive post-session feedback
      const total_duration = session.total_duration || 0
      const overall_score = session.overall_score || 0
      const exercise_count = session.session_exercises.length
      const total_reps = session.session_exercises.reduce((sum: number, se: any) => sum + (se.rep_count || 0), 0)
      const avg_form_score = session.session_exercises.reduce((sum: number, se: any) => sum + (se.form_score || 0), 0) / exercise_count

      const prompt = `You are an AI fitness coach. Generate personalized feedback for a workout session.

Session Details:
- Duration: ${Math.round(total_duration / 60)} minutes
- Overall Score: ${overall_score}/100
- Exercises Completed: ${exercise_count}
- Total Reps: ${total_reps}
- Average Form Score: ${Math.round(avg_form_score)}/100

Exercises Performed:
${session.session_exercises.map((se: any, index: number) => `
${index + 1}. ${se.exercises?.name || 'Unknown Exercise'}
   - Reps: ${se.rep_count || 0}
   - Form Score: ${se.form_score || 0}/100
   - Duration: ${se.duration_seconds ? Math.round(se.duration_seconds / 60) : 0} minutes
`).join('')}

Pose Analysis Data:
${pose_analyses?.map((pa: any) => `
- Exercise: ${pa.session_exercise_id}
- Confidence: ${pa.confidence_score}%
- Corrections: ${pa.corrections?.join(', ') || 'None'}
`).join('') || 'No pose analysis data available'}

Generate encouraging, constructive feedback that:
1. Celebrates achievements
2. Identifies areas for improvement
3. Provides specific, actionable advice
4. Motivates for future workouts
5. Addresses any form issues detected

Keep the tone positive and professional. Limit to 300 words.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an experienced fitness coach and personal trainer with expertise in form correction, motivation, and workout optimization. Provide constructive, encouraging feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })

      feedback_content = completion.choices[0].message.content || 'No feedback generated'
      severity = overall_score < 70 ? 'warning' : 'info'

    } else if (feedback_type === 'form_correction') {
      // Generate real-time form correction feedback
      const exercise = session.session_exercises.find((se: any) => se.exercise_id === exercise_id)
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found in session' })
      }

      const recent_pose_analysis = pose_analyses
        ?.filter((pa: any) => pa.session_exercise_id === exercise.id)
        ?.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

      if (!recent_pose_analysis) {
        return res.status(400).json({ error: 'No pose analysis data available for form correction' })
      }

      const corrections = recent_pose_analysis.corrections || []
      const form_score = recent_pose_analysis.form_metrics?.form_score || 0

      if (corrections.length > 0) {
        const prompt = `You are an AI fitness coach providing real-time form correction. 

Exercise: ${exercise.exercises?.name || 'Unknown Exercise'}
Current Form Score: ${form_score}/100
Detected Issues: ${corrections.join(', ')}

Generate a brief, encouraging correction message (max 50 words) that:
1. Acknowledges the issue
2. Provides a clear, simple correction
3. Encourages the user
4. Uses positive language

Examples:
- "Great effort! Try to keep your back straighter on the next rep."
- "You're doing well! Focus on keeping your knees aligned with your toes."
- "Almost perfect! Remember to engage your core throughout the movement."`

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a supportive fitness coach providing real-time form corrections. Be encouraging and concise."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })

        feedback_content = completion.choices[0].message.content || 'Keep up the great work!'
        severity = form_score < 60 ? 'error' : form_score < 80 ? 'warning' : 'info'
      } else {
        feedback_content = 'Excellent form! Keep it up!'
        severity = 'info'
      }
    }

    // Store feedback in database
    const { data: feedback, error: feedback_error } = await supabaseAdmin
      .from('feedback')
      .insert({
        session_id,
        exercise_id,
        feedback_type,
        content: feedback_content,
        severity,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (feedback_error) {
      console.error('Error storing feedback:', feedback_error)
      return res.status(500).json({ error: 'Failed to store feedback' })
    }

    return res.status(200).json({
      success: true,
      feedback: {
        id: feedback.id,
        content: feedback_content,
        severity,
        feedback_type,
        timestamp: feedback.timestamp
      }
    })

  } catch (error) {
    console.error('Feedback generation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
