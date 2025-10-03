import { NextApiRequest, NextApiResponse } from 'next'
import { ElevenLabs } from 'elevenlabs'
import { supabaseAdmin } from '../../../lib/supabase'

const elevenlabs = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

interface TTSRequest {
  text: string
  voice_id?: string
  session_id?: string
  exercise_id?: string
  feedback_id?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, voice_id = 'JBFqnCBsd6RMkjVDRZzb', session_id, exercise_id, feedback_id }: TTSRequest = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Generate audio using ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert({
      text,
      voice_id,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128'
    })

    // Convert audio to base64 for response
    const audioBuffer = Buffer.from(await audio.arrayBuffer())
    const audioBase64 = audioBuffer.toString('base64')
    const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`

    // If session_id is provided, store the audio URL in the feedback table
    if (session_id && feedback_id) {
      const { error: update_error } = await supabaseAdmin
        .from('feedback')
        .update({
          audio_url: audioDataUrl
        })
        .eq('id', feedback_id)

      if (update_error) {
        console.error('Error updating feedback with audio URL:', update_error)
      }
    }

    return res.status(200).json({
      success: true,
      audio_url: audioDataUrl,
      voice_id,
      text_length: text.length
    })

  } catch (error) {
    console.error('TTS generation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
