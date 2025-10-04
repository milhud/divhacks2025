import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const deviceType = formData.get('deviceType') as string
    const userId = formData.get('userId') as string

    if (!file || !deviceType || !userId) {
      return NextResponse.json(
        { error: 'File, device type, and user ID are required' },
        { status: 400 }
      )
    }

    // Save uploaded file temporarily
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFilePath = path.join(tempDir, `wearable_data_${Date.now()}.${file.name.split('.').pop()}`)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(tempFilePath, buffer)

    try {
      // Process with Python script
      const result = await processWearableData(tempFilePath, deviceType)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Save to database
      const { error: dbError } = await supabaseAdmin
        .from('wearable_data')
        .insert({
          user_id: userId,
          device_type: deviceType,
          data: result.data,
          summary: result.summary,
          recommendations: result.recommendations,
          created_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('Database error:', dbError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        message: 'Wearable data processed successfully',
        summary: result.summary,
        recommendations: result.recommendations
      })

    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }

  } catch (error) {
    console.error('Wearable upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process wearable data' },
      { status: 500 }
    )
  }
}

async function processWearableData(filePath: string, deviceType: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'wearable_integration.py')
    const outputFile = path.join(process.cwd(), 'temp', `result_${Date.now()}.json`)
    
    const pythonProcess = spawn('python', [pythonScript, filePath, deviceType, '--output', outputFile])
    
    let stdout = ''
    let stderr = ''
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
          // Clean up output file
          fs.unlinkSync(outputFile)
          resolve(result)
        } catch (error) {
          reject(new Error('Failed to parse Python script output'))
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`))
      }
    })
  })
}
