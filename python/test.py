
"""
================================================================================
VIBE COACH TESTING SUITE - COMPREHENSIVE MOVEMENT ANALYSIS TESTING
================================================================================

This script tests the complete Vibe Coach rehabilitation platform functionality,
including video processing and live camera feed analysis.

REQUIREMENTS:
- Python 3.8+
- OpenCV
- MediaPipe
- NumPy

USAGE:
python test_vibe_coach.py
================================================================================
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import base64
import time
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import threading
import queue

# Import the modules (ensure they're in the same directory or in Python path)
try:
    from video_processor import VideoProcessor
    from live_analysis import LiveMovementAnalyzer
except ImportError:
    print("Error: Could not import required modules.")
    print("Make sure video_processor.py and live_analysis.py are in the same directory.")
    sys.exit(1)

class VibeCoachTester:
    """Main testing class for Vibe Coach rehabilitation platform"""
    
    def __init__(self):
        self.video_processor = VideoProcessor()
        self.live_analyzer = LiveMovementAnalyzer()
        self.recording = False
        self.recorded_frames = []
        self.analysis_results = []
        
    def print_header(self, text: str):
        """Print a formatted header"""
        print("\n" + "="*80)
        print(f" {text}")
        print("="*80)
        
    def print_section(self, text: str):
        """Print a formatted section header"""
        print(f"\n--- {text} ---")
        
    def test_video_processing(self):
        """Test video file processing"""
        self.print_header("VIDEO PROCESSING TEST")
        
        print("\nThis test will process a pre-recorded workout video.")
        print("The system will analyze:")
        print("  • Pose detection and tracking")
        print("  • Movement quality and form")
        print("  • Range of motion")
        print("  • Exercise repetition counting")
        print("  • Compensation pattern detection")
        
        video_path = input("\nEnter the path to your video file (or 'skip' to skip): ").strip()
        
        if video_path.lower() == 'skip':
            print("Skipping video processing test.")
            return None
            
        if not os.path.exists(video_path):
            print(f"❌ Error: File not found: {video_path}")
            return None
            
        print(f"\n📹 Processing video: {video_path}")
        print("This may take a moment...\n")
        
        # Process the video
        start_time = time.time()
        result = self.video_processor.process_video(video_path)
        processing_time = time.time() - start_time
        
        if result['success']:
            self.print_section("VIDEO ANALYSIS RESULTS")
            
            # Video info
            video_info = result['video_info']
            print(f"\n📊 Video Information:")
            print(f"  • Duration: {video_info['duration']:.1f} seconds")
            print(f"  • Frame rate: {video_info['fps']:.1f} FPS")
            print(f"  • Resolution: {video_info['resolution']['width']}x{video_info['resolution']['height']}")
            print(f"  • Frames processed: {video_info['processed_frames']}")
            
            # Pose analysis
            pose_analysis = result['pose_analysis']
            print(f"\n💪 Movement Analysis:")
            print(f"  • Form Score: {pose_analysis['form_score']}%")
            print(f"  • Repetitions Detected: {pose_analysis['rep_count']}")
            print(f"  • Detection Confidence: {pose_analysis['overall_visibility']:.1%}")
            
            # Posture analysis
            if 'posture_analysis' in pose_analysis:
                posture = pose_analysis['posture_analysis']
                print(f"\n🧘 Posture Analysis:")
                print(f"  • Back Alignment: {posture['back_alignment']:.1%}")
                print(f"  • Symmetry: {posture['symmetry']:.1%}")
                print(f"  • Stability: {posture['stability']:.1%}")
            
            # Joint angles
            if 'joint_angles' in pose_analysis and pose_analysis['joint_angles']:
                print(f"\n📐 Joint Angles (last frame):")
                for joint, angle in pose_analysis['joint_angles'].items():
                    print(f"  • {joint.replace('_', ' ').title()}: {angle:.1f}°")
            
            # Feedback
            print(f"\n💬 Feedback:")
            print(f"  {pose_analysis['feedback']}")
            
            print(f"\n⏱️ Processing completed in {processing_time:.1f} seconds")
            
            # Save results option
            save = input("\nSave results to file? (y/n): ").strip().lower()
            if save == 'y':
                filename = f"video_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(filename, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"✅ Results saved to {filename}")
                
            return result
        else:
            print(f"❌ Error processing video: {result['error']}")
            return None
    
    def test_live_camera(self):
        """Test live camera feed analysis"""
        self.print_header("LIVE CAMERA ANALYSIS TEST")
        
        print("\nThis test will analyze your movements in real-time using your camera.")
        print("The system will provide:")
        print("  • Real-time pose detection")
        print("  • Movement quality assessment")
        print("  • Compensation pattern detection")
        print("  • Pain indicator assessment")
        print("  • Live feedback and recommendations")
        
        print("\n📸 Camera Controls:")
        print("  • Press 'q' to quit")
        print("  • Press 'r' to start/stop recording")
        print("  • Press 's' to take a snapshot")
        print("  • Press 'e' to change exercise type")
        print("  • Press 'h' to show/hide skeleton overlay")
        
        input("\nPress Enter to start the camera (ensure good lighting)...")
        
        # Open camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Error: Could not open camera")
            return None
            
        # Set camera properties for better quality
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # MediaPipe setup for visualization
        mp_pose = mp.solutions.pose
        mp_drawing = mp.solutions.drawing_utils
        pose = mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Variables
        exercise_types = ['general', 'squat', 'lunge', 'push_up']
        current_exercise_idx = 0
        show_skeleton = True
        frame_count = 0
        analysis_interval = 60  # Analyze every 2 seconds at 30 FPS
        last_analysis_time = time.time()
        
        print("\n🎥 Camera started. Press 'q' to quit.\n")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to read frame")
                    break
                
                frame_count += 1
                current_time = time.time()
                
                # Convert to RGB for processing
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Pose detection for visualization
                results = pose.process(rgb_frame)
                
                # Draw skeleton if enabled
                if show_skeleton and results.pose_landmarks:
                    mp_drawing.draw_landmarks(
                        frame, 
                        results.pose_landmarks, 
                        mp_pose.POSE_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                    )
                
                # Perform detailed analysis every 2 seconds
                if current_time - last_analysis_time >= 2.0:
                    exercise_type = exercise_types[current_exercise_idx]
                    
                    # Analyze frame
                    analysis = self.live_analyzer.analyze_frame(rgb_frame, exercise_type)
                    self.analysis_results.append(analysis)
                    
                    # Display analysis results
                    self.display_live_analysis(frame, analysis, exercise_type)
                    
                    last_analysis_time = current_time
                
                # Display info on frame
                cv2.putText(frame, f"Exercise: {exercise_types[current_exercise_idx]}", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(frame, f"Frame: {frame_count}", 
                           (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                if self.recording:
                    cv2.putText(frame, "RECORDING", 
                               (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    self.recorded_frames.append(frame.copy())
                
                # Display the frame
                cv2.imshow('Vibe Coach - Live Analysis', frame)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    break
                elif key == ord('r'):
                    self.recording = not self.recording
                    if self.recording:
                        print("🔴 Recording started...")
                        self.recorded_frames = []
                    else:
                        print(f"⏹️ Recording stopped. {len(self.recorded_frames)} frames captured.")
                        self.save_recording()
                elif key == ord('s'):
                    snapshot_name = f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                    cv2.imwrite(snapshot_name, frame)
                    print(f"📷 Snapshot saved: {snapshot_name}")
                elif key == ord('e'):
                    current_exercise_idx = (current_exercise_idx + 1) % len(exercise_types)
                    print(f"🏋️ Exercise changed to: {exercise_types[current_exercise_idx]}")
                elif key == ord('h'):
                    show_skeleton = not show_skeleton
                    print(f"🦴 Skeleton overlay: {'ON' if show_skeleton else 'OFF'}")
                    
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
            
        finally:
            cap.release()
            cv2.destroyAllWindows()
            pose.close()
            
        # Summary of session
        if self.analysis_results:
            self.print_live_session_summary()
    
    def display_live_analysis(self, frame: np.ndarray, analysis: Dict[str, Any], exercise_type: str):
        """Display live analysis results on console"""
        print(f"\n⚡ LIVE ANALYSIS - {exercise_type.upper()} - {analysis['timestamp']}")
        print(f"  Form Score: {analysis['form_score']}%")
        print(f"  ROM: {analysis['range_of_motion']}%")
        print(f"  Stability: {analysis['stability_score']}%")
        
        if analysis['compensations']:
            print("  ⚠️ Compensations detected:")
            for comp in analysis['compensations'][:2]:  # Show max 2
                print(f"    • {comp.get('compensation_type', 'Unknown')}: {comp.get('severity', 'N/A')}")
        
        if analysis['pain_indicators']:
            print("  🔴 Pain indicators:")
            for indicator in analysis['pain_indicators'][:2]:  # Show max 2
                print(f"    • {indicator.get('type', 'Unknown')}: {indicator.get('description', 'N/A')}")
        
        print(f"  💬 {analysis['feedback']}")
    
    def save_recording(self):
        """Save recorded frames as video"""
        if not self.recorded_frames:
            return
            
        filename = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}.avi"
        height, width = self.recorded_frames[0].shape[:2]
        
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(filename, fourcc, 30.0, (width, height))
        
        for frame in self.recorded_frames:
            out.write(frame)
            
        out.release()
        print(f"✅ Recording saved: {filename}")
    
    def print_live_session_summary(self):
        """Print summary of live analysis session"""
        self.print_section("SESSION SUMMARY")
        
        # Calculate averages
        avg_form = np.mean([a['form_score'] for a in self.analysis_results])
        avg_rom = np.mean([a['range_of_motion'] for a in self.analysis_results])
        avg_stability = np.mean([a['stability_score'] for a in self.analysis_results])
        
        print(f"\n📊 Average Scores:")
        print(f"  • Form Score: {avg_form:.1f}%")
        print(f"  • Range of Motion: {avg_rom:.1f}%")
        print(f"  • Stability: {avg_stability:.1f}%")
        
        # Count compensations
        all_compensations = []
        for analysis in self.analysis_results:
            all_compensations.extend(analysis['compensations'])
        
        if all_compensations:
            print(f"\n⚠️ Total Compensations Detected: {len(all_compensations)}")
            comp_types = {}
            for comp in all_compensations:
                comp_type = comp.get('compensation_type', 'Unknown')
                comp_types[comp_type] = comp_types.get(comp_type, 0) + 1
            
            for comp_type, count in comp_types.items():
                print(f"  • {comp_type}: {count} occurrences")
        
        # Save session data
        save = input("\nSave session data? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"live_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            session_data = {
                'timestamp': datetime.now().isoformat(),
                'total_analyses': len(self.analysis_results),
                'average_scores': {
                    'form': avg_form,
                    'rom': avg_rom,
                    'stability': avg_stability
                },
                'analyses': self.analysis_results
            }
            with open(filename, 'w') as f:
                json.dump(session_data, f, indent=2)
            print(f"✅ Session data saved to {filename}")
    
    def test_frame_processing(self):
        """Test single frame processing with base64 encoding/decoding"""
        self.print_header("FRAME PROCESSING TEST")
        
        print("\nThis test will capture a single frame and process it through the full pipeline.")
        print("This simulates how the Next.js frontend would send frames to the backend.")
        
        input("\nPress Enter to capture a test frame...")
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Error: Could not open camera")
            return None
        
        # Capture frame
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            print("❌ Error: Could not capture frame")
            return None
        
        print("✅ Frame captured successfully")
        
        # Encode frame as JPEG and then base64 (simulating frontend)
        print("\n🔄 Encoding frame to base64...")
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        print(f"  • Original frame size: {frame.shape}")
        print(f"  • JPEG buffer size: {len(buffer)} bytes")
        print(f"  • Base64 string length: {len(frame_base64)} characters")
        
        # Process through the pipeline
        print("\n🔄 Processing frame through analysis pipeline...")
        
        # Decode and analyze (simulating backend)
        image_bytes = base64.b64decode(frame_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        decoded_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert BGR to RGB for analysis
        rgb_frame = cv2.cvtColor(decoded_frame, cv2.COLOR_BGR2RGB)
        
        # Analyze
        start_time = time.time()
        analysis = self.live_analyzer.analyze_frame(rgb_frame, 'general')
        processing_time = (time.time() - start_time) * 1000
        
        print(f"\n✅ Frame processed in {processing_time:.1f}ms")
        
        # Display results
        self.print_section("FRAME ANALYSIS RESULTS")
        print(f"\n📊 Scores:")
        print(f"  • Form Score: {analysis['form_score']}%")
        print(f"  • Range of Motion: {analysis['range_of_motion']}%")
        print(f"  • Stability: {analysis['stability_score']}%")
        print(f"  • Confidence: {analysis['confidence']:.1%}")
        
        if analysis['keypoints']:
            print(f"\n🦴 Keypoints Detected: {len(analysis['keypoints'])}")
        
        print(f"\n💬 Feedback: {analysis['feedback']}")
        
        # Display the frame with results
        cv2.putText(decoded_frame, f"Form: {analysis['form_score']}%", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(decoded_frame, f"ROM: {analysis['range_of_motion']}%", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(decoded_frame, f"Stability: {analysis['stability_score']}%", 
                   (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        cv2.imshow('Processed Frame', decoded_frame)
        print("\n👁️ Displaying processed frame. Press any key to continue...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        
        return analysis
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.print_header("VIBE COACH COMPREHENSIVE TESTING SUITE")
        
        print("\nWelcome to the Vibe Coach testing suite!")
        print("This will test all components of the rehabilitation platform.\n")
        
        print("Available tests:")
        print("1. Video Processing Test - Analyze pre-recorded workout videos")
        print("2. Live Camera Test - Real-time movement analysis")
        print("3. Frame Processing Test - Single frame pipeline test")
        print("4. Run All Tests")
        print("5. Exit")
        
        while True:
            choice = input("\nSelect test to run (1-5): ").strip()
            
            if choice == '1':
                self.test_video_processing()
            elif choice == '2':
                self.test_live_camera()
            elif choice == '3':
                self.test_frame_processing()
            elif choice == '4':
                print("\n🚀 Running all tests...")
                self.test_frame_processing()
                self.test_video_processing()
                self.test_live_camera()
                print("\n✅ All tests completed!")
            elif choice == '5':
                print("\nExiting testing suite. Goodbye!")
                break
            else:
                print("Invalid choice. Please select 1-5.")
        
        self.print_header("TESTING COMPLETE")
        print("\nThank you for testing Vibe Coach!")
        print("Check the generated files for detailed analysis results.")


def check_dependencies():
    """Check if all required dependencies are installed"""
    print("Checking dependencies...")
    
    dependencies_ok = True
    
    # Check OpenCV
    try:
        import cv2
        print("✅ OpenCV installed")
    except ImportError:
        print("❌ OpenCV not installed. Run: pip install opencv-python")
        dependencies_ok = False
    
    # Check MediaPipe
    try:
        import mediapipe
        print("✅ MediaPipe installed")
    except ImportError:
        print("❌ MediaPipe not installed. Run: pip install mediapipe")
        dependencies_ok = False
    
    # Check NumPy
    try:
        import numpy
        print("✅ NumPy installed")
    except ImportError:
        print("❌ NumPy not installed. Run: pip install numpy")
        dependencies_ok = False
    
    return dependencies_ok


def main():
    """Main entry point"""
    print("="*80)
    print(" VIBE COACH TESTING SUITE")
    print("="*80)
    
    # Check dependencies
    if not check_dependencies():
        print("\n⚠️ Please install missing dependencies before running tests.")
        print("\nRun: pip install opencv-python mediapipe numpy")
        sys.exit(1)
    
    print("\n✅ All dependencies satisfied!\n")
    
    # Check if required modules exist
    if not os.path.exists('video_processor.py'):
        print("⚠️ Warning: video_processor.py not found in current directory")
    if not os.path.exists('live_analysis.py'):
        print("⚠️ Warning: live_analysis.py not found in current directory")
    
    # Create and run tester
    tester = VibeCoachTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()