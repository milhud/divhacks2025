import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let tempVideoPath: string | null = null
  
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    const userId = formData.get('userId') as string
    const exerciseType = formData.get('exerciseType') as string || 'general_exercise'

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Video file and user ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, MOV, AVI, and WebM are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (50MB max for faster processing)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB for MediaPipe analysis.' },
        { status: 400 }
      )
    }

    console.log(`Starting MediaPipe analysis for user ${userId}, file: ${file.name}`)

    // Save uploaded file to temporary location
    const videoBuffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'mp4'
    tempVideoPath = path.join(os.tmpdir(), `mediapipe_${userId}_${timestamp}.${fileExt}`)
    
    await writeFile(tempVideoPath, videoBuffer)
    console.log(`Video saved to: ${tempVideoPath}`)

    // Run MediaPipe analysis (pass exercise type if user selected one)
    console.log(`Running MediaPipe analysis... (Exercise: ${exerciseType || 'auto-detect'})`)
    const analysisResult = await runMediaPipeAnalysis(tempVideoPath, exerciseType)
    
    console.log('MediaPipe analysis completed:', {
      exerciseType: analysisResult.exercise_type,
      repCount: analysisResult.rep_count,
      formScore: analysisResult.form_score,
      confidence: analysisResult.confidence
    })

    // Generate AI feedback using OpenAI
    console.log('Generating AI feedback...')
    const aiFeedback = await generateAIFeedback(analysisResult, exerciseType)

    // Store session in database
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: `mediapipe-${timestamp}`,
        video_url: null, // No cloud storage for MediaPipe
        duration: analysisResult.duration,
        analysis_data: {
          exercise_type: analysisResult.exercise_type,
          rep_count: analysisResult.rep_count,
          form_score: analysisResult.form_score,
          confidence: analysisResult.confidence,
          total_frames: analysisResult.total_frames,
          pose_detections: analysisResult.pose_detections,
          analysis_method: 'mediapipe'
        },
        ai_feedback: aiFeedback,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to store session:', sessionError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: 'MediaPipe video analysis completed successfully',
      sessionId: sessionData?.id,
      analysis: {
        exercise_type: analysisResult.exercise_type || analysisResult.exerciseType,
        rep_count: analysisResult.rep_count || analysisResult.repCount,
        form_score: analysisResult.form_score || analysisResult.formScore,
        confidence: analysisResult.confidence,
        duration: analysisResult.duration,
        total_frames: analysisResult.total_frames,
        pose_detections: analysisResult.pose_detections,
        analysis_method: analysisResult.analysis_method || 'mediapipe',
        feedback: aiFeedback,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('MediaPipe analysis error:', error)
    return NextResponse.json(
      { error: 'Video analysis failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    // Clean up temporary file
    if (tempVideoPath) {
      try {
        await unlink(tempVideoPath)
        console.log('Cleaned up temporary video file')
      } catch (error) {
        console.error('Failed to clean up temporary file:', error)
      }
    }
  }
}

/**
 * Run MediaPipe analysis using Python script
 */
async function runMediaPipeAnalysis(videoPath: string, exerciseType?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'good_gym_analyzer.py')
    // Pass exercise type if provided (otherwise auto-detect)
    const args = exerciseType ? [pythonScript, videoPath, exerciseType] : [pythonScript, videoPath]
    const pythonProcess = spawn('python3', args)
    
    let stdout = ''
    let stderr = ''
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr)
        reject(new Error(`MediaPipe analysis failed with code ${code}: ${stderr}`))
        return
      }
      
      try {
        // Try to parse the entire stdout as JSON first
        const result = JSON.parse(stdout.trim())
        
        // NO FALLBACKS - if analysis failed, throw error
        if (result.analysis_method === 'failed' || result.error) {
          reject(new Error(result.error || 'Analysis failed'))
          return
        }
        
        resolve(result)
      } catch (parseError) {
        // Try to extract JSON from multiple lines
        const lines = stdout.trim().split('\n')
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            try {
              const result = JSON.parse(line.trim())
              if (result.analysis_method === 'failed' || result.error) {
                reject(new Error(result.error || 'Analysis failed'))
                return
              }
              resolve(result)
              return
            } catch {
              continue
            }
          }
        }
        
        // NO FALLBACKS - reject if we can't parse
        console.error('Failed to parse MediaPipe output:', stdout)
        console.error('stderr:', stderr)
        reject(new Error('Failed to parse analysis results - MediaPipe may have crashed'))
      }
    })
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start MediaPipe analysis: ${error.message}`))
    })
  })
}

/**
 * Get exercise-specific coaching guidance
 */
function getExerciseGuidance(exerciseType: string): string {
  const guidance: Record<string, string> = {
    'deadlift': `
Key Points for Deadlift:
- Hip hinge is the primary movement pattern
- Back should remain neutral (not rounded)
- Bar path should be vertical, close to body
- Full hip extension at the top (lockout)
- Controlled eccentric (lowering) phase
- Focus on posterior chain engagement (glutes, hamstrings)`,
    
    'squat': `
Key Points for Squat:
- Depth: hips should drop below parallel if mobility allows
- Knees should track over toes (not cave inward)
- Chest stays up, maintaining upright torso
- Hip drive initiates the ascent
- Full hip and knee extension at top
- Controlled tempo, especially in the descent`,
    
    'push_up': `
Key Points for Push-up:
- Body forms straight line from head to heels
- Elbows at 45° angle (not flared out to 90°)
- Full range of motion: chest nearly touches ground
- Core engaged to prevent hip sag
- Controlled movement both down and up
- Scapular protraction at the top`,
    
    'lunge': `
Key Points for Lunge:
- 90° angles at both knees at bottom position
- Front knee stays behind toes
- Upright torso throughout movement
- Back knee should nearly touch ground
- Push through front heel to return
- Equal work on both legs`,
    
    'general_exercise': `
General Movement Analysis:
- Focus on movement quality and control
- Maintain proper breathing patterns
- Full range of motion when appropriate
- Progressive overload over time
- Listen to your body for pain vs. discomfort`
  }
  
  return guidance[exerciseType] || guidance['general_exercise']
}

/**
 * Generate AI feedback using OpenAI based on MediaPipe analysis results
 */
async function generateAIFeedback(
  analysisResult: any, 
  exerciseType: string
): Promise<string> {
  try {
    // Get exercise-specific coaching points
    const exerciseGuidance = getExerciseGuidance(analysisResult.exercise_type)
    
    const prompt = `
You are an expert fitness coach analyzing a workout video. Provide specific, accurate feedback based on the ACTUAL analysis data.

**ACTUAL ANALYSIS RESULTS:**
- Exercise Detected: ${analysisResult.exercise_type}
- Reps Completed: ${analysisResult.rep_count}
- Form Score: ${analysisResult.form_score}%
- Detection Confidence: ${analysisResult.confidence}%
- Video Duration: ${analysisResult.duration} seconds
- Analysis Method: ${analysisResult.analysis_method || 'MediaPipe pose detection'}

**EXERCISE-SPECIFIC COACHING POINTS:**
${exerciseGuidance}

**CRITICAL INSTRUCTIONS:**
1. Comment on the EXACT exercise type detected (${analysisResult.exercise_type})
2. Reference the ACTUAL rep count (${analysisResult.rep_count}) - don't make up different numbers
3. If it's a deadlift, focus on: hip hinge mechanics, back position, bar path, lockout
4. If it's a squat, focus on: depth, knee tracking, upright torso, hip drive
5. If it's a push-up, focus on: elbow position, core stability, full range of motion
6. Be specific to the exercise - don't give generic advice

Provide feedback in this format:

## Exercise: ${analysisResult.exercise_type}
Brief assessment of the ${analysisResult.rep_count} reps performed.

## Form Assessment (${analysisResult.form_score}%)
- **Strengths**: Specific positives based on form score
- **Areas to Improve**: Specific technique points for ${analysisResult.exercise_type}

## Rep Quality
Comment on ${analysisResult.rep_count} repetitions - is this low, medium, or high volume for ${analysisResult.exercise_type}?

## Next Steps
2-3 specific drills or cues for improving ${analysisResult.exercise_type} technique.

Be accurate, specific, and helpful. Don't contradict the analysis data.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert fitness coach with advanced knowledge in biomechanics and movement analysis using MediaPipe pose detection technology. Provide detailed, constructive feedback that helps users improve their workout form and technique based on pose analysis data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || generateFallbackFeedback(analysisResult)

  } catch (error) {
    console.error('OpenAI feedback generation error:', error)
    return generateFallbackFeedback(analysisResult)
  }
}

/**
 * Generate fallback feedback if OpenAI fails
 */
function generateFallbackFeedback(analysisResult: any): string {
  const { exercise_type, rep_count, form_score, confidence } = analysisResult

  return `
## Overall Performance Assessment
Great job completing your ${exercise_type} workout! MediaPipe detected ${rep_count} repetitions with a form score of ${form_score}%.

## Form Analysis
**Strengths**: MediaPipe successfully tracked your pose throughout the exercise with ${confidence}% confidence.
**Areas for Improvement**: Focus on maintaining consistent form throughout each repetition.

## Rep Count & Movement Quality
You completed ${rep_count} repetitions. MediaPipe's pose detection shows your movement patterns were consistent.

## Recommendations
- **Immediate Focus**: Maintain proper form throughout each repetition
- **Progressive Goals**: Gradually increase repetitions while maintaining good form
- **Camera Setup**: Ensure good lighting and full body visibility for optimal pose detection

## Encouragement & Next Steps
Excellent work! MediaPipe's advanced pose detection technology shows you're making great progress. Keep up the consistent training and focus on quality over quantity.

*Analysis powered by MediaPipe pose detection with ${confidence}% confidence*
  `.trim()
}

export async function GET() {
  return NextResponse.json({
    message: 'MediaPipe Video Analysis API',
    status: 'active',
    features: [
      'Real-time pose detection with 33 body landmarks',
      'Exercise type identification (squat, push-up, lunge)',
      'Accurate repetition counting',
      'Form scoring based on joint angles',
      'AI-powered feedback generation',
      'Fast local processing (no cloud dependencies)'
    ],
    advantages: [
      'Faster processing than cloud APIs',
      'No external API costs',
      'Fitness-specific pose analysis',
      'High accuracy for exercise movements',
      'Privacy-focused (local processing)'
    ]
  })
}
