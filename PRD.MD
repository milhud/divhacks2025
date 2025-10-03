# Vibe Coach – Real-Time AI Fitness & Rehab Assistant

## 1. Overview  
Vibe Coach is a **real-time AI workout assistant** that uses computer vision and LLM-powered feedback to improve exercise form and support rehab. Instead of waiting for post-session reports, users receive **live visual + auditory feedback** while performing workouts.  

The platform supports:  
- **End Users**: Live form correction, scoring, and motivational feedback.  
- **Trainers**: Ability to upload instructions/workouts and monitor clients remotely.  
- **Gyms & Clinics**: Integration as a plug-in service for **remote coaching, hybrid fitness, and rehab programs**.  

---

## 2. Goals  
- Deliver **live pose analysis** and **audio feedback** to prevent injury and maximize performance.  
- Support **rehab clinics** by validating exercises in real-time and encouraging correct movement.  
- Empower **trainers and gyms** with scalable remote coaching tools.  
- Build a **startup-ready foundation** with clear B2C and B2B monetization paths.  

---

## 3. Key Features  

### User Experience (Live Coaching)  
- **Live Video Capture**: Perform workouts via webcam or phone camera.  
- **Pose Detection**: CV model tracks skeleton keypoints in real time.  
- **Auditory Feedback**: Immediate cues (e.g., “Straighten your back,” “Knees too far forward”).  
- **Visual Overlay** (stretch): Heatmap or skeleton overlay showing correct vs. incorrect posture.  
- **Session Summary**: After workout, receive rep count, form score, and natural-language breakdown from LLM.  
- **Wearable Input (stretch)**: Stream biometrics (heart rate, motion sensors) for enhanced analysis.  

### Trainer / Clinic Interface  
- **Workout Builder**: Upload instructions, correct pose templates, and demo videos.  
- **Live Monitoring**: Watch client sessions in real-time (optional stretch goal).  
- **Progress Reports**: Track compliance, scores, and flagged issues over time.  

### Gym/Clinic Integration (Startup Potential)  
- **White-label SDK/API**: Embed live coaching into existing fitness or rehab apps.  
- **Multi-client Dashboard**: Gyms/clinics manage trainers, assign programs, and track outcomes.  
- **Rehab Support**: Provide physiotherapists with validated data on patient form adherence.  

---

## 4. Processing Pipeline  

1. **Live Video Stream** → Browser capture (WebRTC).  
2. **Pose Estimation Model** (MediaPipe / MoveNet) → Keypoints in real time (~30 fps).  
3. **Form Analysis Engine** → Detect rep counts, joint angles, and deviations from trainer’s template.  
4. **Audio Feedback Module** → Generate immediate cues (TTS: text-to-speech).  
5. **LLM Feedback Layer** → After session, synthesize personalized feedback/diagnosis.  
6. **Storage (Supabase)** → Save session metadata, scores, feedback, and trainer templates.  

---

## 5. User Flows  

### User Flow (Live Session)  
1. Log in → Select assigned workout → Start live session.  
2. Camera feed analyzed in real time.  
3. User hears corrective cues: *“Lift your chest,” “Bend deeper,”* etc.  
4. After session → summary with rep count, score, feedback.  

### Trainer Flow  
1. Upload exercise template with instructions and demo video.  
2. Assign workout to user.  
3. Review client’s session data and form reports.  

### Gym/Clinic Flow  
1. Create gym account → onboard trainers + clients.  
2. Monitor adoption and performance analytics.  
3. Integrate API into existing app/rehab program.  

---

## 6. Tech Stack  

- **Frontend**:  
  - Next.js + Tailwind CSS  
  - Live video via WebRTC  
  - Audio playback (Web Audio API or TTS service)  

- **Backend / Database**:  
  - Supabase: Auth, storage (videos/metadata), session data  
  - Real-time processing layer (Node/Flask service for CV + scoring)  

- **AI Models**:  
  - Pose Estimation: MoveNet / MediaPipe (fast, lightweight for real-time)  
  - LLM: GPT-4/5 API for feedback synthesis  
  - TTS: ElevenLabs, AWS Polly, or browser-native TTS for auditory cues  

- **Wearables**: Apple Health, Fitbit, Garmin (stretch).  

---

## 7. Business Model & Startup Strategy  

- **B2C**: Subscription for users who want a “personal AI trainer.”  
- **B2B**:  
  - Gyms/fitness apps license SDK for live AI coaching.  
  - Rehab clinics use platform for remote therapy adherence.  
- **Revenue Streams**:  
  - Subscription tiers (basic vs. pro feedback).  
  - API licensing for integration with gym software.  
  - Enterprise rehab contracts (clinics, insurers).  

**Differentiation:**  
- Real-time **audio corrections** → feels like a live coach.  
- Hybrid positioning: bridges **fitness coaching + medical rehab**.  
- Integration-friendly: modular API/SDK for gyms and apps.  

---

## 8. Success Metrics  

- **Hackathon MVP**:  
  - User performs live workout with real-time pose detection.  
  - Audio feedback triggers on at least one common mistake.  
  - After-session LLM feedback summary.  

- **Stretch Goals**:  
  - Trainer dashboard with multiple users.  
  - Gym dashboard with white-label integration.  
  - Wearable data fusion for richer insights.  

---

## 9. Hackathon Build Plan  

**Day 1–2**:  
- Set up Supabase (auth, db, video storage).  
- Build live video capture in Next.js.  
- Integrate pose estimation (client-side).  
- Build rule-based form detection + audio feedback prototype.  

**Day 2–3**:  
- Add LLM feedback post-session.  
- Build basic trainer interface.  
- Polish UI with Tailwind.  
- Demo pitch: “Live workout with AI coach correcting form.”  

**Stret**
