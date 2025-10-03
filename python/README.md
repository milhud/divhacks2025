# Python Video Processing Pipeline

This Python script processes workout videos and returns pose analysis data for the Vibe Coach application.

## 🚀 Quick Setup

1. **Run the setup script**:
   ```bash
   setup-python.bat
   ```

2. **Test the pipeline**:
   ```bash
   python python/video_processor.py path/to/your/video.mp4
   ```

## 📋 Input/Output Format

### Input
- **Video file path** (string): Path to the workout video file
- **Supported formats**: MP4, AVI, MOV, WebM

### Output
```json
{
  "success": true,
  "video_info": {
    "fps": 30,
    "total_frames": 900,
    "duration": 30.0,
    "processed_frames": 900
  },
  "pose_analysis": {
    "form_score": 85,
    "rep_count": 12,
    "overall_confidence": 0.89,
    "feedback": "Great workout! Your form looks solid...",
    "keypoints": [
      {
        "name": "nose",
        "x": 0.5,
        "y": 0.2,
        "confidence": 0.95
      }
      // ... more keypoints
    ]
  },
  "raw_data": [
    {
      "frame_number": 0,
      "timestamp": 0.0,
      "keypoints": [...]
    }
    // ... frame data
  ]
}
```

## 🔧 Integration Points

### 1. Replace Mock Keypoints
**File**: `video_processor.py` → `generate_mock_keypoints()`

Replace this function with your actual pose detection:

```python
def generate_mock_keypoints(self, frame_number: int) -> List[Dict[str, Any]]:
    # Replace with MediaPipe, OpenPose, or your preferred model
    # Example with MediaPipe:
    import mediapipe as mp
    
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose()
    
    # Process frame and return keypoints
    results = pose.process(frame)
    # Convert to our format...
```

### 2. Add Real Pose Detection
**File**: `video_processor.py` → `process_frame()`

```python
def process_frame(self, frame: np.ndarray, frame_number: int, fps: float) -> List[Dict[str, Any]]:
    # Add your pose detection model here
    # MediaPipe, OpenPose, MoveNet, etc.
    pass
```

### 3. Customize Analysis
**File**: `video_processor.py` → `analyze_pose_data()`

Modify the analysis logic for your specific needs:

```python
def analyze_pose_data(self) -> Dict[str, Any]:
    # Add your custom analysis logic
    # Form scoring, rep counting, etc.
    pass
```

## 🎯 Expected Keypoints

The system expects these keypoint names:

- `nose`
- `left_shoulder`, `right_shoulder`
- `left_elbow`, `right_elbow`
- `left_wrist`, `right_wrist`
- `left_hip`, `right_hip`
- `left_knee`, `right_knee`
- `left_ankle`, `right_ankle`

Each keypoint should have:
- `name`: String identifier
- `x`: Normalized x coordinate (0-1)
- `y`: Normalized y coordinate (0-1)
- `confidence`: Detection confidence (0-1)

## 🔌 API Integration

The Python script is called by the Next.js API at `/api/python/analyze`:

1. **Input**: Video URL and session ID
2. **Process**: Download video → Run Python script → Get results
3. **Output**: Pose analysis data for the frontend

## 🛠️ Dependencies

- `opencv-python`: Video processing
- `numpy`: Array operations
- `scipy`: Signal processing for rep counting

## 📝 Adding Your AI Model

1. **Install your model**:
   ```bash
   pip install mediapipe  # or your preferred library
   ```

2. **Replace mock functions** with real implementations

3. **Test with sample videos** to ensure output format matches

4. **Deploy** - the Next.js API will automatically use your changes

## 🚨 Error Handling

The script handles errors gracefully:
- Invalid video files
- Processing failures
- Missing dependencies

All errors are returned in the JSON response with `success: false`.

## 📊 Performance

- **Processing time**: ~2-3x video duration
- **Memory usage**: Depends on video resolution
- **Output size**: ~1-5MB per video (JSON)

## 🔄 Next Steps

1. Replace mock keypoints with real pose detection
2. Add exercise-specific analysis
3. Implement real-time processing
4. Add more sophisticated rep counting
5. Integrate with your preferred AI models

**Happy coding! 🏋️‍♀️💪**
