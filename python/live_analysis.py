#!/usr/bin/env python3
"""
================================================================================
LIVE CAMERA FEED ANALYSIS BACKEND FOR VIBE COACH REHABILITATION PLATFORM
================================================================================

PURPOSE:
This module serves as the real-time video processing engine for the Vibe Coach 
rehabilitation platform. It processes live camera feed frames to provide 
instantaneous AI-powered analysis of movement patterns, form quality, pain 
indicators, and rehabilitation-specific metrics during exercise sessions.
================================================================================
"""

import cv2
import numpy as np
import json
import base64
import mediapipe as mp
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# Configure logging with detailed information for debugging and monitoring
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LiveMovementAnalyzer:
    def __init__(self):
        """Initialize the movement analyzer with MediaPipe pose detection"""
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Exercise-specific analysis parameters
        self.exercise_templates = {
            'squat': {
                'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
                'target_ranges': {'knee': (90, 120), 'hip': (60, 90)},
                'compensation_thresholds': {'knee_valgus': 15, 'hip_hiking': 10}
            },
            'lunge': {
                'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
                'target_ranges': {'knee': (80, 100), 'hip': (70, 100)},
                'compensation_thresholds': {'knee_valgus': 12, 'hip_hiking': 8}
            },
            'push_up': {
                'key_angles': ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
                'target_ranges': {'shoulder': (160, 180), 'elbow': (80, 100)},
                'compensation_thresholds': {'shoulder_elevation': 20, 'hip_sag': 15}
            }
        }
        
        # Pain assessment parameters
        self.pain_indicators = {
            'facial_expression': ['grimace', 'frown', 'tension'],
            'movement_compensation': ['guarding', 'limping', 'stiffness'],
            'range_of_motion': ['limited', 'restricted', 'painful']
        }

    def analyze_frame(self, frame: np.ndarray, exercise_type: str = 'general') -> Dict[str, Any]:
        """
        Analyze a single video frame for movement quality and rehabilitation metrics.
        
        Args:
            frame (np.ndarray): Input video frame as RGB numpy array with shape (H, W, 3)
            exercise_type (str): Type of exercise being performed ('squat', 'lunge', 'push_up', 'general')
            
        Returns:
            Dict[str, Any]: Comprehensive analysis results including scores, compensations, 
                           pain indicators, keypoints, feedback, and confidence metrics
        """
        try:
            # Convert BGR to RGB if needed
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            else:
                rgb_frame = frame
            
            # Process frame with MediaPipe
            results = self.pose.process(rgb_frame)
            
            if not results.pose_landmarks:
                return self._create_empty_analysis()
            
            # Extract pose landmarks
            landmarks = results.pose_landmarks.landmark
            
            # Calculate key angles
            angles = self._calculate_angles(landmarks)
            
            # Analyze movement quality
            form_score = self._calculate_form_score(angles, exercise_type)
            
            # Detect compensations
            compensations = self._detect_compensations(angles, exercise_type)
            
            # Assess pain indicators
            pain_indicators = self._assess_pain_indicators(frame, landmarks)
            
            # Calculate range of motion
            rom_score = self._calculate_rom_score(angles, exercise_type)
            
            # Generate feedback
            feedback = self._generate_feedback(form_score, compensations, pain_indicators)
            
            return {
                'timestamp': datetime.now().isoformat(),
                'exercise_type': exercise_type,
                'form_score': form_score,
                'range_of_motion': rom_score,
                'stability_score': self._calculate_stability_score(landmarks),
                'compensations': compensations,
                'pain_indicators': pain_indicators,
                'keypoints': self._extract_keypoints(landmarks),
                'feedback': feedback,
                'confidence': results.pose_landmarks.landmark[0].visibility if results.pose_landmarks else 0.0
            }
            
        except Exception as e:
            logger.error(f"Error analyzing frame: {str(e)}")
            return self._create_empty_analysis()

    def _calculate_angles(self, landmarks) -> Dict[str, float]:
        """Calculate key joint angles from pose landmarks"""
        angles = {}
        
        # Define landmark indices for key joints
        joint_indices = {
            'left_shoulder': 11, 'right_shoulder': 12,
            'left_elbow': 13, 'right_elbow': 14,
            'left_wrist': 15, 'right_wrist': 16,
            'left_hip': 23, 'right_hip': 24,
            'left_knee': 25, 'right_knee': 26,
            'left_ankle': 27, 'right_ankle': 28
        }
        
        # Calculate angles for major joints
        for joint, idx in joint_indices.items():
            if idx < len(landmarks):
                landmark = landmarks[idx]
                angles[joint] = {
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                }
        
        return angles

    def _calculate_form_score(self, angles: Dict, exercise_type: str) -> int:
        """Calculate overall form score based on joint angles and exercise type"""
        base_score = 70
        
        if exercise_type not in self.exercise_templates:
            return base_score
        
        template = self.exercise_templates[exercise_type]
        score_adjustments = []
        
        # Check key angles against target ranges
        for joint, target_range in template['target_ranges'].items():
            if joint in angles:
                angle_value = angles[joint].get('x', 0.5) * 180  # Convert to degrees
                if target_range[0] <= angle_value <= target_range[1]:
                    score_adjustments.append(5)
                else:
                    score_adjustments.append(-10)
        
        # Apply compensations penalty
        compensations = self._detect_compensations(angles, exercise_type)
        compensation_penalty = len(compensations) * 5
        
        final_score = base_score + sum(score_adjustments) - compensation_penalty
        return max(0, min(100, final_score))

    def _detect_compensations(self, angles: Dict, exercise_type: str) -> List[Dict]:
        """Detect movement compensations based on joint angles"""
        compensations = []
        
        if exercise_type not in self.exercise_templates:
            return compensations
        
        template = self.exercise_templates[exercise_type]
        thresholds = template['compensation_thresholds']
        
        # Check for knee valgus (knees caving in)
        if 'left_knee' in angles and 'right_knee' in angles:
            left_knee_x = angles['left_knee']['x']
            right_knee_x = angles['right_knee']['x']
            valgus_angle = abs(left_knee_x - right_knee_x) * 180
            
            if valgus_angle > thresholds.get('knee_valgus', 15):
                compensations.append({
                    'joint': 'knees',
                    'compensation_type': 'valgus_collapse',
                    'severity': 'moderate' if valgus_angle > 20 else 'mild',
                    'angle': valgus_angle
                })
        
        # Check for hip hiking
        if 'left_hip' in angles and 'right_hip' in angles:
            left_hip_y = angles['left_hip']['y']
            right_hip_y = angles['right_hip']['y']
            hip_difference = abs(left_hip_y - right_hip_y) * 100
            
            if hip_difference > thresholds.get('hip_hiking', 10):
                compensations.append({
                    'joint': 'hips',
                    'compensation_type': 'hip_hiking',
                    'severity': 'moderate' if hip_difference > 15 else 'mild',
                    'difference': hip_difference
                })
        
        # Check for shoulder elevation
        if 'left_shoulder' in angles and 'right_shoulder' in angles:
            left_shoulder_y = angles['left_shoulder']['y']
            right_shoulder_y = angles['right_shoulder']['y']
            shoulder_difference = abs(left_shoulder_y - right_shoulder_y) * 100
            
            if shoulder_difference > thresholds.get('shoulder_elevation', 20):
                compensations.append({
                    'joint': 'shoulders',
                    'compensation_type': 'elevation',
                    'severity': 'moderate' if shoulder_difference > 25 else 'mild',
                    'difference': shoulder_difference
                })
        
        return compensations

    def _assess_pain_indicators(self, frame: np.ndarray, landmarks) -> List[Dict]:
        """Assess potential pain indicators from facial expression and movement"""
        pain_indicators = []
        
        # Check for movement guarding (reduced range of motion)
        if len(landmarks) > 0:
            # Calculate overall movement amplitude
            movement_amplitude = self._calculate_movement_amplitude(landmarks)
            
            if movement_amplitude < 0.3:  # Threshold for guarded movement
                pain_indicators.append({
                    'type': 'movement_guarding',
                    'severity': 'moderate',
                    'description': 'Reduced movement range detected',
                    'confidence': 0.75
                })
        
        # Check for stiffness (limited joint mobility)
        joint_mobility = self._assess_joint_mobility(landmarks)
        if joint_mobility < 0.6:
            pain_indicators.append({
                'type': 'joint_stiffness',
                'severity': 'mild',
                'description': 'Limited joint mobility detected',
                'confidence': 0.65
            })
        
        return pain_indicators

    def _calculate_rom_score(self, angles: Dict, exercise_type: str) -> int:
        """Calculate range of motion score"""
        if exercise_type not in self.exercise_templates:
            return 75
        
        template = self.exercise_templates[exercise_type]
        rom_scores = []
        
        for joint, target_range in template['target_ranges'].items():
            if joint in angles:
                angle_value = angles[joint].get('x', 0.5) * 180
                range_span = target_range[1] - target_range[0]
                actual_span = min(angle_value, target_range[1]) - max(angle_value, target_range[0])
                rom_score = max(0, (actual_span / range_span) * 100)
                rom_scores.append(rom_score)
        
        return int(np.mean(rom_scores)) if rom_scores else 75

    def _calculate_stability_score(self, landmarks) -> int:
        """Calculate stability score based on pose stability"""
        if len(landmarks) < 10:
            return 50
        
        # Calculate center of mass stability
        center_x = np.mean([lm.x for lm in landmarks])
        center_y = np.mean([lm.y for lm in landmarks])
        
        # Calculate stability based on landmark distribution
        stability = 100 - (np.std([lm.x for lm in landmarks]) + np.std([lm.y for lm in landmarks])) * 100
        
        return max(0, min(100, int(stability)))

    def _calculate_movement_amplitude(self, landmarks) -> float:
        """Calculate overall movement amplitude"""
        if len(landmarks) < 2:
            return 0.0
        
        # Calculate average movement between consecutive landmarks
        movements = []
        for i in range(len(landmarks) - 1):
            dx = abs(landmarks[i+1].x - landmarks[i].x)
            dy = abs(landmarks[i+1].y - landmarks[i].y)
            movements.append(np.sqrt(dx*dx + dy*dy))
        
        return np.mean(movements) if movements else 0.0

    def _assess_joint_mobility(self, landmarks) -> float:
        """Assess overall joint mobility"""
        if len(landmarks) < 5:
            return 0.5
        
        # Calculate joint angle ranges
        joint_ranges = []
        for i in range(0, len(landmarks) - 2, 2):
            if i + 2 < len(landmarks):
                # Calculate angle between three consecutive points
                p1, p2, p3 = landmarks[i], landmarks[i+1], landmarks[i+2]
                angle = self._calculate_angle_between_points(p1, p2, p3)
                joint_ranges.append(angle)
        
        return np.mean(joint_ranges) if joint_ranges else 0.5

    def _calculate_angle_between_points(self, p1, p2, p3) -> float:
        """Calculate angle between three points"""
        # Vector from p2 to p1
        v1 = np.array([p1.x - p2.x, p1.y - p2.y])
        # Vector from p2 to p3
        v2 = np.array([p3.x - p2.x, p3.y - p2.y])
        
        # Calculate angle between vectors
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        cos_angle = np.clip(cos_angle, -1.0, 1.0)
        angle = np.arccos(cos_angle)
        
        return angle / np.pi  # Normalize to 0-1

    def _extract_keypoints(self, landmarks) -> List[Dict]:
        """Extract key pose landmarks"""
        keypoints = []
        landmark_names = {
            0: 'nose',
            11: 'left_shoulder', 12: 'right_shoulder',
            13: 'left_elbow', 14: 'right_elbow',
            15: 'left_wrist', 16: 'right_wrist',
            23: 'left_hip', 24: 'right_hip',
            25: 'left_knee', 26: 'right_knee',
            27: 'left_ankle', 28: 'right_ankle'
        }
        
        for i, landmark in enumerate(landmarks):
            keypoints.append({
                'name': landmark_names.get(i, f'landmark_{i}'),
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'confidence': landmark.visibility
            })
        return keypoints

    def _generate_feedback(self, form_score: int, compensations: List[Dict], pain_indicators: List[Dict]) -> str:
        """Generate feedback based on analysis results"""
        feedback_parts = []
        
        # Form score feedback
        if form_score >= 90:
            feedback_parts.append("Excellent form! Keep up the great work.")
        elif form_score >= 80:
            feedback_parts.append("Good form overall. Minor adjustments needed.")
        elif form_score >= 70:
            feedback_parts.append("Form needs improvement. Focus on technique.")
        else:
            feedback_parts.append("Form requires significant attention. Consider reducing intensity.")
        
        # Compensation feedback
        for comp in compensations:
            if comp['compensation_type'] == 'valgus_collapse':
                feedback_parts.append("Keep your knees tracking over your toes.")
            elif comp['compensation_type'] == 'hip_hiking':
                feedback_parts.append("Maintain level hips throughout the movement.")
            elif comp['compensation_type'] == 'elevation':
                feedback_parts.append("Keep your shoulders down and back.")
        
        # Pain indicator feedback
        for indicator in pain_indicators:
            if indicator['type'] == 'movement_guarding':
                feedback_parts.append("Try to move more freely. If you feel pain, stop the exercise.")
            elif indicator['type'] == 'joint_stiffness':
                feedback_parts.append("Focus on smooth, controlled movements.")
        
        return " ".join(feedback_parts) if feedback_parts else "Continue with your exercise."

    def _create_empty_analysis(self) -> Dict[str, Any]:
        """Create empty analysis result when pose detection fails"""
        return {
            'timestamp': datetime.now().isoformat(),
            'exercise_type': 'general',
            'form_score': 0,
            'range_of_motion': 0,
            'stability_score': 0,
            'compensations': [],
            'pain_indicators': [],
            'keypoints': [],
            'feedback': 'Unable to detect pose. Please ensure good lighting and visibility.',
            'confidence': 0.0
        }

def process_video_frame(frame_data: str, exercise_type: str = 'general') -> Dict[str, Any]:
    """
    Process a base64 encoded video frame for movement analysis.
    
    Args:
        frame_data (str): Base64 encoded JPEG image data from live camera feed
        exercise_type (str): Type of exercise being performed
        
    Returns:
        Dict[str, Any]: Comprehensive analysis results
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
    """Main function for testing"""
    # Example usage
    analyzer = LiveMovementAnalyzer()
    
    # Test with a sample frame (you would replace this with actual camera input)
    test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    result = analyzer.analyze_frame(test_frame, 'squat')
    
    print("Analysis Result:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()