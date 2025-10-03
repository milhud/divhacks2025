import { VideoUpload } from "@/components/video-upload"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
          </nav>
          <button className="px-4 py-2 bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors">
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              AI-Powered Form Analysis
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Perfect Your Form with <span className="text-primary">Real-Time</span> Feedback
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              Upload your workout video and get instant AI-powered analysis on your form, technique, and movement
              patterns. Train smarter, not harder.
            </p>
          </div>

          {/* Video Upload Component */}
          <VideoUpload />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced pose detection tracks your movements frame by frame
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Audio Feedback</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time voice coaching guides you through proper form
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Detailed summaries show your improvement over time
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Vibe Coach. AI-powered fitness coaching for everyone.
          </p>
        </div>
      </footer>
    </div>
  )
}
