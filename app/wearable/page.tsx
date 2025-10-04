"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { Avatar } from "@/components/avatar"
import { supportedDevices } from "@/lib/supported-devices" // Import supportedDevices

// ... existing supportedDevices array ...

export default function WearablePage() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const { user, signOut } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadedFile(event.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    // Simulate upload process
    const result = {
      success: true,
      summary: {
        key_insights: ["Insight 1", "Insight 2", "Insight 3"],
      },
    }
    setUploadResult(result)
    setIsUploading(false)
  }

  const selectedDeviceInfo = supportedDevices.find((d) => d.id === selectedDevice)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Spottr</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
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
            <Link href="/wearable" className="text-sm text-foreground font-semibold transition-colors">
              Wearable
            </Link>
          </nav>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar name={user?.user_metadata?.full_name || user?.email || "User"} size="sm" />
                <span className="text-sm text-muted-foreground hover:text-foreground hidden lg:block">Profile</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-balance text-foreground">
              Connect Your <span className="text-primary">Device</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Sync your fitness tracker for personalized insights and recommendations
            </p>
          </div>

          {/* Device Selection */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Select Your Device</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`group p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedDevice === device.id
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border bg-card hover:border-primary/50 hover:scale-105"
                  }`}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{device.icon}</div>
                  <h4 className="text-lg font-bold mb-2">{device.name}</h4>
                  <p className="text-sm text-muted-foreground">{device.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          {selectedDevice && (
            <div className="bg-card rounded-2xl border border-border p-8 mb-12">
              <h3 className="text-3xl font-bold mb-6">Upload Your {selectedDeviceInfo?.name} Data</h3>

              {/* Instructions */}
              <div className="mb-8 p-6 bg-muted/50 rounded-xl">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  How to export your data
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  {selectedDeviceInfo?.instructions.map((instruction, index) => (
                    <li key={index} className="leading-relaxed">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-3">Select your data file</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <input
                    type="file"
                    accept={selectedDeviceInfo?.fileTypes.join(",")}
                    onChange={handleFileSelect}
                    className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 file:transition-all file:cursor-pointer"
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={!uploadedFile || isUploading}
                    className="px-8 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-xl font-semibold transition-all hover:scale-105 disabled:hover:scale-100 whitespace-nowrap"
                  >
                    {isUploading ? "Processing..." : "Upload & Analyze"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Supported formats: {selectedDeviceInfo?.fileTypes.join(", ")}
                </p>
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    uploadResult.success ? "bg-secondary/10 border-secondary" : "bg-destructive/10 border-destructive"
                  }`}
                >
                  {uploadResult.success ? (
                    <div>
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Data processed successfully!
                      </h4>
                      <div className="text-foreground">
                        <p className="mb-3 font-semibold">Key Insights:</p>
                        <ul className="list-disc list-inside space-y-2">
                          {uploadResult.summary?.key_insights?.map((insight: string, index: number) => (
                            <li key={index} className="text-muted-foreground">
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Upload failed
                      </h4>
                      <p className="text-muted-foreground">{uploadResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-3xl font-bold mb-8 text-center">Why Connect Your Wearable?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Personalized Plans</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get workout recommendations based on your actual activity data
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Progress Tracking</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor your fitness progress with detailed analytics
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Smart Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI-powered analysis of your health and fitness patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative my-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-xl z-10 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
}
