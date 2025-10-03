"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"

const supportedDevices = [
  {
    id: 'apple_watch',
    name: 'Apple Watch',
    description: 'Import data from Apple Health app',
    icon: '🍎',
    instructions: [
      'Open Apple Health app on your iPhone',
      'Tap your profile picture in the top right',
      'Scroll down and tap "Export All Health Data"',
      'Choose "Export" and save the file',
      'Upload the exported file here'
    ],
    fileTypes: ['.zip', '.json']
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Import data from Fitbit dashboard',
    icon: '⌚',
    instructions: [
      'Go to fitbit.com and sign in',
      'Click on your profile picture',
      'Go to Settings > Data Export',
      'Request your data export',
      'Download the CSV file when ready',
      'Upload the CSV file here'
    ],
    fileTypes: ['.csv', '.json']
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Import data from Garmin Connect',
    icon: '🏃',
    instructions: [
      'Go to connect.garmin.com and sign in',
      'Click on your profile picture',
      'Go to Settings > Privacy',
      'Scroll down to "Export Your Data"',
      'Request your data export',
      'Download and upload the CSV file here'
    ],
    fileTypes: ['.csv', '.json']
  },
  {
    id: 'samsung',
    name: 'Samsung Health',
    description: 'Import data from Samsung Health app',
    icon: '📱',
    instructions: [
      'Open Samsung Health app',
      'Tap the three dots menu',
      'Go to Settings > Download personal data',
      'Request your data export',
      'Download the file when ready',
      'Upload the file here'
    ],
    fileTypes: ['.csv', '.json']
  },
  {
    id: 'google_fit',
    name: 'Google Fit',
    description: 'Import data from Google Fit',
    icon: '📊',
    instructions: [
      'Go to myaccount.google.com',
      'Click on "Data & Privacy"',
      'Scroll down to "Download your data"',
      'Select Google Fit data',
      'Choose your export format',
      'Download and upload the file here'
    ],
    fileTypes: ['.csv', '.json', '.zip']
  }
]

export default function WearablePage() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const { user, signOut } = useAuth()

  const handleFileUpload = async () => {
    if (!uploadedFile || !selectedDevice || !user) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('deviceType', selectedDevice)
      formData.append('userId', user.id)

      const response = await fetch('/api/wearable/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setUploadResult(result)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult({
        success: false,
        error: 'Failed to process wearable data. Please try again.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const selectedDeviceInfo = supportedDevices.find(d => d.id === selectedDevice)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">V</span>
            </div>
            <h1 className="text-2xl font-bold text-balance">
              Vibe <span className="text-primary">Coach</span>
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/workouts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Workouts
            </Link>
            <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Progress
            </Link>
            <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Plans
            </Link>
            <Link href="/wearable" className="text-sm text-foreground font-medium transition-colors">
              Wearable
            </Link>
          </nav>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                Profile
              </Link>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3 text-gray-900">Wearable Device Integration</h2>
            <p className="text-lg text-gray-600">
              Connect your fitness tracker to get personalized workout recommendations
            </p>
          </div>

          {/* Device Selection */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Select Your Device</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedDevice === device.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-3">{device.icon}</div>
                  <h4 className="text-lg font-semibold mb-2">{device.name}</h4>
                  <p className="text-sm text-gray-600">{device.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          {selectedDevice && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Upload Your {selectedDeviceInfo?.name} Data
              </h3>

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">How to export your data:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  {selectedDeviceInfo?.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select your data file
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept={selectedDeviceInfo?.fileTypes.join(',')}
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={!uploadedFile || isUploading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    {isUploading ? 'Processing...' : 'Upload & Analyze'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: {selectedDeviceInfo?.fileTypes.join(', ')}
                </p>
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className={`p-4 rounded-lg ${
                  uploadResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {uploadResult.success ? (
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">✅ Data processed successfully!</h4>
                      <div className="text-green-800">
                        <p className="mb-2">Key Insights:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {uploadResult.summary?.key_insights?.map((insight: string, index: number) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">❌ Upload failed</h4>
                      <p className="text-red-800">{uploadResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Why Connect Your Wearable?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Personalized Plans</h4>
                <p className="text-sm text-gray-600">Get workout recommendations based on your actual activity data</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Monitor your fitness progress with detailed analytics</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart Insights</h4>
                <p className="text-sm text-gray-600">AI-powered analysis of your health and fitness patterns</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative my-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg z-10 text-gray-600 text-2xl"
            >
              ×
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
}
