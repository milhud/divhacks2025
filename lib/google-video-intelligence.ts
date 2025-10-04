import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { Storage } from '@google-cloud/storage'

// Initialize Google Cloud clients
const videoClient = new VideoIntelligenceServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vibe-coach-videos'

export interface VideoAnalysisResult {
  personDetections: PersonDetection[]
  exerciseType: string
  repCount: number
  formScore: number
  keyMovements: Movement[]
  confidence: number
  duration: number
}

export interface PersonDetection {
  timestamp: number
  boundingBox: BoundingBox
  landmarks: Landmark[]
  confidence: number
}

export interface BoundingBox {
  left: number
  top: number
  right: number
  bottom: number
}

export interface Landmark {
  type: string
  x: number
  y: number
  confidence: number
}

export interface Movement {
  timestamp: number
  joint: string
  angle: number
  velocity: number
  quality: 'good' | 'fair' | 'poor'
}

export class GoogleVideoIntelligenceService {
  /**
   * Upload video to Google Cloud Storage
   */
  async uploadVideoToGCS(videoBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(fileName)
      
      await file.save(videoBuffer, {
        metadata: {
          contentType: 'video/mp4',
        },
      })

      // Skip making file public due to uniform bucket-level access
      // The file will still be accessible for Video Intelligence API
      
      return `gs://${bucketName}/${fileName}`
    } catch (error) {
      console.error('Error uploading to GCS:', error)
      throw new Error('Failed to upload video to Google Cloud Storage')
    }
  }

  /**
   * Analyze video using Google Video Intelligence API
   */
  async analyzeVideo(gcsUri: string): Promise<VideoAnalysisResult> {
    try {
      const request = {
        inputUri: gcsUri,
        features: [
          'PERSON_DETECTION',
          'OBJECT_TRACKING',
        ] as any,
        personDetectionConfig: {
          includeBoundingBoxes: true,
          includePoseLandmarks: true,
          includeAttributes: false,
        },
      }

      console.log('Starting video analysis...')
      const [operation] = await videoClient.annotateVideo(request)
      console.log('Waiting for operation to complete...')
      const [operationResult] = await operation.promise()

      if (!operationResult.annotationResults || operationResult.annotationResults.length === 0) {
        throw new Error('No analysis results returned')
      }

      const result = operationResult.annotationResults[0]
      
      // Process person detection results
      const personDetections = this.processPersonDetections(result.personDetectionAnnotations || [])
      
      // Analyze exercise patterns
      const exerciseAnalysis = this.analyzeExercisePatterns(personDetections)
      
      return {
        personDetections,
        exerciseType: exerciseAnalysis.exerciseType,
        repCount: exerciseAnalysis.repCount,
        formScore: exerciseAnalysis.formScore,
        keyMovements: exerciseAnalysis.movements,
        confidence: exerciseAnalysis.confidence,
        duration: this.calculateVideoDuration(personDetections),
      }
    } catch (error) {
      console.error('Error analyzing video:', error)
      throw new Error('Failed to analyze video with Google Video Intelligence')
    }
  }

  /**
   * Process person detection annotations from Google Video Intelligence
   */
  private processPersonDetections(annotations: any[]): PersonDetection[] {
    const detections: PersonDetection[] = []

    for (const annotation of annotations) {
      if (!annotation.tracks) continue

      for (const track of annotation.tracks) {
        if (!track.timestampedObjects) continue

        for (const timestampedObject of track.timestampedObjects) {
          const timeOffset = timestampedObject.timeOffset
          const timestamp = timeOffset ? 
            (timeOffset.seconds || 0) + (timeOffset.nanos || 0) / 1e9 : 0

          const boundingBox = timestampedObject.normalizedBoundingBox
          const landmarks = this.extractPoseLandmarks(timestampedObject.landmarks || [])

          detections.push({
            timestamp,
            boundingBox: {
              left: boundingBox?.left || 0,
              top: boundingBox?.top || 0,
              right: boundingBox?.right || 1,
              bottom: boundingBox?.bottom || 1,
            },
            landmarks,
            confidence: track.confidence || 0.5,
          })
        }
      }
    }

    return detections.sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Extract pose landmarks from detection data
   */
  private extractPoseLandmarks(landmarkData: any[]): Landmark[] {
    const landmarks: Landmark[] = []
    
    for (const landmark of landmarkData) {
      landmarks.push({
        type: landmark.type || 'unknown',
        x: landmark.point?.x || 0,
        y: landmark.point?.y || 0,
        confidence: landmark.confidence || 0.5,
      })
    }

    return landmarks
  }

  /**
   * Analyze exercise patterns from person detections
   */
  private analyzeExercisePatterns(detections: PersonDetection[]): {
    exerciseType: string
    repCount: number
    formScore: number
    movements: Movement[]
    confidence: number
  } {
    if (detections.length === 0) {
      return {
        exerciseType: 'unknown',
        repCount: 0,
        formScore: 0,
        movements: [],
        confidence: 0,
      }
    }

    // Analyze movement patterns
    const movements = this.extractMovements(detections)
    const exerciseType = this.identifyExerciseType(movements)
    const repCount = this.countRepetitions(movements, exerciseType)
    const formScore = this.calculateFormScore(movements, exerciseType)
    const confidence = this.calculateOverallConfidence(detections)

    return {
      exerciseType,
      repCount,
      formScore,
      movements,
      confidence,
    }
  }

  /**
   * Extract movement data from detections
   */
  private extractMovements(detections: PersonDetection[]): Movement[] {
    const movements: Movement[] = []

    for (let i = 1; i < detections.length; i++) {
      const current = detections[i]
      const previous = detections[i - 1]

      // Calculate joint angles and movements
      const shoulderLandmark = current.landmarks.find(l => l.type.includes('shoulder'))
      const elbowLandmark = current.landmarks.find(l => l.type.includes('elbow'))
      const hipLandmark = current.landmarks.find(l => l.type.includes('hip'))
      const kneeLandmark = current.landmarks.find(l => l.type.includes('knee'))

      if (shoulderLandmark && elbowLandmark) {
        const angle = this.calculateAngle(shoulderLandmark, elbowLandmark)
        const velocity = this.calculateVelocity(previous.timestamp, current.timestamp, angle)
        
        movements.push({
          timestamp: current.timestamp,
          joint: 'elbow',
          angle,
          velocity,
          quality: this.assessMovementQuality(angle, velocity),
        })
      }

      if (hipLandmark && kneeLandmark) {
        const angle = this.calculateAngle(hipLandmark, kneeLandmark)
        const velocity = this.calculateVelocity(previous.timestamp, current.timestamp, angle)
        
        movements.push({
          timestamp: current.timestamp,
          joint: 'knee',
          angle,
          velocity,
          quality: this.assessMovementQuality(angle, velocity),
        })
      }
    }

    return movements
  }

  /**
   * Identify exercise type based on movement patterns
   */
  private identifyExerciseType(movements: Movement[]): string {
    const kneeMovements = movements.filter(m => m.joint === 'knee')
    const elbowMovements = movements.filter(m => m.joint === 'elbow')

    // Simple heuristics for exercise identification
    if (kneeMovements.length > elbowMovements.length * 2) {
      const avgKneeAngle = kneeMovements.reduce((sum, m) => sum + m.angle, 0) / kneeMovements.length
      if (avgKneeAngle < 90) {
        return 'squat'
      } else {
        return 'lunge'
      }
    } else if (elbowMovements.length > 0) {
      return 'push-up'
    }

    return 'general_exercise'
  }

  /**
   * Count repetitions based on movement patterns
   */
  private countRepetitions(movements: Movement[], exerciseType: string): number {
    if (movements.length === 0) return 0

    const relevantMovements = exerciseType === 'push-up' 
      ? movements.filter(m => m.joint === 'elbow')
      : movements.filter(m => m.joint === 'knee')

    if (relevantMovements.length === 0) return 0

    // Count peaks and valleys in angle changes
    let reps = 0
    let isGoingDown = false
    let lastAngle = relevantMovements[0].angle

    for (const movement of relevantMovements) {
      const angleDiff = movement.angle - lastAngle
      
      if (angleDiff < -10 && !isGoingDown) {
        isGoingDown = true
      } else if (angleDiff > 10 && isGoingDown) {
        reps++
        isGoingDown = false
      }
      
      lastAngle = movement.angle
    }

    return Math.max(1, reps) // At least 1 rep if there's movement
  }

  /**
   * Calculate form score based on movement quality
   */
  private calculateFormScore(movements: Movement[], exerciseType: string): number {
    if (movements.length === 0) return 0

    const qualityScores = movements.map(m => {
      switch (m.quality) {
        case 'good': return 100
        case 'fair': return 70
        case 'poor': return 40
        default: return 50
      }
    })

    const avgScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    return Math.round(avgScore)
  }

  /**
   * Calculate overall confidence of the analysis
   */
  private calculateOverallConfidence(detections: PersonDetection[]): number {
    if (detections.length === 0) return 0

    const avgConfidence = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
    return Math.round(avgConfidence * 100)
  }

  /**
   * Calculate video duration from detections
   */
  private calculateVideoDuration(detections: PersonDetection[]): number {
    if (detections.length === 0) return 0
    
    const lastDetection = detections[detections.length - 1]
    const firstDetection = detections[0]
    
    return lastDetection.timestamp - firstDetection.timestamp
  }

  /**
   * Calculate angle between two landmarks
   */
  private calculateAngle(landmark1: Landmark, landmark2: Landmark): number {
    const dx = landmark2.x - landmark1.x
    const dy = landmark2.y - landmark1.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  /**
   * Calculate velocity between movements
   */
  private calculateVelocity(prevTime: number, currTime: number, angle: number): number {
    const timeDiff = currTime - prevTime
    return timeDiff > 0 ? Math.abs(angle) / timeDiff : 0
  }

  /**
   * Assess movement quality based on angle and velocity
   */
  private assessMovementQuality(angle: number, velocity: number): 'good' | 'fair' | 'poor' {
    // Simple quality assessment based on angle range and velocity
    if (Math.abs(angle) > 45 && velocity < 100) {
      return 'good'
    } else if (Math.abs(angle) > 20 && velocity < 200) {
      return 'fair'
    } else {
      return 'poor'
    }
  }

  /**
   * Clean up uploaded video from GCS (optional)
   */
  async deleteVideoFromGCS(fileName: string): Promise<void> {
    try {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(fileName)
      await file.delete()
    } catch (error) {
      console.error('Error deleting video from GCS:', error)
      // Don't throw error, just log it
    }
  }
}

// Export singleton instance
export const googleVideoIntelligence = new GoogleVideoIntelligenceService()
