import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function GET() {
  try {
    const pythonScript = path.join(process.cwd(), 'python', 'fixed_mediapipe_analyzer.py')
    
    // Test if the script exists
    console.log('[TEST] Python script path:', pythonScript)
    
    // Test Python execution
    const testProcess = spawn('python3', ['-c', 'import mediapipe; print("MediaPipe OK")'])
    
    let output = ''
    let error = ''
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    testProcess.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    await new Promise((resolve) => {
      testProcess.on('close', resolve)
    })
    
    return NextResponse.json({
      status: 'MediaPipe test',
      pythonScriptPath: pythonScript,
      mediapipeTest: output.trim() || error.trim(),
      error: error.trim()
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
