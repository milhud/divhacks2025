#!/usr/bin/env python3
"""
Accurate Video Analyzer - Balance of Speed and Accuracy
Uses proven LiveMovementAnalyzer from live_analysis.py
"""

import cv2
import json
import sys
import os
import numpy as np

# Import the working analyzer
sys.path.insert(0, os.path.dirname(__file__))
from live_analysis import LiveMovementAnalyzer

def analyze_video_accurate(video_path: str) -> dict:
    """Accurate video analysis with real pose detection."""
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Cannot open video: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if total_frames > 0 else 10
        
        print(f"Analyzing video: {total_frames} frames at {fps} FPS", file=sys.stderr)
        
        # Initialize analyzer
        analyzer = LiveMovementAnalyzer()
        
        # Track metrics
        frame_count = 0
        analyzed_count = 0
        form_scores = []
        confidence_scores = []
        exercise_types = []
        all_angles = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Process every 10th frame (better accuracy for rep counting)
            if frame_count % 10 != 0:
                continue
            
            # Analyze frame with real pose detection
            analysis = analyzer.analyze_frame(frame, 'general')
            
            if analysis and analysis.get('pose_detected'):
                analyzed_count += 1
                
                # Collect scores
                if analysis.get('form_score', 0) > 0:
                    form_scores.append(analysis['form_score'])
                
                if analysis.get('confidence', 0) > 60:
                    confidence_scores.append(analysis['confidence'])
                
                # Track exercise detection
                if analysis.get('exercise_detected'):
                    exercise_types.append(analysis.get('exercise_type', 'general'))
                
                # Track angles for rep counting
                if 'angles' in analysis and analysis['angles']:
                    all_angles.append(analysis['angles'])
                    print(f"Frame {analyzed_count}: angles = {list(analysis['angles'].keys())}", file=sys.stderr)
        
        cap.release()
        
        print(f"Processed {analyzed_count} frames with pose detection", file=sys.stderr)
        
        # Calculate results
        if analyzed_count > 0:
            avg_form_score = np.mean(form_scores) if form_scores else 70
            avg_confidence = np.mean(confidence_scores) if confidence_scores else 65
            
            # Detect exercise type from movement patterns (more accurate)
            exercise_type = detect_exercise_type(all_angles)
            
            # If detection found something specific from live analysis, use that
            if exercise_types and exercise_type == 'general_exercise':
                exercise_type = max(set(exercise_types), key=exercise_types.count)
            
            # Count actual reps from angle cycles
            rep_count = estimate_reps_from_angles(all_angles)
            
            return {
                'exercise_type': exercise_type,
                'rep_count': rep_count,
                'form_score': round(avg_form_score, 1),
                'confidence': round(avg_confidence, 1),
                'duration': round(duration, 1),
                'total_frames': frame_count,
                'analyzed_frames': analyzed_count,
                'pose_detection_rate': round((analyzed_count / max(1, frame_count // 10)) * 100, 1),
                'analysis_method': 'accurate_mediapipe'
            }
        else:
            # No poses detected - use motion fallback
            return analyze_motion_fallback(video_path, duration)
            
    except Exception as e:
        print(f"Error in accurate analysis: {e}", file=sys.stderr)
        # Fallback to motion detection
        try:
            return analyze_motion_fallback(video_path, 15)
        except:
            return {
                'exercise_type': 'general_exercise',
                'rep_count': 8,
                'form_score': 70.0,
                'confidence': 60.0,
                'duration': 15.0,
                'error': str(e),
                'analysis_method': 'fallback'
            }

def detect_exercise_type(angle_history):
    """Detect exercise type from angle patterns."""
    if not angle_history or len(angle_history) < 3:
        return 'general_exercise'
    
    # Analyze movement patterns
    hip_movement = []
    knee_movement = []
    elbow_movement = []
    shoulder_movement = []
    
    for angles in angle_history:
        # Track hip angles (for squats, deadlifts, lunges)
        if 'left_hip' in angles or 'right_hip' in angles:
            avg_hip = (angles.get('left_hip', 0) + angles.get('right_hip', 0)) / 2
            if avg_hip > 0:
                hip_movement.append(avg_hip)
        
        # Track knee angles
        if 'left_knee' in angles or 'right_knee' in angles:
            avg_knee = (angles.get('left_knee', 0) + angles.get('right_knee', 0)) / 2
            if avg_knee > 0:
                knee_movement.append(avg_knee)
        
        # Track elbow angles
        if 'left_elbow' in angles or 'right_elbow' in angles:
            avg_elbow = (angles.get('left_elbow', 0) + angles.get('right_elbow', 0)) / 2
            if avg_elbow > 0:
                elbow_movement.append(avg_elbow)
    
    # Calculate movement ranges
    hip_range = max(hip_movement) - min(hip_movement) if len(hip_movement) > 3 else 0
    knee_range = max(knee_movement) - min(knee_movement) if len(knee_movement) > 3 else 0
    elbow_range = max(elbow_movement) - min(elbow_movement) if len(elbow_movement) > 3 else 0
    
    print(f"Movement analysis - Hip: {hip_range:.1f}°, Knee: {knee_range:.1f}°, Elbow: {elbow_range:.1f}°", file=sys.stderr)
    
    # Detect exercise based on dominant movement pattern
    # Deadlift: Large hip movement, moderate knee, minimal elbow
    if hip_range > 30 and knee_range < 40 and elbow_range < 20:
        return 'deadlift'
    # Squat: Large hip and knee movement
    elif hip_range > 25 and knee_range > 30:
        return 'squat'
    # Push-up: Large elbow movement, minimal knee
    elif elbow_range > 40 and knee_range < 20:
        return 'push_up'
    # Lunge: Moderate knee and hip
    elif knee_range > 25 and hip_range > 20:
        return 'lunge'
    else:
        return 'general_exercise'

def estimate_reps_from_angles(angle_history):
    """Accurately count reps using improved peak/valley detection."""
    if not angle_history or len(angle_history) < 3:
        return 0
    
    # Detect exercise type to know which angles to track
    exercise_type = detect_exercise_type(angle_history)
    
    print(f"Detected exercise: {exercise_type}", file=sys.stderr)
    
    # Choose the right angle to track based on exercise
    angle_sequence = []
    
    if exercise_type in ['deadlift', 'squat', 'lunge']:
        # Track hip angles for these exercises
        for angles in angle_history:
            if 'left_hip' in angles and 'right_hip' in angles:
                avg_angle = (angles['left_hip'] + angles['right_hip']) / 2
                angle_sequence.append(avg_angle)
            elif 'left_hip' in angles:
                angle_sequence.append(angles['left_hip'])
            elif 'right_hip' in angles:
                angle_sequence.append(angles['right_hip'])
    elif exercise_type == 'push_up':
        # Track elbow angles
        for angles in angle_history:
            if 'left_elbow' in angles and 'right_elbow' in angles:
                avg_angle = (angles['left_elbow'] + angles['right_elbow']) / 2
                angle_sequence.append(avg_angle)
            elif 'left_elbow' in angles:
                angle_sequence.append(angles['left_elbow'])
    else:
        # Use hip angle as default (works for most exercises)
        for angles in angle_history:
            if 'left_hip' in angles and 'right_hip' in angles:
                avg_angle = (angles['left_hip'] + angles['right_hip']) / 2
                angle_sequence.append(avg_angle)
            elif 'left_hip' in angles:
                angle_sequence.append(angles['left_hip'])
                break
            elif 'left_knee' in angles:
                angle_sequence.append(angles['left_knee'])
                break
    
    if len(angle_sequence) < 5:
        print(f"Not enough angle data: {len(angle_sequence)} measurements", file=sys.stderr)
        return 0
    
    print(f"Angle sequence ({len(angle_sequence)} points): {[round(a, 1) for a in angle_sequence[:10]]}...", file=sys.stderr)
    
    # Apply moving average smoothing to reduce noise
    window_size = 3
    smoothed = []
    for i in range(len(angle_sequence)):
        start_idx = max(0, i - window_size // 2)
        end_idx = min(len(angle_sequence), i + window_size // 2 + 1)
        smoothed.append(sum(angle_sequence[start_idx:end_idx]) / (end_idx - start_idx))
    
    # Find peaks (local maxima) and valleys (local minima)
    peaks = []
    valleys = []
    
    for i in range(1, len(smoothed) - 1):
        # Check if it's a local maximum (peak)
        if smoothed[i] > smoothed[i-1] and smoothed[i] > smoothed[i+1]:
            # Make sure it's significant enough
            if smoothed[i] > np.mean(smoothed):
                peaks.append((i, smoothed[i]))
        
        # Check if it's a local minimum (valley)
        elif smoothed[i] < smoothed[i-1] and smoothed[i] < smoothed[i+1]:
            # Make sure it's significant enough
            if smoothed[i] < np.mean(smoothed):
                valleys.append((i, smoothed[i]))
    
    print(f"Found {len(peaks)} peaks and {len(valleys)} valleys", file=sys.stderr)
    
    # Each complete rep should have both a peak and valley
    # Count the minimum of peaks and valleys as that represents complete cycles
    reps = min(len(peaks), len(valleys))
    
    # If we have way more of one than the other, use the larger number
    # (might have started/ended mid-rep)
    if len(peaks) > 0 and len(valleys) > 0:
        if max(len(peaks), len(valleys)) - min(len(peaks), len(valleys)) == 1:
            # Off by one is normal (video starts/ends mid-rep)
            reps = max(len(peaks), len(valleys))
    
    print(f"Final rep count: {reps}", file=sys.stderr)
    
    return max(0, min(reps, 20))  # Between 0 and 20

def analyze_motion_fallback(video_path, duration):
    """Simple motion-based fallback."""
    cap = cv2.VideoCapture(video_path)
    
    frame_count = 0
    motion_count = 0
    prev_gray = None
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        if frame_count % 30 != 0:
            continue
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        if prev_gray is not None:
            diff = cv2.absdiff(prev_gray, gray)
            thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)[1]
            if cv2.countNonZero(thresh) > 1000:
                motion_count += 1
        
        prev_gray = gray
    
    cap.release()
    
    motion_ratio = motion_count / max(1, frame_count // 30)
    
    return {
        'exercise_type': 'general_exercise',
        'rep_count': max(1, min(15, int(motion_count / 2))),
        'form_score': min(85, 60 + (motion_ratio * 25)),
        'confidence': min(75, 45 + (motion_ratio * 30)),
        'duration': round(duration, 1),
        'analysis_method': 'motion_fallback'
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python accurate_video_analyzer.py <video_path>'}))
        sys.exit(1)
    
    video_path = sys.argv[1]
    
    if not os.path.exists(video_path):
        print(json.dumps({'error': f'Video file not found: {video_path}'}))
        sys.exit(1)
    
    result = analyze_video_accurate(video_path)
    print(json.dumps(result))
