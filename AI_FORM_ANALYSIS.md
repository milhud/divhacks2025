# 🤖 AI-Powered Form Analysis System

## Overview

This advanced AI system provides real-time exercise form analysis with precise angle tracking, compensation detection, and intelligent feedback generation. Built on top of MediaPipe pose detection, it offers professional-grade form analysis for fitness and rehabilitation applications.

## Features

### 🎯 Core Capabilities
- **Real-time Joint Angle Tracking**: Precise calculation of all major joint angles
- **Exercise-Specific Analysis**: Tailored form criteria for different exercises
- **Compensation Detection**: Identifies movement compensations and form deviations
- **AI-Powered Feedback**: Intelligent coaching cues and recommendations
- **Injury Prevention**: Safety alerts and warning systems
- **Voice Coaching**: Real-time audio feedback and cues

### 📊 Supported Exercises
- **Squat**: Depth analysis, knee tracking, hip positioning
- **Push-up**: Range of motion, body alignment, elbow symmetry
- **Lunge**: Knee angles, hip stability, torso alignment
- **Deadlift**: Hip hinge, spine neutrality, bar path
- **Plank**: Core stability, body alignment
- **General**: Universal movement analysis

### 🔬 Technical Features
- **3D Angle Calculations**: Accurate joint angle measurements
- **Compensation Patterns**: Detection of common movement faults
- **Quality Scoring**: Confidence-based analysis weighting
- **Adaptive Thresholds**: Personalized rep counting
- **Real-time Processing**: Low-latency analysis pipeline

## Architecture

### Components

1. **AI Form Analyzer** (`ai_form_analyzer.py`)
   - Core analysis engine
   - Joint angle calculations
   - Compensation detection
   - Form scoring algorithms

2. **AI Live Camera** (`ai-live-camera.tsx`)
   - React component for live analysis
   - MediaPipe integration
   - Real-time feedback display
   - Voice coaching system

3. **Backend API** (`/api/ai/analyze-form`)
   - Python script execution
   - Frame processing
   - Result formatting

4. **Demo Interface** (`/ai-analysis`)
   - Exercise selection
   - Analysis history
   - Statistics dashboard

### Data Flow

```
Camera Feed → MediaPipe → Joint Angles → AI Analysis → Feedback → UI Display
     ↓              ↓           ↓            ↓           ↓
  Frame Capture → Pose Detection → Angle Calc → Form Score → Voice/Visual
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- MediaPipe
- OpenCV

### Setup

1. **Install Python Dependencies**
```bash
cd python
pip install -r requirements.txt
```

2. **Install Node Dependencies**
```bash
npm install
```

3. **Start the Application**
```bash
npm run dev
```

4. **Access AI Analysis**
Navigate to `http://localhost:3000/ai-analysis`

## Usage

### Basic Usage

1. **Select Exercise Type**
   - Choose from supported exercises
   - Each has specific form criteria

2. **Start Camera**
   - Click "Start AI Analysis"
   - Allow camera permissions
   - Wait for calibration (3 seconds)

3. **Perform Exercise**
   - Follow voice coaching cues
   - Watch real-time feedback
   - Monitor form scores

4. **Review Analysis**
   - Check compensation alerts
   - Review recommendations
   - Track progress over time

### Advanced Features

#### Exercise-Specific Analysis

**Squat Analysis:**
- Depth measurement (knee angle < 90°)
- Knee tracking (valgus detection)
- Hip levelness
- Torso alignment

**Push-up Analysis:**
- Range of motion (elbow angle)
- Body alignment
- Elbow symmetry
- Core stability

#### Compensation Detection

The system detects common movement compensations:

- **Knee Valgus**: Knees caving inward
- **Hip Hiking**: Uneven hip height
- **Forward Lean**: Excessive torso angle
- **Shoulder Elevation**: Hunched shoulders
- **Asymmetric Movement**: Uneven bilateral movement

#### AI Feedback System

**Feedback Levels:**
- **Excellent**: Perfect form (90-100%)
- **Good**: Minor adjustments needed (80-89%)
- **Fair**: Form needs improvement (70-79%)
- **Poor**: Significant issues (60-69%)
- **Dangerous**: Safety concerns (<60%)

**Voice Coaching:**
- Real-time audio feedback
- Exercise-specific cues
- Safety warnings
- Motivation and encouragement

## API Reference

### Analyze Form Endpoint

**POST** `/api/ai/analyze-form`

**Request Body:**
```json
{
  "frameData": "base64_encoded_image",
  "exerciseType": "squat"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "timestamp": "2025-01-27T10:30:00Z",
    "exercise_type": "squat",
    "overall_score": 85.5,
    "form_quality": "good",
    "confidence": 0.92,
    "joint_angles": {
      "left_knee": {
        "value": 95.2,
        "confidence": 0.95,
        "is_valid": true
      }
    },
    "compensations": [
      {
        "type": "knee_valgus",
        "description": "Knees caving inward",
        "severity": "mild",
        "value": 12.5,
        "threshold": 15.0,
        "recommendation": "Push knees out over toes"
      }
    ],
    "feedback": [
      "Good depth",
      "Push knees out slightly"
    ],
    "warnings": [],
    "recommendations": [
      "Keep your chest up and core tight",
      "Push your knees out over your toes"
    ]
  }
}
```

## Configuration

### Exercise Templates

Each exercise has configurable parameters:

```python
ExerciseType.SQUAT: {
    'ideal_angles': {
        'knee_at_bottom': (85, 95),
        'hip_at_bottom': (40, 50),
        'ankle_dorsiflexion': (15, 25),
        'torso_angle': (45, 60)
    },
    'form_criteria': {
        'knee_tracking': 0.05,
        'hip_levelness': 0.03,
        'heel_contact': True,
        'knee_valgus': 10,
        'depth_threshold': 90
    },
    'safety_limits': {
        'max_knee_valgus': 20,
        'max_forward_lean': 0.3,
        'min_heel_contact': 0.8
    }
}
```

### Compensation Thresholds

```python
'knee_valgus': {
    'threshold': 15,
    'severity_levels': {
        'mild': 10,
        'moderate': 20,
        'severe': 30
    }
}
```

## Performance

### Optimization Features

- **Frame Throttling**: AI analysis limited to 2 FPS
- **Quality Filtering**: Low-confidence frames skipped
- **Adaptive Processing**: Dynamic threshold adjustment
- **Caching**: Reuse of pose detection results

### System Requirements

- **CPU**: Modern multi-core processor
- **RAM**: 4GB+ recommended
- **Camera**: 720p+ webcam
- **Browser**: Chrome/Firefox with WebRTC support

## Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Try different browser

2. **Poor Detection**
   - Improve lighting
   - Ensure full body visibility
   - Check camera positioning

3. **AI Analysis Failing**
   - Verify Python dependencies
   - Check API endpoint status
   - Review console errors

### Debug Mode

Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true')
```

## Contributing

### Adding New Exercises

1. **Define Exercise Template**
```python
ExerciseType.NEW_EXERCISE: {
    'name': 'New Exercise',
    'key_joints': ['joint1', 'joint2'],
    'ideal_angles': {...},
    'form_criteria': {...},
    'safety_limits': {...}
}
```

2. **Add Feedback Messages**
```python
'new_exercise_feedback': {
    'criteria': {
        'excellent': ['Perfect!'],
        'good': ['Good work'],
        # ...
    }
}
```

3. **Update UI Components**
- Add to exercise selection
- Update angle calculations
- Add specific feedback

### Testing

Run the test suite:
```bash
python -m pytest tests/
```

## License

This project is part of the Vibe Coach rehabilitation platform. See main project license for details.

## Support

For technical support or feature requests:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide

---

**Built with ❤️ for better fitness and rehabilitation outcomes**
