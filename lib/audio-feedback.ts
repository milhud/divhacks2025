/**
 * Audio Feedback System for Real-time Coaching
 * Provides text-to-speech feedback during workouts
 */

export class AudioFeedbackSystem {
  private synthesis: SpeechSynthesis | null = null
  private voice: SpeechSynthesisVoice | null = null
  private isEnabled: boolean = true
  private lastFeedbackTime: number = 0
  private feedbackCooldown: number = 3000 // 3 seconds between feedback

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
      this.initializeVoice()
    }
  }

  private initializeVoice() {
    if (!this.synthesis) return

    const setVoice = () => {
      const voices = this.synthesis!.getVoices()
      // Prefer English voices
      this.voice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => 
        voice.lang.startsWith('en')
      ) || voices[0] || null
    }

    if (this.synthesis.getVoices().length > 0) {
      setVoice()
    } else {
      this.synthesis.onvoiceschanged = setVoice
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    if (!enabled && this.synthesis) {
      this.synthesis.cancel()
    }
  }

  public speak(text: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    if (!this.synthesis || !this.voice || !this.isEnabled) return

    const now = Date.now()
    
    // Respect cooldown for low priority messages
    if (priority === 'low' && now - this.lastFeedbackTime < this.feedbackCooldown) {
      return
    }

    // Cancel current speech for high priority messages
    if (priority === 'high') {
      this.synthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = this.voice
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8

    this.synthesis.speak(utterance)
    this.lastFeedbackTime = now
  }

  public provideFeedback(
    score: number, 
    feedback: string[], 
    repCount: number,
    exerciseType: string
  ) {
    // Score-based encouragement
    if (score >= 90) {
      this.speak("Excellent form!", 'low')
    } else if (score >= 80) {
      this.speak("Great job, keep it up!", 'low')
    } else if (score >= 70) {
      this.speak("Good form, minor adjustments needed", 'medium')
    } else if (score >= 60) {
      this.speak("Focus on your form", 'medium')
    } else {
      this.speak("Check your form and slow down", 'high')
    }

    // Specific feedback for common issues
    const criticalFeedback = feedback.find(f => 
      f.includes('too small') || 
      f.includes('too large') || 
      f.includes('⚠️')
    )

    if (criticalFeedback) {
      // Extract the key issue and provide audio cue
      if (criticalFeedback.includes('Knee Angle')) {
        this.speak("Watch your knee position", 'high')
      } else if (criticalFeedback.includes('Hip Angle')) {
        this.speak("Focus on your hip hinge", 'high')
      } else if (criticalFeedback.includes('Body Line')) {
        this.speak("Keep your body straight", 'high')
      } else if (criticalFeedback.includes('Torso')) {
        this.speak("Keep your chest up", 'medium')
      }
    }

    // Rep count milestones
    if (repCount > 0 && repCount % 5 === 0) {
      this.speak(`${repCount} reps completed`, 'low')
    }
  }

  public provideExerciseInstructions(exerciseType: string) {
    const instructions = {
      squat: "Stand with feet shoulder width apart. Lower your body by bending at the hips and knees. Keep your chest up and knees tracking over your toes.",
      pushup: "Start in plank position. Lower your body until your chest nearly touches the ground. Keep your body in a straight line.",
      lunge: "Step forward into a lunge position. Lower your body until both knees are at 90 degrees. Keep your torso upright."
    }

    const instruction = instructions[exerciseType.toLowerCase() as keyof typeof instructions]
    if (instruction) {
      this.speak(instruction, 'medium')
    }
  }

  public announceStart(exerciseType: string) {
    this.speak(`Starting ${exerciseType} analysis. Get into position.`, 'high')
  }

  public announceStop() {
    this.speak("Analysis stopped. Great workout!", 'medium')
  }
}

// Singleton instance
let audioFeedbackInstance: AudioFeedbackSystem | null = null

export function getAudioFeedback(): AudioFeedbackSystem {
  if (!audioFeedbackInstance) {
    audioFeedbackInstance = new AudioFeedbackSystem()
  }
  return audioFeedbackInstance
}
