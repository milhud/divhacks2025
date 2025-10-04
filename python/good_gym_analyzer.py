#!/usr/bin/env python3
"""
Good-GYM Style Analyzer - State Machine Approach
Based on proven implementation from yo-WASSUP/Good-GYM
"""

import cv2
import json
import sys
import os
import numpy as np
from collections import deque
import mediapipe as mp

print("[INIT] Good-GYM style analyzer starting...", file=sys.stderr)

# Exercise configurations - ADAPTIVE (learns from your actual ROM)
def get_adaptive_thresholds(angles):
    """Calculate thresholds from actual movement range - OPTIMAL"""
    min_angle = min(angles)
    max_angle = max(angles)
    range_val = max_angle - min_angle
    midpoint = (min_angle + max_angle) / 2
    
    # Use 40% and 60% of range (catches middle transitions)
    down_threshold = min_angle + (range_val * 0.4)  # 40% from bottom
    up_threshold = min_angle + (range_val * 0.6)    # 60% from bottom
    
    print(f"  Thresholds: down={down_threshold:.1f}°, up={up_threshold:.1f}°, midpoint={midpoint:.1f}°", file=sys.stderr)
    
    return down_threshold, up_threshold

class GoodGymCounter:
    def __init__(self):
        self.counter = 0
        self.stage = None  # "up" or "down"
        self.angle_history = deque(maxlen=5)  # Smoothing window
        self.last_count_time = 0
        self.min_rep_time = 0.5  # Minimum 0.5s between reps
    
    def smooth_angle(self, angle):
        """Median filter + average (Good-GYM approach)"""
        if angle is None: 
            return None
        
        self.angle_history.append(angle)
        
        if len(self.angle_history) < 3:
            return angle
        
        # Median to remove outliers, then average
        angles_array = np.array(list(self.angle_history))
        median_angle = np.median(angles_array)
        std_dev = np.std(angles_array)
        
        # Filter outliers (> 2 std dev from median)
        filtered = angles_array[np.abs(angles_array - median_angle) <= 2 * std_dev]
        
        return np.mean(filtered) if len(filtered) > 0 else angle
    
    def count_rep(self, angle, exercise_type, frame_number, fps, up_threshold, down_threshold):
        """State machine counting with ADAPTIVE thresholds"""
        
        smoothed = self.smooth_angle(angle)
        if smoothed is None:
            return False
        
        # Calculate actual video time based on frame number and FPS
        current_time = frame_number / fps
        
        # State machine logic with detailed logging
        if smoothed > up_threshold:
            if self.stage != "up":
                print(f"[STATE] {exercise_type}: UP position (angle: {smoothed:.1f}° > {up_threshold}°)", file=sys.stderr)
            self.stage = "up"
        elif smoothed < down_threshold:
            if self.stage == "up":
                # Check if enough time has passed
                time_since_last = current_time - self.last_count_time
                if time_since_last > self.min_rep_time:
                    self.stage = "down"
                    self.counter += 1
                    self.last_count_time = current_time
                    print(f"[REP COUNTED] {exercise_type}: Rep #{self.counter} at {current_time:.2f}s (angle: {smoothed:.1f}° < {down_threshold}°, time_gap: {time_since_last:.2f}s)", file=sys.stderr)
                    return True
                else:
                    print(f"[REP BLOCKED] {exercise_type}: Too soon! {time_since_last:.2f}s < {self.min_rep_time}s", file=sys.stderr)
            else:
                if self.stage != "down":
                    print(f"[STATE] {exercise_type}: DOWN position but no UP first (angle: {smoothed:.1f}°)", file=sys.stderr)
        
        return False

def analyze_video(video_path, exercise_type=None):
    """Analyze video using Good-GYM approach
    
    Args:
        video_path: Path to video file
        exercise_type: Optional exercise type ('squat', 'deadlift', 'push_up')
                      If provided, skips auto-detection and focuses on relevant joints
    """
    
    # Initialize MediaPipe
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5
    )
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception("Cannot open video")
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    print(f"[VIDEO] {total_frames} frames @ {fps} fps", file=sys.stderr)
    
    # Data collection
    all_angles = {'hip': [], 'knee': [], 'elbow': []}
    landmark_confidences = []
    frame_count = 0
    pose_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        if frame_count % 3 != 0:  # Process every 3rd frame (maximum detection)
            continue
        
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)
        
        if results.pose_landmarks:
            pose_count += 1
            lm = results.pose_landmarks.landmark
            
            try:
                # Calculate angles (Good-GYM uses specific keypoint indices)
                # Hip: shoulder-hip-knee
                left_hip = calculate_angle_from_lm(lm[11], lm[23], lm[25])
                right_hip = calculate_angle_from_lm(lm[12], lm[24], lm[26])
                hip_angle = (left_hip + right_hip) / 2
                all_angles['hip'].append(hip_angle)
                
                # Knee: hip-knee-ankle  
                left_knee = calculate_angle_from_lm(lm[23], lm[25], lm[27])
                right_knee = calculate_angle_from_lm(lm[24], lm[26], lm[28])
                knee_angle = (left_knee + right_knee) / 2
                all_angles['knee'].append(knee_angle)
                
                # Elbow: shoulder-elbow-wrist
                left_elbow = calculate_angle_from_lm(lm[11], lm[13], lm[15])
                right_elbow = calculate_angle_from_lm(lm[12], lm[14], lm[16])
                elbow_angle = (left_elbow + right_elbow) / 2
                all_angles['elbow'].append(elbow_angle)
                
                # We'll count reps AFTER we know the exercise type and thresholds
                # Just collect angles for now
                
                # Confidence from landmark visibility
                key_lm = [11, 12, 23, 24, 25, 26]
                landmark_confidences.append(np.mean([lm[i].visibility for i in key_lm]))
                
            except Exception as e:
                print(f"[WARN] Frame {frame_count}: {e}", file=sys.stderr)
    
    cap.release()
    pose.close()
    
    print(f"[ANALYSIS] {pose_count} poses detected", file=sys.stderr)
    
    if pose_count < 5:
        raise Exception(f"Insufficient poses: {pose_count}")
    
    # Calculate ROM for all joints
    hip_rom = max(all_angles['hip']) - min(all_angles['hip'])
    knee_rom = max(all_angles['knee']) - min(all_angles['knee'])
    elbow_rom = max(all_angles['elbow']) - min(all_angles['elbow'])
    
    print(f"\n[ROM ANALYSIS]", file=sys.stderr)
    print(f"  Hip: {hip_rom:.1f}° (min={min(all_angles['hip']):.1f}°, max={max(all_angles['hip']):.1f}°)", file=sys.stderr)
    print(f"  Knee: {knee_rom:.1f}° (min={min(all_angles['knee']):.1f}°, max={max(all_angles['knee']):.1f}°)", file=sys.stderr)
    print(f"  Elbow: {elbow_rom:.1f}° (min={min(all_angles['elbow']):.1f}°, max={max(all_angles['elbow']):.1f}°)", file=sys.stderr)
    
    # If exercise type is provided, use it directly and focus on relevant joint
    if exercise_type:
        print(f"\n[USER SELECTED EXERCISE]", file=sys.stderr)
        print(f"  Exercise: {exercise_type} (user selected)", file=sys.stderr)
        
        # Use the appropriate joint for the selected exercise
        if exercise_type == 'squat':
            angle_sequence = all_angles['knee']
            print(f"  Tracking: Knee angle only", file=sys.stderr)
        elif exercise_type == 'deadlift':
            angle_sequence = all_angles['hip']
            print(f"  Tracking: Hip angle only", file=sys.stderr)
        elif exercise_type == 'push_up':
            angle_sequence = all_angles['elbow']
            print(f"  Tracking: Elbow angle only", file=sys.stderr)
        else:
            raise Exception(f"Unknown exercise type: {exercise_type}")
    else:
        # Auto-detect exercise (original logic)
        max_rom = max(hip_rom, knee_rom, elbow_rom)
        
        print(f"\n[AUTO-DETECTION]", file=sys.stderr)
        print(f"  Dominant ROM: {max_rom:.1f}° (Hip={hip_rom:.1f}°, Knee={knee_rom:.1f}°, Elbow={elbow_rom:.1f}°)", file=sys.stderr)
        
        if max_rom < 30:
            raise Exception("No significant movement detected - all ROMs < 30°")
        
        # Classify based on dominant movement (prioritize lower body when both knee and hip move)
        if knee_rom > 90 and hip_rom > 90:
            # Lower body exercise (squat or deadlift)
            if hip_rom / (knee_rom + 1) > 1.5:
                exercise_type = 'deadlift'
                angle_sequence = all_angles['hip']
                print(f"  → deadlift (both knee and hip move, hip dominant ratio={hip_rom/(knee_rom+1):.2f})", file=sys.stderr)
            else:
                exercise_type = 'squat'
                angle_sequence = all_angles['knee']
                print(f"  → squat (both knee and hip move significantly)", file=sys.stderr)
        elif elbow_rom == max_rom and elbow_rom > 45:
            exercise_type = 'push_up'
            angle_sequence = all_angles['elbow']
            print(f"  → push_up (elbow dominant)", file=sys.stderr)
        elif hip_rom >= knee_rom and hip_rom / (knee_rom + 1) > 1.5:
            exercise_type = 'deadlift'
            angle_sequence = all_angles['hip']
            print(f"  → deadlift (hip dominant, ratio={hip_rom/(knee_rom+1):.2f})", file=sys.stderr)
        elif knee_rom > 30:
            exercise_type = 'squat'
            angle_sequence = all_angles['knee']
            print(f"  → squat (knee movement)", file=sys.stderr)
        else:
            raise Exception("Cannot classify exercise - no clear dominant movement")
    
    # Get ADAPTIVE thresholds based on YOUR actual movement
    down_threshold, up_threshold = get_adaptive_thresholds(angle_sequence)
    print(f"  Adaptive thresholds: down={down_threshold:.1f}°, up={up_threshold:.1f}°", file=sys.stderr)
    
    # NOW count reps with the adaptive thresholds
    counter = GoodGymCounter()
    
    # Initialize state based on first angle (handle videos starting mid-exercise)
    if angle_sequence[0] > up_threshold:
        counter.stage = "up"
        print(f"  Video starts in UP position (angle: {angle_sequence[0]:.1f}°)", file=sys.stderr)
    elif angle_sequence[0] < down_threshold:
        counter.stage = "down"
        print(f"  Video starts in DOWN position (angle: {angle_sequence[0]:.1f}°)", file=sys.stderr)
    
    for i, angle in enumerate(angle_sequence):
        # Calculate which frame this was (since we processed every 3rd)
        frame_num = (i + 1) * 3
        counter.count_rep(angle, exercise_type, frame_num, fps, up_threshold, down_threshold)
    
    rep_count = counter.counter
    
    # Calculate velocity (angles per second)
    velocities = []
    for i in range(1, len(angle_sequence)):
        time_diff = (1 / fps) * 5  # We process every 5th frame
        angle_diff = abs(angle_sequence[i] - angle_sequence[i-1])
        velocity = angle_diff / time_diff if time_diff > 0 else 0
        velocities.append(velocity)
    
    avg_velocity = np.mean(velocities) if velocities else 0
    max_velocity = max(velocities) if velocities else 0
    
    print(f"\n[FINAL CLASSIFICATION]", file=sys.stderr)
    print(f"  Exercise: {exercise_type}", file=sys.stderr)
    print(f"  Reps: {rep_count}", file=sys.stderr)
    print(f"  Avg velocity: {avg_velocity:.1f}°/s", file=sys.stderr)
    print(f"  Max velocity: {max_velocity:.1f}°/s", file=sys.stderr)
    
    # Real confidence from MediaPipe
    confidence = np.mean(landmark_confidences) * 100
    
    # Form score: exercise-specific biomechanics analysis
    print(f"\n[FORM ANALYSIS]", file=sys.stderr)
    form_score = calculate_form_score(exercise_type, angle_sequence)
    
    return {
        'exercise_type': exercise_type,
        'rep_count': rep_count,
        'form_score': round(form_score, 1),
        'confidence': round(confidence, 1),
        'duration': round(duration, 1),
        'total_frames': total_frames,
        'analyzed_frames': pose_count,
        'avg_velocity': round(avg_velocity, 1),
        'max_velocity': round(max_velocity, 1),
        'tempo_rating': 'explosive' if avg_velocity > 100 else 'controlled' if avg_velocity > 50 else 'slow',
        'analysis_method': 'good_gym_state_machine_advanced'
    }

def calculate_angle_from_lm(a, b, c):
    """Calculate angle from MediaPipe landmarks"""
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    
    ba = a - b
    bc = c - b
    
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    angle = np.arccos(np.clip(cosine, -1.0, 1.0))
    return np.degrees(angle)

def calculate_form_score(exercise_type, angles):
    """Advanced form scoring with exercise-specific biomechanics"""
    min_angle = min(angles)
    max_angle = max(angles)
    rom = max_angle - min_angle
    
    # Exercise-specific scoring
    if exercise_type == 'squat':
        # Ideal squat: knee should go below 90° (angle > 90° is BAD in our measurement)
        # and return to full extension (170-180°)
        score = 100
        
        # Check depth (lower angle = deeper squat)
        if min_angle > 110:  # Shallow squat
            score -= 20
            print(f"  ⚠️ Shallow depth detected (min: {min_angle:.1f}°)", file=sys.stderr)
        elif min_angle > 90:  # Quarter squat
            score -= 10
            print(f"  ⚠️ Partial depth (min: {min_angle:.1f}°)", file=sys.stderr)
        else:  # Good depth
            print(f"  ✅ Good depth (min: {min_angle:.1f}°)", file=sys.stderr)
        
        # Check lockout at top
        if max_angle < 160:  # Not fully standing
            score -= 15
            print(f"  ⚠️ Incomplete lockout (max: {max_angle:.1f}°)", file=sys.stderr)
        else:
            print(f"  ✅ Full lockout (max: {max_angle:.1f}°)", file=sys.stderr)
        
        # Check consistency (std dev of bottom positions)
        bottom_angles = [a for a in angles if a < 120]
        if len(bottom_angles) > 1:
            consistency = np.std(bottom_angles)
            if consistency > 15:  # Inconsistent depth
                score -= 10
                print(f"  ⚠️ Inconsistent depth (std: {consistency:.1f}°)", file=sys.stderr)
            else:
                print(f"  ✅ Consistent form (std: {consistency:.1f}°)", file=sys.stderr)
        
        return max(60, score)  # Minimum 60
    
    elif exercise_type == 'push_up':
        score = 100
        
        # Check if elbows bend enough (< 100° is good)
        if min_angle > 120:  # Shallow push-up
            score -= 25
            print(f"  ⚠️ Shallow push-up (min: {min_angle:.1f}°)", file=sys.stderr)
        elif min_angle > 100:
            score -= 10
            print(f"  ⚠️ Partial depth (min: {min_angle:.1f}°)", file=sys.stderr)
        else:
            print(f"  ✅ Full depth (min: {min_angle:.1f}°)", file=sys.stderr)
        
        # Check full extension
        if max_angle < 160:
            score -= 15
            print(f"  ⚠️ Incomplete extension (max: {max_angle:.1f}°)", file=sys.stderr)
        else:
            print(f"  ✅ Full extension (max: {max_angle:.1f}°)", file=sys.stderr)
        
        return max(60, score)
    
    elif exercise_type == 'deadlift':
        score = 100
        
        # Check hip hinge depth
        if min_angle > 80:  # Not enough hip flexion
            score -= 20
            print(f"  ⚠️ Insufficient hip hinge (min: {min_angle:.1f}°)", file=sys.stderr)
        else:
            print(f"  ✅ Good hip hinge (min: {min_angle:.1f}°)", file=sys.stderr)
        
        # Check full hip extension at top
        if max_angle < 150:
            score -= 15
            print(f"  ⚠️ Incomplete hip extension (max: {max_angle:.1f}°)", file=sys.stderr)
        else:
            print(f"  ✅ Full hip extension (max: {max_angle:.1f}°)", file=sys.stderr)
        
        return max(60, score)
    
    else:
        # Generic ROM-based score
        if rom > 60:
            return 95
        elif rom > 45:
            return 85
        elif rom > 30:
            return 75
        else:
            return 60

if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print(json.dumps({'error': 'Usage: python good_gym_analyzer.py <video_path> [exercise_type]'}))
        print("Exercise types: squat, deadlift, push_up", file=sys.stderr)
        sys.exit(1)
    
    try:
        video_path = sys.argv[1]
        exercise_type = sys.argv[2] if len(sys.argv) == 3 else None
        
        result = analyze_video(video_path, exercise_type)
        print(json.dumps(result))
    except Exception as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
