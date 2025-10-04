import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { frameData, exerciseType } = await request.json()

    if (!frameData) {
      return NextResponse.json(
        { error: 'Frame data is required' },
        { status: 400 }
      )
    }

    // Create temporary file for frame data
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFile = path.join(tempDir, `ai_frame_${Date.now()}.json`)
    const frameDataObj = {
      frameData,
      exerciseType: exerciseType || 'general'
    }

    fs.writeFileSync(tempFile, JSON.stringify(frameDataObj))

    // Call AI analysis Python script
    const pythonScript = path.join(process.cwd(), 'python', 'ai_form_analyzer.py')
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [pythonScript, tempFile], {
        cwd: process.cwd()
      })

      let result = ''
      let error = ''

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })

      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile)
        } catch (e) {
          console.warn('Failed to delete temp file:', e)
        }

        if (code !== 0) {
          console.error('AI analysis script error:', error)
          resolve(NextResponse.json(
            { error: 'AI analysis failed', details: error },
            { status: 500 }
          ))
          return
        }

        try {
          const analysisResult = JSON.parse(result)
          resolve(NextResponse.json({
            success: true,
            analysis: analysisResult,
            timestamp: new Date().toISOString()
          }))
        } catch (parseError) {
          console.error('Failed to parse AI analysis output:', parseError)
          resolve(NextResponse.json(
            { error: 'Failed to parse AI analysis results' },
            { status: 500 }
          ))
        }
      })

      // Timeout after 15 seconds (AI analysis takes longer)
      setTimeout(() => {
        pythonProcess.kill()
        resolve(NextResponse.json(
          { error: 'AI analysis timeout' },
          { status: 408 }
        ))
      }, 15000)
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
