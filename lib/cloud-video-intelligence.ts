/**
 * Google Cloud Video Intelligence API Integration
 * Handles video upload, processing, and pose analysis using Google Cloud services
 */

import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { Storage } from '@google-cloud/storage'

export interface CloudVideoAnalysis {
  poses: Array<{
    timestamp: number
    keypoints: Array<{
      x: number
      y: number
      confidence: number
      name: string
    }>
    confidence: number
  }>
  summary: {
    totalFrames: number
    avgConfidence: number
    exerciseDetected: string
    repCount: number
    formScore: number
  }
}

export class CloudVideoIntelligence {
  private videoClient: VideoIntelligenceServiceClient | null = null
  private storageClient: Storage | null = null
  private bucketName: string = 'vibe-coach-videos'

  constructor() {
    // Initialize clients only on server side
    if (typeof window === 'undefined') {
      try {
        this.videoClient = new VideoIntelligenceServiceClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        })
        
        this.storageClient = new Storage({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        })
      } catch (error) {
        console.warn('Google Cloud clients not initialized:', error)
      }
    }
  }

  /**
   * Upload video to Google Cloud Storage
   */
  async uploadVideo(videoBuffer: Buffer, fileName: string): Promise<string> {
    if (!this.storageClient) {
      throw new Error('Storage client not initialized')
    }

    const bucket = this.storageClient.bucket(this.bucketName)
    const file = bucket.file(`videos/${fileName}`)
    
    await file.save(videoBuffer, {
      metadata: {
        contentType: 'video/mp4'
      }
    })

    return `gs://${this.bucketName}/videos/${fileName}`
  }

  /**
   * Analyze video for person detection and pose estimation
   */
  async analyzeVideo(videoUri: string): Promise<CloudVideoAnalysis> {
    if (!this.videoClient) {
      throw new Error('Video Intelligence client not initialized')
    }

    const request = {
      inputUri: videoUri,
      features: ['PERSON_DETECTION'],
      videoContext: {
        personDetectionConfig: {
          includeBoundingBoxes: true,
          includePoseLandmarks: true,
          includeAttributes: false
        }
      }
    }

    const [operation] = await this.videoClient.annotateVideo(request)
    const [result] = await operation.promise()

    return this.processVideoAnalysisResult(result)
  }

  /**
   * Process the raw Video Intelligence API response
   */
  private processVideoAnalysisResult(result: any): CloudVideoAnalysis {
    const poses: CloudVideoAnalysis['poses'] = []
    let totalFrames = 0
    let totalConfidence = 0

    if (result.annotationResults?.[0]?.personDetectionAnnotations) {
      const personAnnotations = result.annotationResults[0].personDetectionAnnotations

      personAnnotations.forEach((annotation: any) => {
        annotation.tracks?.forEach((track: any) => {
          track.timestampedObjects?.forEach((obj: any) => {
            if (obj.landmarks) {
              const keypoints = obj.landmarks.map((landmark: any) => ({
                x: landmark.point?.x || 0,
                y: landmark.point?.y || 0,
                confidence: landmark.confidence || 0,
                name: this.mapLandmarkToKeypoint(landmark.name)
              }))

              const timestamp = this.parseTimestamp(obj.timeOffset)
              const confidence = obj.attributes?.[0]?.confidence || 0.5

              poses.push({
                timestamp,
                keypoints,
                confidence
              })

              totalFrames++
              totalConfidence += confidence
            }
          })
        })
      })
    }

    // Analyze poses for exercise detection and scoring
    const analysis = this.analyzePoses(poses)

    return {
      poses,
      summary: {
        totalFrames,
        avgConfidence: totalFrames > 0 ? totalConfidence / totalFrames : 0,
        exerciseDetected: analysis.exerciseType,
        repCount: analysis.repCount,
        formScore: analysis.formScore
      }
    }
  }

  /**
   * Map Google Cloud landmark names to our keypoint system
   */
  private mapLandmarkToKeypoint(landmarkName: string): string {
    const mapping: Record<string, string> = {
      'NOSE': 'nose',
      'LEFT_EYE': 'leftEye',
      'RIGHT_EYE': 'rightEye',
      'LEFT_EAR': 'leftEar',
      'RIGHT_EAR': 'rightEar',
      'LEFT_SHOULDER': 'leftShoulder',
      'RIGHT_SHOULDER': 'rightShoulder',
      'LEFT_ELBOW': 'leftElbow',
      'RIGHT_ELBOW': 'rightElbow',
      'LEFT_WRIST': 'leftWrist',
      'RIGHT_WRIST': 'rightWrist',
      'LEFT_HIP': 'leftHip',
      'RIGHT_HIP': 'rightHip',
      'LEFT_KNEE': 'leftKnee',
      'RIGHT_KNEE': 'rightKnee',
      'LEFT_ANKLE': 'leftAnkle',
      'RIGHT_ANKLE': 'rightAnkle'
    }

    return mapping[landmarkName] || landmarkName.toLowerCase()
  }

  /**
   * Parse timestamp from Google Cloud format
   */
  private parseTimestamp(timeOffset: any): number {
    if (!timeOffset) return 0
    
    const seconds = parseInt(timeOffset.seconds || '0')
    const nanos = parseInt(timeOffset.nanos || '0')
    
    return seconds * 1000 + Math.floor(nanos / 1000000)
  }

  /**
   * Analyze poses to detect exercise type, count reps, and score form
   */
  private analyzePoses(poses: CloudVideoAnalysis['poses']) {
    if (poses.length === 0) {
      return { exerciseType: 'unknown', repCount: 0, formScore: 0 }
    }

    // Simple exercise detection based on movement patterns
    const exerciseType = this.detectExerciseType(poses)
    const repCount = this.countReps(poses, exerciseType)
    const formScore = this.calculateFormScore(poses, exerciseType)

    return { exerciseType, repCount, formScore }
  }

  /**
   * Detect exercise type based on pose patterns
   */
  private detectExerciseType(poses: CloudVideoAnalysis['poses']): string {
    // Analyze movement patterns to detect exercise type
    // This is a simplified version - in production, you'd use more sophisticated ML
    
    let squatIndicators = 0
    let pushupIndicators = 0
    let lungeIndicators = 0

    poses.forEach(pose => {
      const leftHip = pose.keypoints.find(k => k.name === 'leftHip')
      const rightHip = pose.keypoints.find(k => k.name === 'rightHip')
      const leftKnee = pose.keypoints.find(k => k.name === 'leftKnee')
      const rightKnee = pose.keypoints.find(k => k.name === 'rightKnee')
      const leftShoulder = pose.keypoints.find(k => k.name === 'leftShoulder')
      const rightShoulder = pose.keypoints.find(k => k.name === 'rightShoulder')

      if (leftHip && rightHip && leftKnee && rightKnee) {
        const hipY = (leftHip.y + rightHip.y) / 2
        const kneeY = (leftKnee.y + rightKnee.y) / 2
        
        // Squat detection: hips moving up and down relative to knees
        if (Math.abs(hipY - kneeY) < 0.1) {
          squatIndicators++
        }
      }

      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2
        const hipY = (leftHip.y + rightHip.y) / 2
        
        // Push-up detection: shoulders and hips in line, moving up and down
        if (Math.abs(shoulderY - hipY) < 0.2 && shoulderY < 0.5) {
          pushupIndicators++
        }
      }

      // Lunge detection: asymmetric leg positioning
      if (leftKnee && rightKnee && Math.abs(leftKnee.y - rightKnee.y) > 0.1) {
        lungeIndicators++
      }
    })

    // Return the exercise with the most indicators
    if (squatIndicators > pushupIndicators && squatIndicators > lungeIndicators) {
      return 'squat'
    } else if (pushupIndicators > lungeIndicators) {
      return 'pushup'
    } else if (lungeIndicators > 0) {
      return 'lunge'
    }

    return 'general'
  }

  /**
   * Count repetitions based on movement patterns
   */
  private countReps(poses: CloudVideoAnalysis['poses'], exerciseType: string): number {
    if (poses.length < 10) return 0 // Need minimum frames for rep detection

    let repCount = 0
    let inBottomPosition = false

    poses.forEach(pose => {
      let isBottom = false

      if (exerciseType === 'squat') {
        const leftHip = pose.keypoints.find(k => k.name === 'leftHip')
        const leftKnee = pose.keypoints.find(k => k.name === 'leftKnee')
        
        if (leftHip && leftKnee) {
          isBottom = leftHip.y > leftKnee.y - 0.05 // Hip close to knee level
        }
      } else if (exerciseType === 'pushup') {
        const leftShoulder = pose.keypoints.find(k => k.name === 'leftShoulder')
        const leftElbow = pose.keypoints.find(k => k.name === 'leftElbow')
        
        if (leftShoulder && leftElbow) {
          isBottom = leftShoulder.y > leftElbow.y - 0.02 // Shoulder close to elbow level
        }
      }

      if (isBottom && !inBottomPosition) {
        inBottomPosition = true
      } else if (!isBottom && inBottomPosition) {
        repCount++
        inBottomPosition = false
      }
    })

    return repCount
  }

  /**
   * Calculate form score based on pose quality
   */
  private calculateFormScore(poses: CloudVideoAnalysis['poses'], exerciseType: string): number {
    if (poses.length === 0) return 0

    let totalScore = 0
    let validFrames = 0

    poses.forEach(pose => {
      const frameScore = this.scoreFrame(pose, exerciseType)
      if (frameScore > 0) {
        totalScore += frameScore
        validFrames++
      }
    })

    return validFrames > 0 ? Math.round(totalScore / validFrames) : 0
  }

  /**
   * Score individual frame based on pose quality
   */
  private scoreFrame(pose: CloudVideoAnalysis['poses'][0], exerciseType: string): number {
    let score = 100
    const keypoints = pose.keypoints

    // Check keypoint confidence
    const avgConfidence = keypoints.reduce((sum, kp) => sum + kp.confidence, 0) / keypoints.length
    if (avgConfidence < 0.5) return 0 // Skip low-confidence frames

    // Basic form checks (simplified)
    const leftShoulder = keypoints.find(k => k.name === 'leftShoulder')
    const rightShoulder = keypoints.find(k => k.name === 'rightShoulder')
    const leftHip = keypoints.find(k => k.name === 'leftHip')
    const rightHip = keypoints.find(k => k.name === 'rightHip')

    // Check symmetry
    if (leftShoulder && rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y)
      if (shoulderDiff > 0.05) score -= 10 // Penalize asymmetry
    }

    if (leftHip && rightHip) {
      const hipDiff = Math.abs(leftHip.y - rightHip.y)
      if (hipDiff > 0.05) score -= 10 // Penalize hip asymmetry
    }

    return Math.max(0, score)
  }
}

// Singleton instance
let cloudVideoInstance: CloudVideoIntelligence | null = null

export function getCloudVideoIntelligence(): CloudVideoIntelligence {
  if (!cloudVideoInstance) {
    cloudVideoInstance = new CloudVideoIntelligence()
  }
  return cloudVideoInstance
}
