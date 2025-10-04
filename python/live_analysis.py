#!/usr/bin/env python3
"""
Live Analysis Module for Vibe Coach
Real-time pose analysis and movement assessment
"""

import cv2
import numpy as np
import json
import sys
import os
import base64
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LiveMovementAnalyzer:
    """
    Real-time movement analysis for rehabilitation and fitness
    """
    
    def __init__(self):
        self.exercise_templates = {
            'squat': {
                'key_angles': ['hip', 'knee', 'ankle'],
                'target_ranges': {'hip': (80, 120), 'knee': (70, 110), 'ankle': (70, 110)},
                'common_errors': ['knee_valgus', 'forward_lean', 'heel_lift']
            },
            'lunge': {
                'key_angles': ['front_hip', 'front_knee', 'back_knee'],
                'target_ranges': {'front_hip': (80, 120), 'front_knee': (80, 110), 'back_knee': (80, 110)},
                'common_errors': ['knee_over_toe', 'torso_lean', 'narrow_stance']
            },
            'push_up': {
                'key_angles': ['shoulder', 'elbow', 'hip'],
                'target_ranges': {'shoulder': (160, 180), 'elbow': (70, 110), 'hip': (170, 180)},
                'common_errors': ['sagging_hips', 'flared_elbows', 'partial_range']
            },
            'general': {
                'key_angles': ['hip', 'knee', 'shoulder', 'elbow'],
                'target_ranges': {'hip': (80, 120), 'knee': (70, 110), 'shoulder': (160, 180), 'elbow': (70, 110)},
                'common_errors': ['poor_posture', 'asymmetry', 'limited_range']
            }
        }
        
    def analyze_frame(self, frame: np.ndarray, exercise_type: str = 'general') -> Dict[str, Any]:
        """
        Analyze a single frame for movement quality
        
        Args:
            frame: Input image frame
            exercise_type: Type of exercise being performed
            
        Returns:
            Analysis results dictionary
        """
        try:
            # Get exercise template
            template = self.exercise_templates.get(exercise_type, self.exercise_templates['general'])
            
            # Mock pose detection (in production, use MediaPipe or similar)
            keypoints = self._mock_pose_detection(frame)
            
            # Analyze movement quality
            form_score = self._calculate_form_score(keypoints, template)
            
            # Detect compensations
            compensations = self._detect_compensations(keypoints, template)
            
            # Generate feedback
            feedback = self._generate_feedback(form_score, compensations, exercise_type)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(compensations, exercise_type)
            
            return {
                'success': True,
                'form_score': form_score,
                'rep_count': 0,  # Would be calculated from movement patterns
                'feedback': feedback,
                'compensations': compensations,
                'recommendations': recommendations,
                'keypoints': keypoints,
                'confidence': 0.85,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Frame analysis error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'form_score': 50,
                'feedback': 'Analysis error occurred',
                'compensations': [],
                'recommendations': ['Please try again'],
                'timestamp': datetime.now().isoformat()
            }
    
    def _mock_pose_detection(self, frame: np.ndarray) -> List[Dict[str, float]]:
        """Mock pose detection - replace with real MediaPipe implementation"""
        # Simulate pose keypoints with some randomness
        base_keypoints = [
            {'name': 'nose', 'x': 0.5, 'y': 0.2, 'confidence': 0.95},
            {'name': 'left_shoulder', 'x': 0.4, 'y': 0.3, 'confidence': 0.92},
            {'name': 'right_shoulder', 'x': 0.6, 'y': 0.3, 'confidence': 0.91},
            {'name': 'left_elbow', 'x': 0.35, 'y': 0.4, 'confidence': 0.88},
            {'name': 'right_elbow', 'x': 0.65, 'y': 0.4, 'confidence': 0.89},
            {'name': 'left_wrist', 'x': 0.3, 'y': 0.5, 'confidence': 0.85},
            {'name': 'right_wrist', 'x': 0.7, 'y': 0.5, 'confidence': 0.87},
            {'name': 'left_hip', 'x': 0.45, 'y': 0.6, 'confidence': 0.93},
            {'name': 'right_hip', 'x': 0.55, 'y': 0.6, 'confidence': 0.94},
            {'name': 'left_knee', 'x': 0.42, 'y': 0.8, 'confidence': 0.90},
            {'name': 'right_knee', 'x': 0.58, 'y': 0.8, 'confidence': 0.91},
            {'name': 'left_ankle', 'x': 0.4, 'y': 1.0, 'confidence': 0.86},
            {'name': 'right_ankle', 'x': 0.6, 'y': 1.0, 'confidence': 0.88}
        ]
        
        # Add some randomness to simulate real movement
        for kp in base_keypoints:
            kp['x'] += np.random.normal(0, 0.02)
            kp['y'] += np.random.normal(0, 0.02)
            kp['confidence'] += np.random.normal(0, 0.05)
            kp['confidence'] = max(0.0, min(1.0, kp['confidence']))
        
        return base_keypoints
    
    def _calculate_form_score(self, keypoints: List[Dict], template: Dict) -> float:
        """Calculate overall form score"""
        # Mock form score calculation
        base_score = 75
        
        # Add randomness based on keypoint confidence
        avg_confidence = np.mean([kp['confidence'] for kp in keypoints])
        confidence_bonus = (avg_confidence - 0.8) * 50
        
        # Add some random variation
        variation = np.random.normal(0, 10)
        
        score = base_score + confidence_bonus + variation
        return max(0, min(100, score))
    
    def _detect_compensations(self, keypoints: List[Dict], template: Dict) -> List[Dict]:
        """Detect movement compensations"""
        compensations = []
        
        # Mock compensation detection
        possible_compensations = [
            {'joint': 'left_knee', 'type': 'valgus_collapse', 'severity': 'mild'},
            {'joint': 'lower_back', 'type': 'excessive_rounding', 'severity': 'moderate'},
            {'joint': 'right_hip', 'type': 'anterior_tilt', 'severity': 'mild'},
            {'joint': 'shoulders', 'type': 'forward_head', 'severity': 'mild'}
        ]
        
        # Randomly select 0-2 compensations
        num_compensations = np.random.choice([0, 0, 0, 1, 1, 2], p=[0.4, 0.2, 0.1, 0.2, 0.08, 0.02])
        if num_compensations > 0:
            compensations = np.random.choice(possible_compensations, num_compensations, replace=False).tolist()
        
        return compensations
    
    def _generate_feedback(self, form_score: float, compensations: List[Dict], exercise_type: str) -> str:
        """Generate real-time feedback"""
        if form_score >= 85:
            feedback_options = [
                "Excellent form! Keep it up!",
                "Perfect execution! You're doing great!",
                "Outstanding technique! Maintain this quality!",
                "Superb form! Your hard work is paying off!"
            ]
        elif form_score >= 70:
            feedback_options = [
                "Good form! Focus on maintaining consistency.",
                "Nice work! Small adjustments will perfect your technique.",
                "Solid execution! Keep refining your movement.",
                "Well done! You're on the right track!"
            ]
        elif form_score >= 50:
            feedback_options = [
                "Focus on your form. Slow down if needed.",
                "Pay attention to your posture and alignment.",
                "Good effort! Let's work on technique refinement.",
                "Keep practicing! Form improvements will come."
            ]
        else:
            feedback_options = [
                "Let's focus on proper form over speed.",
                "Take your time and concentrate on technique.",
                "Consider reducing range of motion to improve form.",
                "Great effort! Let's work on the fundamentals."
            ]
        
        base_feedback = np.random.choice(feedback_options)
        
        # Add specific feedback for compensations
        if compensations:
            comp_feedback = f" Watch your {compensations[0]['joint']} - avoid {compensations[0]['type'].replace('_', ' ')}."
            base_feedback += comp_feedback
        
        return base_feedback
    
    def _generate_recommendations(self, compensations: List[Dict], exercise_type: str) -> List[str]:
        """Generate movement recommendations"""
        recommendations = []
        
        # General recommendations
        general_recs = [
            "Maintain steady breathing throughout the movement",
            "Focus on controlled, deliberate movements",
            "Keep your core engaged for stability",
            "Ensure proper warm-up before exercising"
        ]
        
        # Exercise-specific recommendations
        exercise_recs = {
            'squat': [
                "Keep your knees tracking over your toes",
                "Maintain an upright torso",
                "Push through your heels",
                "Engage your glutes at the top"
            ],
            'lunge': [
                "Step into a comfortable stance width",
                "Keep your front knee over your ankle",
                "Maintain an upright torso",
                "Push off your front heel to return"
            ],
            'push_up': [
                "Keep your body in a straight line",
                "Lower your chest to the ground",
                "Push through your palms",
                "Engage your core throughout"
            ]
        }
        
        # Add 1-2 general recommendations
        recommendations.extend(np.random.choice(general_recs, 1, replace=False))
        
        # Add exercise-specific recommendations if available
        if exercise_type in exercise_recs:
            recommendations.extend(np.random.choice(exercise_recs[exercise_type], 1, replace=False))
        
        # Add compensation-specific recommendations
        for comp in compensations:
            if comp['joint'] == 'left_knee' and 'valgus' in comp['type']:
                recommendations.append("Strengthen your hip abductors to prevent knee collapse")
            elif 'back' in comp['joint'] and 'rounding' in comp['type']:
                recommendations.append("Work on thoracic spine mobility and core strength")
        
        return recommendations[:3]  # Limit to 3 recommendations

def process_frame_data(frame_data: str, exercise_type: str = 'general') -> Dict[str, Any]:
    """
    Process base64 encoded frame data
    
    Args:
        frame_data: Base64 encoded JPEG image
        exercise_type: Type of exercise being performed
        
    Returns:
        Analysis results dictionary
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(frame_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"error": "Failed to decode image"}
        
        # Initialize analyzer
        analyzer = LiveMovementAnalyzer()
        
        # Analyze frame
        result = analyzer.analyze_frame(frame, exercise_type)
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        return {"error": str(e)}

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python live_analysis.py <frame_data_file>")
        sys.exit(1)
    
    frame_data_file = sys.argv[1]
    
    try:
        # Read frame data from file
        with open(frame_data_file, 'r') as f:
            data = json.load(f)
        
        frame_data = data.get('frameData', '')
        exercise_type = data.get('exerciseType', 'general')
        
        # Process frame
        result = process_frame_data(frame_data, exercise_type)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
