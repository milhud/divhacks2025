import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import path from 'path'
import os from 'os'
import { supabaseAdmin } from '@/lib/supabase'

interface PythonResult {
  exercise_type: string
  rep_count: number
  form_score: number
  confidence: number
  duration: number
  total_frames: number
  analyzed_frames: number
  avg_velocity: number
  max_velocity: number
  tempo_rating: string
  analysis_method: string
}

export async function POST(request: NextRequest) {
  let tempDir: string | null = null
  let videoPath: string | null = null

  try {
    const { videoUrl, sessionId, exerciseType } = await request.json()

    if (!videoUrl || !sessionId) {
      return NextResponse.json(
        { error: 'Video URL and session ID are required' },
        { status: 400 }
      )
    }

    // Download the video to a temporary directory so Python can read it from disk
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'rehabai-'))
    const fileExtension = guessExtension(videoUrl) || 'mp4'
    videoPath = path.join(tempDir, `session-${sessionId}.${fileExtension}`)

    const downloadResponse = await fetch(videoUrl)
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download video: ${downloadResponse.status} ${downloadResponse.statusText}`)
    }

    const videoBuffer = Buffer.from(await downloadResponse.arrayBuffer())
    const maxBytes = 150 * 1024 * 1024 // 150 MB guardrail
    if (videoBuffer.length > maxBytes) {
      throw new Error('Video too large for local analysis (limit 150MB). Please upload a shorter clip.')
    }

    await writeFile(videoPath, videoBuffer)

    const pythonResult = await runGoodGymAnalyzer(videoPath, exerciseType)

    // Enrich analysis for the frontend while keeping raw Python output available
    const analysisPayload = buildAnalysisPayload(pythonResult)

    await updateWorkoutSession(sessionId, analysisPayload)

    return NextResponse.json({
      message: 'MediaPipe rehabilitation analysis completed',
      analysis: analysisPayload,
      metadata: {
        sessionId,
        videoUrl,
        analysisMethod: pythonResult.analysis_method,
      }
    })
  } catch (error: any) {
    console.error('Python analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Video analysis failed. Try a shorter clip or re-record with better lighting.' },
      { status: 500 }
    )
  } finally {
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true })
      } catch (rmError) {
        console.error('Failed to clean temp directory:', rmError)
      }
    }
  }
}

function guessExtension(url: string): string | null {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

async function runGoodGymAnalyzer(videoPath: string, exerciseType?: string): Promise<PythonResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'good_gym_analyzer.py')
    const args = exerciseType ? [pythonScript, videoPath, exerciseType] : [pythonScript, videoPath]
    const pythonProcess = spawn('python3', args, { stdio: ['ignore', 'pipe', 'pipe'] })

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
        console.error('good_gym_analyzer stderr:', stderr)
        reject(new Error(`Pose analysis script exited with code ${code}`))
        return
      }

      try {
        const parsed: PythonResult = JSON.parse(stdout.trim())
        resolve(parsed)
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError, 'stdout:', stdout)
        reject(new Error('Could not parse pose analysis output'))
      }
    })

    pythonProcess.on('error', (procError) => {
      reject(new Error(`Failed to launch Python analyzer: ${procError.message}`))
    })
  })
}

function buildAnalysisPayload(result: PythonResult) {
  return {
    exercise_type: result.exercise_type,
    rep_count: result.rep_count,
    form_score: result.form_score,
    confidence: result.confidence,
    duration_seconds: result.duration,
    total_frames: result.total_frames,
    analyzed_frames: result.analyzed_frames,
    average_velocity: result.avg_velocity,
    max_velocity: result.max_velocity,
    tempo_rating: result.tempo_rating,
    analysis_method: result.analysis_method,
    movement_quality_score: result.form_score,
    stability_score: Math.max(60, Math.min(100, 100 - Math.abs(result.avg_velocity - 60))),
    range_of_motion: Math.min(100, Math.round(result.max_velocity / 2)),
    overall_confidence: Math.round(result.confidence) / 100,
    movement_compensations: [],
    pain_indicators: [],
  }
}

async function updateWorkoutSession(sessionId: string, analysis: ReturnType<typeof buildAnalysisPayload>) {
  try {
    await supabaseAdmin
      .from('workout_sessions')
      .update({
        pose_data: analysis,
        form_score: analysis.form_score,
        rep_count: analysis.rep_count,
        duration: Math.round((analysis.duration_seconds || 0) / 60),
        analysis_data: analysis,
      })
      .eq('id', sessionId)
  } catch (error) {
    console.error('Failed to update Supabase session with analysis:', error)
  }
}
