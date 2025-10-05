"use client"

import { AILiveCamera } from "@/components/ai-live-camera"
import { useState } from "react"

export default function TestCamera() {
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])

  const handleAnalysisComplete = (analysis: any) => {
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 5)) // Keep last 5 analyses
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏋️ Exercise Form Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test the AI-powered form analysis with squats and bicep curls. 
            Select your exercise and get real-time feedback on your form.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            <AILiveCamera
              onAnalysisComplete={handleAnalysisComplete}
              showExerciseSelector={true}
            />
          </div>

          {/* Analysis History */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Analysis</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysisHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No analysis data yet</p>
                ) : (
                  analysisHistory.map((analysis, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          {analysis.exerciseType} - {analysis.formScore}%
                        </span>
                        <span className="text-gray-500">
                          {new Date(analysis.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        {analysis.repCount} reps • {analysis.currentAngle}° angle
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {analysis.feedback}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Exercise Instructions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Exercise Instructions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">🏋️ Squat</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Stand with feet shoulder-width apart</li>
                    <li>• Lower down until thighs are parallel to floor</li>
                    <li>• Keep knees over toes</li>
                    <li>• Drive through heels to stand up</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">💪 Bicep Curl</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Stand with arms at sides</li>
                    <li>• Curl weights up to shoulders</li>
                    <li>• Keep elbows close to body</li>
                    <li>• Control the movement down</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">🔥 Pushup</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Start in plank position</li>
                    <li>• Lower chest to ground</li>
                    <li>• Keep body straight</li>
                    <li>• Push back up to start</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">🧘 Plank</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Hold straight body position</li>
                    <li>• Keep hips level</li>
                    <li>• Engage core muscles</li>
                    <li>• Breathe steadily</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">🦵 Lunge</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Step forward with one leg</li>
                    <li>• Lower back knee toward ground</li>
                    <li>• Keep front knee over ankle</li>
                    <li>• Push back to starting position</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">💪 Shoulder Press</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Start with weights at shoulder level</li>
                    <li>• Press straight up overhead</li>
                    <li>• Keep core engaged</li>
                    <li>• Lower with control</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Ensure good lighting for better detection</li>
                <li>• Stand 3-6 feet from camera</li>
                <li>• Keep your full body in frame</li>
                <li>• Move through full range of motion</li>
                <li>• Listen to voice coaching cues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
