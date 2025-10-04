/**
 * Exercise Templates with Standard Pose Data
 * Contains ideal pose keypoints and scoring criteria for different exercises
 */

export interface PoseKeypoint {
  x: number
  y: number
  score: number
}

export interface Pose {
  keypoints: PoseKeypoint[]
  score: number
}

export interface ExerciseTemplate {
  name: string
  description: string
  idealPoses: {
    startPosition: Pose
    midPosition?: Pose
    endPosition: Pose
  }
  keyAngles: {
    name: string
    joints: [string, string, string] // [point1, vertex, point2]
    idealRange: [number, number] // [min, max] degrees
    weight: number // importance weight for scoring
  }[]
  commonErrors: {
    name: string
    description: string
    detection: string
    penalty: number
  }[]
  scoringCriteria: {
    angleAccuracy: number // weight for angle accuracy
    symmetry: number // weight for left-right symmetry
    stability: number // weight for pose stability
    range: number // weight for range of motion
  }
}

// PoseNet keypoint indices
export const POSE_KEYPOINTS = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16
}

// Exercise Templates
export const EXERCISE_TEMPLATES: Record<string, ExerciseTemplate> = {
  squat: {
    name: "Squat",
    description: "Basic bodyweight squat with proper form",
    idealPoses: {
      startPosition: {
        keypoints: [], // Will be populated with ideal standing position
        score: 0.9
      },
      endPosition: {
        keypoints: [], // Will be populated with ideal squat bottom position
        score: 0.9
      }
    },
    keyAngles: [
      {
        name: "Hip Angle",
        joints: ["leftShoulder", "leftHip", "leftKnee"],
        idealRange: [80, 120],
        weight: 0.3
      },
      {
        name: "Knee Angle", 
        joints: ["leftHip", "leftKnee", "leftAnkle"],
        idealRange: [70, 110],
        weight: 0.3
      },
      {
        name: "Ankle Angle",
        joints: ["leftKnee", "leftAnkle", "leftAnkle"], // Approximate ankle angle
        idealRange: [70, 110],
        weight: 0.2
      },
      {
        name: "Torso Angle",
        joints: ["leftShoulder", "leftHip", "leftHip"], // Torso lean
        idealRange: [160, 180],
        weight: 0.2
      }
    ],
    commonErrors: [
      {
        name: "Knee Valgus",
        description: "Knees caving inward",
        detection: "knee_tracking",
        penalty: 15
      },
      {
        name: "Forward Lean",
        description: "Excessive forward torso lean",
        detection: "torso_angle",
        penalty: 10
      },
      {
        name: "Heel Lift",
        description: "Heels coming off the ground",
        detection: "ankle_stability",
        penalty: 12
      }
    ],
    scoringCriteria: {
      angleAccuracy: 0.4,
      symmetry: 0.3,
      stability: 0.2,
      range: 0.1
    }
  },

  pushup: {
    name: "Push-up",
    description: "Standard push-up with proper form",
    idealPoses: {
      startPosition: {
        keypoints: [],
        score: 0.9
      },
      endPosition: {
        keypoints: [],
        score: 0.9
      }
    },
    keyAngles: [
      {
        name: "Elbow Angle",
        joints: ["leftShoulder", "leftElbow", "leftWrist"],
        idealRange: [70, 110],
        weight: 0.3
      },
      {
        name: "Body Line",
        joints: ["leftShoulder", "leftHip", "leftAnkle"],
        idealRange: [170, 180],
        weight: 0.4
      },
      {
        name: "Shoulder Angle",
        joints: ["leftElbow", "leftShoulder", "leftHip"],
        idealRange: [160, 180],
        weight: 0.3
      }
    ],
    commonErrors: [
      {
        name: "Sagging Hips",
        description: "Hips dropping below body line",
        detection: "body_line",
        penalty: 20
      },
      {
        name: "Pike Position",
        description: "Hips too high",
        detection: "body_line",
        penalty: 15
      },
      {
        name: "Partial Range",
        description: "Not going low enough",
        detection: "elbow_angle",
        penalty: 10
      }
    ],
    scoringCriteria: {
      angleAccuracy: 0.4,
      symmetry: 0.2,
      stability: 0.3,
      range: 0.1
    }
  },

  lunge: {
    name: "Lunge",
    description: "Forward lunge with proper form",
    idealPoses: {
      startPosition: {
        keypoints: [],
        score: 0.9
      },
      endPosition: {
        keypoints: [],
        score: 0.9
      }
    },
    keyAngles: [
      {
        name: "Front Knee Angle",
        joints: ["leftHip", "leftKnee", "leftAnkle"],
        idealRange: [80, 110],
        weight: 0.3
      },
      {
        name: "Back Knee Angle",
        joints: ["rightHip", "rightKnee", "rightAnkle"],
        idealRange: [80, 110],
        weight: 0.3
      },
      {
        name: "Torso Upright",
        joints: ["leftShoulder", "leftHip", "leftKnee"],
        idealRange: [160, 180],
        weight: 0.4
      }
    ],
    commonErrors: [
      {
        name: "Knee Over Toe",
        description: "Front knee extending past toes",
        detection: "knee_position",
        penalty: 15
      },
      {
        name: "Torso Lean",
        description: "Excessive forward lean",
        detection: "torso_angle",
        penalty: 10
      },
      {
        name: "Narrow Stance",
        description: "Feet too close together",
        detection: "stance_width",
        penalty: 8
      }
    ],
    scoringCriteria: {
      angleAccuracy: 0.4,
      symmetry: 0.2,
      stability: 0.3,
      range: 0.1
    }
  }
}

// Utility functions for pose analysis
export function calculateAngle(p1: PoseKeypoint, vertex: PoseKeypoint, p2: PoseKeypoint): number {
  const radians = Math.atan2(p2.y - vertex.y, p2.x - vertex.x) - 
                  Math.atan2(p1.y - vertex.y, p1.x - vertex.x)
  let angle = Math.abs(radians * 180 / Math.PI)
  if (angle > 180) angle = 360 - angle
  return angle
}

export function calculateDistance(p1: PoseKeypoint, p2: PoseKeypoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export function getPoseKeypoint(pose: Pose, keypointName: string): PoseKeypoint | null {
  const index = POSE_KEYPOINTS[keypointName as keyof typeof POSE_KEYPOINTS]
  if (index !== undefined && pose.keypoints[index]) {
    return pose.keypoints[index]
  }
  return null
}

export function scorePoseAgainstTemplate(
  currentPose: Pose, 
  template: ExerciseTemplate,
  phase: 'start' | 'mid' | 'end' = 'end'
): {
  totalScore: number
  angleScores: { name: string; score: number; actual: number; ideal: [number, number] }[]
  errors: string[]
  feedback: string[]
} {
  const angleScores: { name: string; score: number; actual: number; ideal: [number, number] }[] = []
  const errors: string[] = []
  const feedback: string[] = []
  
  let totalScore = 100
  
  // Calculate angle scores
  for (const angleTemplate of template.keyAngles) {
    const [p1Name, vertexName, p2Name] = angleTemplate.joints
    const p1 = getPoseKeypoint(currentPose, p1Name)
    const vertex = getPoseKeypoint(currentPose, vertexName)
    const p2 = getPoseKeypoint(currentPose, p2Name)
    
    if (p1 && vertex && p2 && p1.score > 0.5 && vertex.score > 0.5 && p2.score > 0.5) {
      const actualAngle = calculateAngle(p1, vertex, p2)
      const [minIdeal, maxIdeal] = angleTemplate.idealRange
      
      let angleScore = 100
      if (actualAngle < minIdeal) {
        angleScore = Math.max(0, 100 - (minIdeal - actualAngle) * 2)
        feedback.push(`${angleTemplate.name} too small (${actualAngle.toFixed(1)}°)`)
      } else if (actualAngle > maxIdeal) {
        angleScore = Math.max(0, 100 - (actualAngle - maxIdeal) * 2)
        feedback.push(`${angleTemplate.name} too large (${actualAngle.toFixed(1)}°)`)
      } else {
        feedback.push(`Good ${angleTemplate.name} (${actualAngle.toFixed(1)}°)`)
      }
      
      angleScores.push({
        name: angleTemplate.name,
        score: angleScore,
        actual: actualAngle,
        ideal: angleTemplate.idealRange
      })
      
      // Weight the angle score impact on total
      const weightedImpact = (100 - angleScore) * angleTemplate.weight
      totalScore -= weightedImpact
    }
  }
  
  // Check for common errors
  for (const error of template.commonErrors) {
    // Simplified error detection - in a real implementation, 
    // you'd have more sophisticated detection logic
    const errorDetected = Math.random() < 0.1 // 10% chance for demo
    if (errorDetected) {
      errors.push(error.name)
      totalScore -= error.penalty
      feedback.push(`⚠️ ${error.description}`)
    }
  }
  
  return {
    totalScore: Math.max(0, Math.min(100, totalScore)),
    angleScores,
    errors,
    feedback
  }
}
