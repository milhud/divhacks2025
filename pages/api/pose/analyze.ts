import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

interface PoseKeypoint {
  x: number
  y: number
  confidence: number
}

interface PoseAnalysisRequest {
  session_exercise_id: string
  keypoints: PoseKeypoint[]
  timestamp?: string
}

interface FormMetrics {
  rep_count: number
  form_score: number
  corrections: string[]
  confidence_score: number
}

// Simple form analysis based on keypoint positions
function analyzeForm(keypoints: PoseKeypoint[]): FormMetrics {
  // This is a simplified analysis - in production, you'd use more sophisticated algorithms
  const corrections: string[] = []
  let form_score = 100
  let confidence_score = 0

  // Calculate average confidence
  confidence_score = keypoints.reduce((sum, kp) => sum + kp.confidence, 0) / keypoints.length

  // Basic form checks (simplified examples)
  if (keypoints.length >= 17) { // Assuming 17 keypoints (COCO format)
    // Check if person is standing (ankles below hips)
    const left_ankle = keypoints[15] // left ankle
    const right_ankle = keypoints[16] // right ankle
    const left_hip = keypoints[11] // left hip
    const right_hip = keypoints[12] // right hip

    if (left_ankle && right_ankle && left_hip && right_hip) {
      const avg_ankle_y = (left_ankle.y + right_ankle.y) / 2
      const avg_hip_y = (left_hip.y + right_hip.y) / 2

      if (avg_ankle_y < avg_hip_y) {
        corrections.push("Keep your feet on the ground")
        form_score -= 10
      }
    }

    // Check shoulder alignment
    const left_shoulder = keypoints[5] // left shoulder
    const right_shoulder = keypoints[6] // right shoulder

    if (left_shoulder && right_shoulder) {
      const shoulder_diff = Math.abs(left_shoulder.y - right_shoulder.y)
      if (shoulder_diff > 0.1) { // threshold for shoulder alignment
        corrections.push("Keep your shoulders level")
        form_score -= 5
      }
    }

    // Check spine alignment (simplified)
    const nose = keypoints[0] // nose
    const neck = keypoints[1] // neck
    const mid_hip = keypoints[8] // mid hip

    if (nose && neck && mid_hip) {
      const spine_angle = Math.atan2(mid_hip.x - neck.x, mid_hip.y - neck.y) * 180 / Math.PI
      if (Math.abs(spine_angle) > 15) { // threshold for spine alignment
        corrections.push("Keep your spine straight")
        form_score -= 15
      }
    }
  }

  // Estimate rep count based on movement patterns (simplified)
  const rep_count = 0 // This would need more sophisticated tracking

  return {
    rep_count,
    form_score: Math.max(0, form_score),
    corrections,
    confidence_score: confidence_score * 100
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { session_exercise_id, keypoints, timestamp }: PoseAnalysisRequest = req.body

    if (!session_exercise_id || !keypoints || keypoints.length === 0) {
      return res.status(400).json({ error: 'session_exercise_id and keypoints are required' })
    }

    // Analyze the pose
    const form_metrics = analyzeForm(keypoints)

    // Calculate joint angles (simplified)
    const angles: any = {}
    if (keypoints.length >= 17) {
      // Calculate some basic angles
      const left_elbow = keypoints[7]
      const left_shoulder = keypoints[5]
      const left_wrist = keypoints[9]

      if (left_elbow && left_shoulder && left_wrist) {
        // Calculate elbow angle
        const angle = Math.atan2(
          left_wrist.y - left_elbow.y,
          left_wrist.x - left_elbow.x
        ) - Math.atan2(
          left_shoulder.y - left_elbow.y,
          left_shoulder.x - left_elbow.x
        )
        angles.left_elbow = Math.abs(angle * 180 / Math.PI)
      }
    }

    // Store pose analysis in database
    const { data: pose_analysis, error: pose_error } = await supabaseAdmin
      .from('pose_analysis')
      .insert({
        session_exercise_id,
        keypoints,
        angles,
        form_metrics,
        corrections: form_metrics.corrections,
        confidence_score: form_metrics.confidence_score,
        timestamp: timestamp || new Date().toISOString()
      })
      .select()
      .single()

    if (pose_error) {
      console.error('Error storing pose analysis:', pose_error)
      return res.status(500).json({ error: 'Failed to store pose analysis' })
    }

    // Update session exercise with form score
    const { error: update_error } = await supabaseAdmin
      .from('session_exercises')
      .update({
        form_score: form_metrics.form_score,
        rep_count: form_metrics.rep_count
      })
      .eq('id', session_exercise_id)

    if (update_error) {
      console.error('Error updating session exercise:', update_error)
    }

    return res.status(200).json({
      success: true,
      form_metrics,
      pose_analysis_id: pose_analysis.id,
      corrections: form_metrics.corrections,
      should_give_feedback: form_metrics.corrections.length > 0
    })

  } catch (error) {
    console.error('Pose analysis error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
