#!/usr/bin/env python3
"""
================================================================================
AI-POWERED FORM ANALYSIS SYSTEM FOR VIBE COACH REHABILITATION PLATFORM
================================================================================

PURPOSE:
Advanced AI system for real-time exercise form analysis with:
- Precise angle tracking and calculation
- Exercise-specific form criteria
- Compensation pattern detection
- AI-powered feedback generation
- Injury prevention alerts
================================================================================
"""

import cv2
import numpy as np
import json
import base64
import mediapipe as mp
import time
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import logging
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ExerciseType(Enum):
    SQUAT = "squat"
    BICEP_CURL = "bicep_curl"
    PUSH_UP = "push_up"
    LUNGE = "lunge"
    DEADLIFT = "deadlift"
    PLANK = "plank"
    BURPEE = "burpee"
    GENERAL = "general"

class FormQuality(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    DANGEROUS = "dangerous"

@dataclass
class JointAngle:
    """Represents a joint angle measurement"""
    value: float
    confidence: float
    timestamp: float
    is_valid: bool = True

@dataclass
class FormAnalysis:
    """Comprehensive form analysis result"""
    exercise_type: ExerciseType
    overall_score: float
    form_quality: FormQuality
    joint_angles: Dict[str, JointAngle]
    compensations: List[Dict[str, Any]]
    feedback: List[str]
    warnings: List[str]
    recommendations: List[str]
    confidence: float
    timestamp: str

class AIFormAnalyzer:
    """Advanced AI-powered form analysis system"""
    
    def __init__(self):
        """Initialize the AI form analyzer with MediaPipe and exercise templates"""
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,  # Highest accuracy
            enable_segmentation=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Initialize exercise templates with detailed criteria
        self.exercise_templates = self._initialize_exercise_templates()
        
        # Initialize compensation detection patterns
        self.compensation_patterns = self._initialize_compensation_patterns()
        
        # Initialize AI feedback system
        self.feedback_system = self._initialize_feedback_system()

    def _initialize_exercise_templates(self) -> Dict[ExerciseType, Dict]:
        """Initialize detailed exercise templates with form criteria"""
        return {
            ExerciseType.SQUAT: {
                'name': 'Squat',
                'key_joints': ['left_knee', 'right_knee', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'],
                'ideal_angles': {
                    'knee_at_bottom': (85, 95),  # Degrees at bottom of squat
                    'hip_at_bottom': (40, 50),   # Hip angle at bottom
                    'ankle_dorsiflexion': (15, 25),  # Ankle flexibility
                    'torso_angle': (45, 60)      # Torso angle from vertical
                },
                'form_criteria': {
                    'knee_tracking': 0.05,  # Max lateral deviation
                    'hip_levelness': 0.03,  # Max hip height difference
                    'heel_contact': True,   # Must maintain heel contact
                    'knee_valgus': 10,     # Max knee valgus angle
                    'depth_threshold': 90  # Min knee angle for full depth
                },
                'safety_limits': {
                    'max_knee_valgus': 20,
                    'max_forward_lean': 0.3,
                    'min_heel_contact': 0.8
                },
                'rep_criteria': {
                    'primary_angle': 'knee',  # Use knee angle for rep counting
                    'down_threshold': 100,    # Angle when going down
                    'up_threshold': 160,      # Angle when coming up
                    'min_range': 40          # Minimum range for valid rep
                }
            },
            ExerciseType.BICEP_CURL: {
                'name': 'Bicep Curl',
                'key_joints': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder', 'left_wrist', 'right_wrist'],
                'ideal_angles': {
                    'elbow_at_bottom': (160, 180),  # Elbow angle at start/end
                    'elbow_at_top': (30, 50),       # Elbow angle at peak contraction
                    'shoulder_stability': (0, 10),  # Shoulder movement tolerance
                    'wrist_neutral': (0, 15)        # Wrist angle (neutral)
                },
                'form_criteria': {
                    'elbow_symmetry': 0.05,     # Max difference between arms
                    'shoulder_stability': 0.03,  # Max shoulder movement
                    'full_rom': True,           # Must achieve full range
                    'controlled_movement': True, # No swinging
                    'wrist_neutral': 15         # Max wrist deviation
                },
                'safety_limits': {
                    'max_elbow_asymmetry': 15,
                    'max_shoulder_movement': 0.1,
                    'min_elbow_angle': 20
                },
                'rep_criteria': {
                    'primary_angle': 'elbow',   # Use elbow angle for rep counting
                    'down_threshold': 150,      # Angle when extending
                    'up_threshold': 50,         # Angle when contracting
                    'min_range': 80,           # Minimum range for valid rep
                    'arm_stability': True       # Check for arm swinging
                }
            },
            ExerciseType.PUSH_UP: {
                'name': 'Push-up',
                'key_joints': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder', 'left_wrist', 'right_wrist'],
                'ideal_angles': {
                    'elbow_at_bottom': (85, 95),
                    'shoulder_angle': (15, 25),
                    'wrist_extension': (0, 10),
                    'torso_angle': (0, 5)
                },
                'form_criteria': {
                    'elbow_symmetry': 0.05,
                    'shoulder_stability': 0.03,
                    'body_alignment': 0.02,
                    'full_rom': True
                },
                'safety_limits': {
                    'max_elbow_asymmetry': 15,
                    'max_shoulder_elevation': 0.1,
                    'min_chest_to_ground': 0.05
                }
            },
            ExerciseType.LUNGE: {
                'name': 'Lunge',
                'key_joints': ['left_knee', 'right_knee', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'],
                'ideal_angles': {
                    'front_knee': (85, 95),
                    'back_knee': (85, 95),
                    'hip_angle': (45, 55),
                    'torso_angle': (0, 10)
                },
                'form_criteria': {
                    'knee_tracking': 0.05,
                    'hip_levelness': 0.03,
                    'torso_stability': 0.02,
                    'knee_valgus': 10
                },
                'safety_limits': {
                    'max_knee_valgus': 15,
                    'max_hip_drop': 0.1,
                    'min_knee_angle': 80
                }
            },
            ExerciseType.DEADLIFT: {
                'name': 'Deadlift',
                'key_joints': ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_shoulder', 'right_shoulder'],
                'ideal_angles': {
                    'hip_angle_start': (45, 55),
                    'knee_angle_start': (140, 160),
                    'shoulder_over_bar': (0, 5),
                    'torso_angle': (45, 60)
                },
                'form_criteria': {
                    'spine_neutrality': 0.02,
                    'hip_hinge': True,
                    'bar_path': 0.05,
                    'shoulder_stability': 0.03
                },
                'safety_limits': {
                    'max_spine_flexion': 0.1,
                    'max_hip_rise': 0.15,
                    'min_hip_angle': 30
                }
            }
        }

    def _initialize_compensation_patterns(self) -> Dict[str, Dict]:
        """Initialize compensation pattern detection"""
        return {
            'knee_valgus': {
                'description': 'Knees caving inward',
                'detection_method': 'knee_angle_deviation',
                'threshold': 15,
                'severity_levels': {
                    'mild': 10,
                    'moderate': 20,
                    'severe': 30
                }
            },
            'hip_hiking': {
                'description': 'One hip higher than the other',
                'detection_method': 'hip_height_difference',
                'threshold': 0.03,
                'severity_levels': {
                    'mild': 0.02,
                    'moderate': 0.05,
                    'severe': 0.08
                }
            },
            'forward_lean': {
                'description': 'Excessive forward lean',
                'detection_method': 'torso_angle_deviation',
                'threshold': 0.2,
                'severity_levels': {
                    'mild': 0.15,
                    'moderate': 0.25,
                    'severe': 0.35
                }
            },
            'shoulder_elevation': {
                'description': 'Shoulders elevated or hunched',
                'detection_method': 'shoulder_height_deviation',
                'threshold': 0.05,
                'severity_levels': {
                    'mild': 0.03,
                    'moderate': 0.07,
                    'severe': 0.1
                }
            },
            'asymmetric_movement': {
                'description': 'Uneven movement between left and right sides',
                'detection_method': 'bilateral_angle_difference',
                'threshold': 15,
                'severity_levels': {
                    'mild': 10,
                    'moderate': 20,
                    'severe': 30
                }
            }
        }

    def _initialize_feedback_system(self) -> Dict[str, List[str]]:
        """Initialize AI feedback system with coaching cues"""
        return {
            'squat_feedback': {
                'depth': {
                    'excellent': ['Perfect depth!', 'Great range of motion!'],
                    'good': ['Good depth', 'Keep going lower'],
                    'fair': ['Go a bit lower', 'Break parallel'],
                    'poor': ['Too shallow', 'Drop your hips lower'],
                    'dangerous': ['Way too shallow', 'You need to go much lower']
                },
                'knee_tracking': {
                    'excellent': ['Perfect knee tracking!', 'Knees tracking beautifully'],
                    'good': ['Good knee position'],
                    'fair': ['Keep knees over toes', 'Push knees out slightly'],
                    'poor': ['Knees caving in', 'Push knees out more'],
                    'dangerous': ['Knees collapsing inward!', 'This is dangerous - stop!']
                },
                'posture': {
                    'excellent': ['Perfect posture!', 'Great spine alignment'],
                    'good': ['Good posture'],
                    'fair': ['Chest up', 'Keep back straight'],
                    'poor': ['Round your back', 'Chest up and back straight'],
                    'dangerous': ['Dangerous back position!', 'Stop and reset!']
                }
            },
            'bicep_curl_feedback': {
                'range_of_motion': {
                    'excellent': ['Perfect range!', 'Full contraction achieved!'],
                    'good': ['Good range of motion'],
                    'fair': ['Squeeze harder at the top', 'Full extension needed'],
                    'poor': ['Incomplete range', 'Squeeze biceps at the top'],
                    'dangerous': ['Very limited range', 'Focus on full movement']
                },
                'arm_stability': {
                    'excellent': ['Perfect control!', 'Arms staying stable'],
                    'good': ['Good control'],
                    'fair': ['Keep arms still', 'Control the movement'],
                    'poor': ['Arms swinging', 'Stop the momentum'],
                    'dangerous': ['Excessive swinging!', 'Control your arms!']
                },
                'symmetry': {
                    'excellent': ['Perfect symmetry!', 'Both arms working together'],
                    'good': ['Good balance'],
                    'fair': ['Even out both arms', 'Match the movement'],
                    'poor': ['Uneven arms', 'Focus on both sides'],
                    'dangerous': ['Very uneven!', 'Balance your arms!']
                },
                'form': {
                    'excellent': ['Perfect form!', 'Excellent technique'],
                    'good': ['Good form'],
                    'fair': ['Tighten your core', 'Keep shoulders back'],
                    'poor': ['Watch your posture', 'Engage your core'],
                    'dangerous': ['Poor form!', 'Reset your position!']
                }
            },
            'push_up_feedback': {
                'depth': {
                    'excellent': ['Perfect depth!', 'Full range of motion!'],
                    'good': ['Good depth'],
                    'fair': ['Lower your chest more', 'Go deeper'],
                    'poor': ['Too shallow', 'Chest to ground'],
                    'dangerous': ['Way too shallow', 'You need to go much lower']
                },
                'alignment': {
                    'excellent': ['Perfect alignment!', 'Great body position'],
                    'good': ['Good alignment'],
                    'fair': ['Keep body straight', 'Tighten your core'],
                    'poor': ['Hips sagging', 'Keep body rigid'],
                    'dangerous': ['Dangerous position!', 'Stop and reset!']
                }
            }
        }

    def calculate_joint_angles(self, landmarks) -> Dict[str, JointAngle]:
        """Calculate all joint angles with confidence scores"""
        angles = {}
        
        # Define landmark indices
        landmark_indices = {
            'left_shoulder': 11, 'right_shoulder': 12,
            'left_elbow': 13, 'right_elbow': 14,
            'left_wrist': 15, 'right_wrist': 16,
            'left_hip': 23, 'right_hip': 24,
            'left_knee': 25, 'right_knee': 26,
            'left_ankle': 27, 'right_ankle': 28,
            'left_heel': 29, 'right_heel': 30,
            'left_foot_index': 31, 'right_foot_index': 32
        }
        
        # Calculate knee angles (hip-knee-ankle)
        if all(idx < len(landmarks) for idx in [23, 25, 27]):
            left_knee_angle = self._calculate_angle_3d(
                landmarks[23], landmarks[25], landmarks[27]
            )
            angles['left_knee'] = JointAngle(
                value=left_knee_angle,
                confidence=min(landmarks[25].visibility, landmarks[23].visibility, landmarks[27].visibility),
                timestamp=time.time()
            )
        
        if all(idx < len(landmarks) for idx in [24, 26, 28]):
            right_knee_angle = self._calculate_angle_3d(
                landmarks[24], landmarks[26], landmarks[28]
            )
            angles['right_knee'] = JointAngle(
                value=right_knee_angle,
                confidence=min(landmarks[26].visibility, landmarks[24].visibility, landmarks[28].visibility),
                timestamp=time.time()
            )
        
        # Calculate elbow angles (shoulder-elbow-wrist)
        if all(idx < len(landmarks) for idx in [11, 13, 15]):
            left_elbow_angle = self._calculate_angle_3d(
                landmarks[11], landmarks[13], landmarks[15]
            )
            angles['left_elbow'] = JointAngle(
                value=left_elbow_angle,
                confidence=min(landmarks[13].visibility, landmarks[11].visibility, landmarks[15].visibility),
                timestamp=time.time()
            )
        
        if all(idx < len(landmarks) for idx in [12, 14, 16]):
            right_elbow_angle = self._calculate_angle_3d(
                landmarks[12], landmarks[14], landmarks[16]
            )
            angles['right_elbow'] = JointAngle(
                value=right_elbow_angle,
                confidence=min(landmarks[14].visibility, landmarks[12].visibility, landmarks[16].visibility),
                timestamp=time.time()
            )
        
        # Calculate hip angles (shoulder-hip-knee)
        if all(idx < len(landmarks) for idx in [11, 23, 25]):
            left_hip_angle = self._calculate_angle_3d(
                landmarks[11], landmarks[23], landmarks[25]
            )
            angles['left_hip'] = JointAngle(
                value=left_hip_angle,
                confidence=min(landmarks[23].visibility, landmarks[11].visibility, landmarks[25].visibility),
                timestamp=time.time()
            )
        
        if all(idx < len(landmarks) for idx in [12, 24, 26]):
            right_hip_angle = self._calculate_angle_3d(
                landmarks[12], landmarks[24], landmarks[26]
            )
            angles['right_hip'] = JointAngle(
                value=right_hip_angle,
                confidence=min(landmarks[24].visibility, landmarks[12].visibility, landmarks[26].visibility),
                timestamp=time.time()
            )
        
        # Calculate ankle angles (knee-ankle-heel)
        if all(idx < len(landmarks) for idx in [25, 27, 29]):
            left_ankle_angle = self._calculate_angle_3d(
                landmarks[25], landmarks[27], landmarks[29]
            )
            angles['left_ankle'] = JointAngle(
                value=left_ankle_angle,
                confidence=min(landmarks[27].visibility, landmarks[25].visibility, landmarks[29].visibility),
                timestamp=time.time()
            )
        
        if all(idx < len(landmarks) for idx in [26, 28, 30]):
            right_ankle_angle = self._calculate_angle_3d(
                landmarks[26], landmarks[28], landmarks[30]
            )
            angles['right_ankle'] = JointAngle(
                value=right_ankle_angle,
                confidence=min(landmarks[28].visibility, landmarks[26].visibility, landmarks[30].visibility),
                timestamp=time.time()
            )
        
        # Calculate shoulder angles (hip-shoulder-elbow)
        if all(idx < len(landmarks) for idx in [23, 11, 13]):
            left_shoulder_angle = self._calculate_angle_3d(
                landmarks[23], landmarks[11], landmarks[13]
            )
            angles['left_shoulder'] = JointAngle(
                value=left_shoulder_angle,
                confidence=min(landmarks[11].visibility, landmarks[23].visibility, landmarks[13].visibility),
                timestamp=time.time()
            )
        
        if all(idx < len(landmarks) for idx in [24, 12, 14]):
            right_shoulder_angle = self._calculate_angle_3d(
                landmarks[24], landmarks[12], landmarks[14]
            )
            angles['right_shoulder'] = JointAngle(
                value=right_shoulder_angle,
                confidence=min(landmarks[12].visibility, landmarks[24].visibility, landmarks[14].visibility),
                timestamp=time.time()
            )
        
        return angles

    def _calculate_angle_3d(self, point1, point2, point3) -> float:
        """Calculate 3D angle between three points"""
        try:
            # Convert to numpy arrays
            p1 = np.array([point1.x, point1.y, point1.z])
            p2 = np.array([point2.x, point2.y, point2.z])
            p3 = np.array([point3.x, point3.y, point3.z])
            
            # Calculate vectors
            v1 = p1 - p2
            v2 = p3 - p2
            
            # Calculate angle
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8)
            cos_angle = np.clip(cos_angle, -1.0, 1.0)
            angle = np.arccos(cos_angle)
            
            return np.degrees(angle)
        except:
            return 0.0

    def detect_compensations(self, angles: Dict[str, JointAngle], exercise_type: ExerciseType) -> List[Dict[str, Any]]:
        """Detect movement compensations and form deviations"""
        compensations = []
        
        if exercise_type not in self.exercise_templates:
            return compensations
        
        template = self.exercise_templates[exercise_type]
        
        # Check for knee valgus (knees caving in)
        if 'left_knee' in angles and 'right_knee' in angles:
            knee_diff = abs(angles['left_knee'].value - angles['right_knee'].value)
            if knee_diff > self.compensation_patterns['knee_valgus']['threshold']:
                severity = self._get_compensation_severity(knee_diff, 'knee_valgus')
                compensations.append({
                    'type': 'knee_valgus',
                    'description': 'Knees caving inward',
                    'severity': severity,
                    'value': knee_diff,
                    'threshold': self.compensation_patterns['knee_valgus']['threshold'],
                    'recommendation': 'Push knees out over toes'
                })
        
        # Check for hip hiking
        if 'left_hip' in angles and 'right_hip' in angles:
            hip_diff = abs(angles['left_hip'].value - angles['right_hip'].value)
            if hip_diff > self.compensation_patterns['hip_hiking']['threshold']:
                severity = self._get_compensation_severity(hip_diff, 'hip_hiking')
                compensations.append({
                    'type': 'hip_hiking',
                    'description': 'Uneven hip height',
                    'severity': severity,
                    'value': hip_diff,
                    'threshold': self.compensation_patterns['hip_hiking']['threshold'],
                    'recommendation': 'Level your hips'
                })
        
        # Check for shoulder elevation
        if 'left_shoulder' in angles and 'right_shoulder' in angles:
            shoulder_diff = abs(angles['left_shoulder'].value - angles['right_shoulder'].value)
            if shoulder_diff > self.compensation_patterns['shoulder_elevation']['threshold']:
                severity = self._get_compensation_severity(shoulder_diff, 'shoulder_elevation')
                compensations.append({
                    'type': 'shoulder_elevation',
                    'description': 'Uneven shoulder height',
                    'severity': severity,
                    'value': shoulder_diff,
                    'threshold': self.compensation_patterns['shoulder_elevation']['threshold'],
                    'recommendation': 'Level your shoulders'
                })
        
        return compensations

    def _get_compensation_severity(self, value: float, compensation_type: str) -> str:
        """Determine compensation severity level"""
        thresholds = self.compensation_patterns[compensation_type]['severity_levels']
        
        if value >= thresholds['severe']:
            return 'severe'
        elif value >= thresholds['moderate']:
            return 'moderate'
        else:
            return 'mild'

    def analyze_form(self, frame: np.ndarray, exercise_type: str = 'general') -> FormAnalysis:
        """Perform comprehensive form analysis"""
        try:
            # Convert BGR to RGB
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            else:
                rgb_frame = frame
            
            # Process with MediaPipe
            results = self.pose.process(rgb_frame)
            
            if not results.pose_landmarks:
                return self._create_empty_analysis(exercise_type)
            
            # Calculate joint angles
            angles = self.calculate_joint_angles(results.pose_landmarks.landmark)
            
            # Determine exercise type
            exercise_enum = ExerciseType(exercise_type.lower()) if exercise_type.lower() in [e.value for e in ExerciseType] else ExerciseType.GENERAL
            
            # Detect compensations
            compensations = self.detect_compensations(angles, exercise_enum)
            
            # Calculate overall form score
            form_score = self._calculate_form_score(angles, compensations, exercise_enum)
            
            # Determine form quality
            form_quality = self._determine_form_quality(form_score)
            
            # Generate AI feedback
            feedback = self._generate_ai_feedback(angles, compensations, exercise_enum)
            
            # Generate warnings
            warnings = self._generate_warnings(compensations, form_score)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(compensations, exercise_enum)
            
            # Calculate confidence
            confidence = self._calculate_confidence(angles, results.pose_landmarks.landmark)
            
            return FormAnalysis(
                exercise_type=exercise_enum,
                overall_score=form_score,
                form_quality=form_quality,
                joint_angles=angles,
                compensations=compensations,
                feedback=feedback,
                warnings=warnings,
                recommendations=recommendations,
                confidence=confidence,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error in form analysis: {str(e)}")
            return self._create_empty_analysis(exercise_type)

    def _calculate_form_score(self, angles: Dict[str, JointAngle], compensations: List[Dict], exercise_type: ExerciseType) -> float:
        """Calculate overall form score based on angles and compensations"""
        if exercise_type not in self.exercise_templates:
            return 75.0
        
        template = self.exercise_templates[exercise_type]
        base_score = 100.0
        
        # Deduct points for compensations
        for comp in compensations:
            if comp['severity'] == 'severe':
                base_score -= 25
            elif comp['severity'] == 'moderate':
                base_score -= 15
            else:  # mild
                base_score -= 5
        
        # Check exercise-specific criteria
        if exercise_type == ExerciseType.SQUAT:
            # Check depth
            if 'left_knee' in angles and 'right_knee' in angles:
                avg_knee_angle = (angles['left_knee'].value + angles['right_knee'].value) / 2
                if avg_knee_angle > template['form_criteria']['depth_threshold']:
                    base_score -= 20  # Not deep enough
                elif avg_knee_angle < 80:  # Too deep
                    base_score -= 10
        
        elif exercise_type == ExerciseType.PUSH_UP:
            # Check depth
            if 'left_elbow' in angles and 'right_elbow' in angles:
                avg_elbow_angle = (angles['left_elbow'].value + angles['right_elbow'].value) / 2
                if avg_elbow_angle > 120:  # Not deep enough
                    base_score -= 20
        
        return max(0.0, min(100.0, base_score))

    def _determine_form_quality(self, score: float) -> FormQuality:
        """Determine form quality based on score"""
        if score >= 90:
            return FormQuality.EXCELLENT
        elif score >= 80:
            return FormQuality.GOOD
        elif score >= 70:
            return FormQuality.FAIR
        elif score >= 60:
            return FormQuality.POOR
        else:
            return FormQuality.DANGEROUS

    def _generate_ai_feedback(self, angles: Dict[str, JointAngle], compensations: List[Dict], exercise_type: ExerciseType) -> List[str]:
        """Generate AI-powered feedback based on analysis"""
        feedback = []
        
        if exercise_type not in self.exercise_templates:
            return ["Continue with your exercise"]
        
        # Exercise-specific feedback
        if exercise_type == ExerciseType.SQUAT:
            if 'left_knee' in angles and 'right_knee' in angles:
                avg_knee_angle = (angles['left_knee'].value + angles['right_knee'].value) / 2
                if avg_knee_angle < 90:
                    feedback.append("💎 Perfect depth!")
                elif avg_knee_angle < 100:
                    feedback.append("✅ Good depth")
                elif avg_knee_angle < 120:
                    feedback.append("📏 Go lower")
                else:
                    feedback.append("❌ Too shallow - break parallel")
        
        elif exercise_type == ExerciseType.PUSH_UP:
            if 'left_elbow' in angles and 'right_elbow' in angles:
                avg_elbow_angle = (angles['left_elbow'].value + angles['right_elbow'].value) / 2
                if avg_elbow_angle < 90:
                    feedback.append("💪 Full range of motion!")
                elif avg_elbow_angle < 100:
                    feedback.append("✅ Good depth")
                elif avg_elbow_angle < 120:
                    feedback.append("📏 Lower your chest")
                else:
                    feedback.append("❌ Too shallow - chest to ground")
        
        # Compensation feedback
        for comp in compensations:
            if comp['severity'] == 'severe':
                feedback.append(f"🚨 {comp['description']} - {comp['recommendation']}")
            elif comp['severity'] == 'moderate':
                feedback.append(f"⚠️ {comp['description']} - {comp['recommendation']}")
            else:
                feedback.append(f"💡 {comp['recommendation']}")
        
        return feedback if feedback else ["Keep up the good work!"]

    def _generate_warnings(self, compensations: List[Dict], form_score: float) -> List[str]:
        """Generate safety warnings"""
        warnings = []
        
        if form_score < 50:
            warnings.append("⚠️ Form is dangerous - consider stopping")
        
        for comp in compensations:
            if comp['severity'] == 'severe':
                warnings.append(f"🚨 Severe {comp['description']} detected")
        
        return warnings

    def _generate_recommendations(self, compensations: List[Dict], exercise_type: ExerciseType) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        for comp in compensations:
            recommendations.append(comp['recommendation'])
        
        if exercise_type == ExerciseType.SQUAT:
            recommendations.append("Keep your chest up and core tight")
            recommendations.append("Push your knees out over your toes")
        elif exercise_type == ExerciseType.PUSH_UP:
            recommendations.append("Keep your body in a straight line")
            recommendations.append("Engage your core throughout")
        
        return recommendations

    def _calculate_confidence(self, angles: Dict[str, JointAngle], landmarks) -> float:
        """Calculate analysis confidence based on landmark quality"""
        if not angles:
            return 0.0
        
        # Calculate average confidence from joint angles
        confidences = [angle.confidence for angle in angles.values() if angle.is_valid]
        
        if not confidences:
            return 0.0
        
        return np.mean(confidences)

    def _create_empty_analysis(self, exercise_type: str) -> FormAnalysis:
        """Create empty analysis when pose detection fails"""
        return FormAnalysis(
            exercise_type=ExerciseType(exercise_type.lower()) if exercise_type.lower() in [e.value for e in ExerciseType] else ExerciseType.GENERAL,
            overall_score=0.0,
            form_quality=FormQuality.DANGEROUS,
            joint_angles={},
            compensations=[],
            feedback=["Unable to detect pose. Please ensure good lighting and visibility."],
            warnings=["Pose detection failed"],
            recommendations=["Check camera positioning and lighting"],
            confidence=0.0,
            timestamp=datetime.now().isoformat()
        )

def process_frame_ai_analysis(frame_data: str, exercise_type: str = 'general') -> Dict[str, Any]:
    """
    Process a base64 encoded video frame for AI-powered form analysis.
    
    Args:
        frame_data (str): Base64 encoded JPEG image data
        exercise_type (str): Type of exercise being performed
        
    Returns:
        Dict[str, Any]: Comprehensive AI analysis results
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(frame_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"error": "Failed to decode image"}
        
        # Initialize AI analyzer
        analyzer = AIFormAnalyzer()
        
        # Perform analysis
        analysis = analyzer.analyze_form(frame, exercise_type)
        
        # Convert to JSON-serializable format
        result = {
            'timestamp': analysis.timestamp,
            'exercise_type': analysis.exercise_type.value,
            'overall_score': round(analysis.overall_score, 1),
            'form_quality': analysis.form_quality.value,
            'confidence': round(analysis.confidence, 3),
            'joint_angles': {
                name: {
                    'value': round(angle.value, 1),
                    'confidence': round(angle.confidence, 3),
                    'is_valid': angle.is_valid
                }
                for name, angle in analysis.joint_angles.items()
            },
            'compensations': analysis.compensations,
            'feedback': analysis.feedback,
            'warnings': analysis.warnings,
            'recommendations': analysis.recommendations
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        return {"error": str(e)}

def main():
    """Main function for command-line usage"""
    import sys
    
    if len(sys.argv) < 2:
        logger.error("Usage: python ai_form_analyzer.py <frame_data_file>")
        sys.exit(1)
    
    try:
        # Read frame data from JSON file
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)
        
        frame_data = data.get('frameData')
        exercise_type = data.get('exerciseType', 'general')
        
        if not frame_data:
            logger.error("No frame data provided")
            sys.exit(1)
        
        # Process the frame
        result = process_frame_ai_analysis(frame_data, exercise_type)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
