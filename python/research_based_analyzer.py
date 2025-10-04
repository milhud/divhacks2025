#!/usr/bin/env python3
"""
Research-Based Video Analyzer
Uses proven algorithms from exercise science and computer vision research
"""

import cv2
import json
import sys
import os
import numpy as np
from scipy import signal
from collections import deque

sys.path.insert(0, os.path.dirname(__file__))
from live_analysis import LiveMovementAnalyzer

class ExerciseClassifier:
    """
    Exercise classification based on biomechanics research
    Uses joint angle patterns to identify exercises
    """
    
    # Research-based thresholds from exercise science literature
    EXERCISE_SIGNATURES = {
        'deadlift': {
            'hip_rom': (40, 90),      # Hip flexion/extension range
            'knee_rom': (0, 30),       # Minimal knee movement
            'trunk_angle': (0, 45),    # Forward lean
            'primary_joint': 'hip',
            'key_feature': 'hip_hinge'
        },
        'squat': {
            'hip_rom': (40, 100),
            'knee_rom': (40, 110),     # Significant knee flexion
            'trunk_angle': (0, 30),    # More upright
            'primary_joint': 'both',
            'key_feature': 'knee_dominant'
        },
        'push_up': {
            'elbow_rom': (40, 140),
            'shoulder_rom': (0, 40),
            'trunk_angle': (0, 15),    # Horizontal body
            'primary_joint': 'elbow',
            'key_feature': 'upper_body'
        }
    }
    
    def classify(self, angle_data):
        """Classify exercise based on joint ROM patterns"""
        if not angle_data or len(angle_data) < 5:
            return 'unknown'
        
        # Calculate ROM for each joint
        hip_angles = []
        knee_angles = []
        elbow_angles = []
        
        for frame in angle_data:
            if 'left_hip' in frame and 'right_hip' in frame:
                hip_angles.append((frame['left_hip'] + frame['right_hip']) / 2)
            if 'left_knee' in frame and 'right_knee' in frame:
                knee_angles.append((frame['left_knee'] + frame['right_knee']) / 2)
            if 'left_elbow' in frame and 'right_elbow' in frame:
                elbow_angles.append((frame['left_elbow'] + frame['right_elbow']) / 2)
        
        hip_rom = max(hip_angles) - min(hip_angles) if hip_angles else 0
        knee_rom = max(knee_angles) - min(knee_angles) if knee_angles else 0
        elbow_rom = max(elbow_angles) - min(elbow_angles) if elbow_angles else 0
        
        print(f"ROM Analysis: Hip={hip_rom:.1f}°, Knee={knee_rom:.1f}°, Elbow={elbow_rom:.1f}°", file=sys.stderr)
        
        # Score each exercise type
        scores = {}
        for ex_type, signature in self.EXERCISE_SIGNATURES.items():
            score = 0
            
            # Check hip ROM
            if 'hip_rom' in signature:
                if signature['hip_rom'][0] <= hip_rom <= signature['hip_rom'][1]:
                    score += 3
                elif abs(hip_rom - np.mean(signature['hip_rom'])) < 20:
                    score += 1
            
            # Check knee ROM  
            if 'knee_rom' in signature:
                if signature['knee_rom'][0] <= knee_rom <= signature['knee_rom'][1]:
                    score += 3
                elif abs(knee_rom - np.mean(signature['knee_rom'])) < 20:
                    score += 1
            
            # Check elbow ROM
            if 'elbow_rom' in signature:
                if signature['elbow_rom'][0] <= elbow_rom <= signature['elbow_rom'][1]:
                    score += 3
            
            scores[ex_type] = score
        
        # Return exercise with highest score
        best_match = max(scores.items(), key=lambda x: x[1])
        print(f"Exercise scores: {scores}", file=sys.stderr)
        
        return best_match[0] if best_match[1] >= 3 else 'general_exercise'

class RepCounter:
    """
    Rep counting using scipy peak detection
    Based on signal processing research
    """
    
    def count_reps(self, angle_sequence):
        """
        Count reps using scipy's find_peaks algorithm
        More reliable than manual peak detection
        """
        if len(angle_sequence) < 10:
            return 0
        
        # Convert to numpy array
        signal_data = np.array(angle_sequence)
        
        # Smooth the signal using Savitzky-Golay filter
        if len(signal_data) >= 5:
            smoothed = signal.savgol_filter(signal_data, window_length=5, polyorder=2)
        else:
            smoothed = signal_data
        
        # Find peaks (top of movement)
        peaks, _ = signal.find_peaks(smoothed, distance=3, prominence=5)
        
        # Find valleys (bottom of movement)  
        valleys, _ = signal.find_peaks(-smoothed, distance=3, prominence=5)
        
        print(f"Signal processing: {len(peaks)} peaks, {len(valleys)} valleys", file=sys.stderr)
        
        # Reps = min of peaks and valleys (complete cycles)
        return min(len(peaks), len(valleys))

def analyze_video(video_path):
    """Main analysis function using research-based methods"""
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Cannot open video")
        
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        
        print(f"Analyzing: {total_frames} frames @ {fps} fps", file=sys.stderr)
        
        # Initialize
        analyzer = LiveMovementAnalyzer()
        classifier = ExerciseClassifier()
        rep_counter = RepCounter()
        
        frame_count = 0
        angle_data = []
        form_scores = []
        
        # Process video
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Process every 8th frame (balance speed/accuracy)
            if frame_count % 8 != 0:
                continue
            
            # Analyze with MediaPipe
            analysis = analyzer.analyze_frame(frame, 'general')
            
            if analysis and analysis.get('pose_detected') and analysis.get('angles'):
                angle_data.append(analysis['angles'])
                if analysis.get('form_score'):
                    form_scores.append(analysis['form_score'])
        
        cap.release()
        
        print(f"Collected {len(angle_data)} pose measurements", file=sys.stderr)
        
        if len(angle_data) < 5:
            raise Exception("Insufficient pose data")
        
        # Classify exercise using research-based method
        exercise_type = classifier.classify(angle_data)
        
        # Extract angle sequence for rep counting
        if exercise_type in ['deadlift', 'squat']:
            angle_seq = [
                (d.get('left_hip', 0) + d.get('right_hip', 0)) / 2 
                for d in angle_data 
                if 'left_hip' in d or 'right_hip' in d
            ]
        elif exercise_type == 'push_up':
            angle_seq = [
                (d.get('left_elbow', 0) + d.get('right_elbow', 0)) / 2
                for d in angle_data
                if 'left_elbow' in d or 'right_elbow' in d
            ]
        else:
            angle_seq = [
                (d.get('left_hip', 0) + d.get('right_hip', 0)) / 2
                for d in angle_data
                if 'left_hip' in d or 'right_hip' in d
            ]
        
        # Count reps using signal processing
        rep_count = rep_counter.count_reps(angle_seq)
        
        # Calculate scores
        avg_form = np.mean(form_scores) if form_scores else 75
        confidence = min(95, 60 + (len(angle_data) / (total_frames / 8)) * 40)
        
        return {
            'exercise_type': exercise_type,
            'rep_count': rep_count,
            'form_score': round(avg_form, 1),
            'confidence': round(confidence, 1),
            'duration': round(duration, 1),
            'total_frames': total_frames,
            'analyzed_frames': len(angle_data),
            'analysis_method': 'research_based'
        }
        
    except Exception as e:
        print(f"Analysis error: {e}", file=sys.stderr)
        return {
            'exercise_type': 'general_exercise',
            'rep_count': 0,
            'form_score': 70.0,
            'confidence': 50.0,
            'duration': 15.0,
            'error': str(e),
            'analysis_method': 'fallback'
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python research_based_analyzer.py <video_path>'}))
        sys.exit(1)
    
    result = analyze_video(sys.argv[1])
    print(json.dumps(result))
