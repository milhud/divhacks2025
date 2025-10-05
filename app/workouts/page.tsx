"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { Header } from "@/components/header"

// Massive dictionary of workouts with YouTube videos
const workouts = [
  {
    id: 1,
    title: "Full Body Strength",
    duration: "45 min",
    difficulty: "Intermediate",
    exercises: 8,
    tags: ["Strength", "Full Body"],
    description: "Build overall strength with compound movements",
    youtubeUrl: "https://www.youtube.com/embed/R6gZoAzAhCg",
    videoId: "R6gZoAzAhCg"
  },
  {
    id: 2,
    title: "Upper Body Push",
    duration: "30 min",
    difficulty: "Beginner",
    exercises: 6,
    tags: ["Strength", "Upper Body"],
    description: "Target chest, shoulders, and triceps",
    youtubeUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
    videoId: "IODxDxX7oi4"
  },
  {
    id: 3,
    title: "Lower Body Power",
    duration: "40 min",
    difficulty: "Advanced",
    exercises: 7,
    tags: ["Strength", "Lower Body"],
    description: "Explosive leg and glute exercises",
    youtubeUrl: "https://www.youtube.com/watch?v=Zy1pPXpjiIU",
    videoId: "Zy1pPXpjiIU"
  },
  {
    id: 4,
    title: "Core & Abs Workout",
    duration: "25 min",
    difficulty: "Beginner",
    exercises: 5,
    tags: ["Core", "Abs"],
    description: "Strengthen your core and improve balance",
    youtubeUrl: "https://www.youtube.com/embed/DHD1-2P94DI",
    videoId: "DHD1-2P94DI"
  },
  {
    id: 5,
    title: "HIIT Cardio Blast",
    duration: "20 min",
    difficulty: "Intermediate",
    exercises: 6,
    tags: ["Cardio", "HIIT"],
    description: "High-intensity intervals for maximum burn",
    youtubeUrl: "https://www.youtube.com/embed/ml6cT4AZdqI",
    videoId: "ml6cT4AZdqI"
  },
  {
    id: 6,
    title: "Yoga Flow",
    duration: "30 min",
    difficulty: "Beginner",
    exercises: 8,
    tags: ["Mobility", "Flexibility"],
    description: "Improve flexibility and reduce stress",
    youtubeUrl: "https://www.youtube.com/embed/v7AYKMP6rOE",
    videoId: "v7AYKMP6rOE"
  },
  {
    id: 7,
    title: "Chest & Triceps",
    duration: "35 min",
    difficulty: "Intermediate",
    exercises: 7,
    tags: ["Strength", "Upper Body"],
    description: "Build a powerful chest and strong triceps",
    youtubeUrl: "https://www.youtube.com/embed/ExfFozZMheI",
    videoId: "ExfFozZMheI"
  },
  {
    id: 8,
    title: "Back & Biceps",
    duration: "35 min",
    difficulty: "Intermediate",
    exercises: 7,
    tags: ["Strength", "Upper Body"],
    description: "Build a strong back and bigger biceps",
    youtubeUrl: "https://www.youtube.com/embed/N3Z1nvNduos",
    videoId: "N3Z1nvNduos"
  },
  {
    id: 9,
    title: "Leg Day",
    duration: "45 min",
    difficulty: "Advanced",
    exercises: 8,
    tags: ["Strength", "Lower Body"],
    description: "Complete leg workout for mass and strength",
    youtubeUrl: "https://www.youtube.com/embed/j5VPV_f03O4",
    videoId: "j5VPV_f03O4"
  },
  {
    id: 10,
    title: "Shoulders & Arms",
    duration: "30 min",
    difficulty: "Beginner",
    exercises: 6,
    tags: ["Strength", "Upper Body"],
    description: "Sculpt your shoulders and arms",
    youtubeUrl: "https://www.youtube.com/embed/3VcFR6rcsd4",
    videoId: "3VcFR6rcsd4"
  },
  {
    id: 11,
    title: "Fat Burning Cardio",
    duration: "25 min",
    difficulty: "Intermediate",
    exercises: 8,
    tags: ["Cardio", "Fat Burn"],
    description: "Burn calories with cardio exercises",
    youtubeUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8",
    videoId: "gC_L9qAHVJ8"
  },
  {
    id: 12,
    title: "Pilates Core",
    duration: "30 min",
    difficulty: "Beginner",
    exercises: 6,
    tags: ["Core", "Pilates"],
    description: "Pilates-inspired core strengthening",
    youtubeUrl: "https://www.youtube.com/embed/6JhwhFQeTP0",
    videoId: "6JhwhFQeTP0"
  },
  {
    id: 13,
    title: "Morning Stretch",
    duration: "15 min",
    difficulty: "Beginner",
    exercises: 5,
    tags: ["Mobility", "Flexibility"],
    description: "Gentle stretches to start your day",
    youtubeUrl: "https://www.youtube.com/embed/g_tea8ZNk5A",
    videoId: "g_tea8ZNk5A"
  },
  {
    id: 14,
    title: "Tabata Training",
    duration: "20 min",
    difficulty: "Advanced",
    exercises: 8,
    tags: ["Cardio", "HIIT"],
    description: "Intense Tabata intervals",
    youtubeUrl: "https://www.youtube.com/embed/20xhTMY2Hv0",
    videoId: "20xhTMY2Hv0"
  },
  {
    id: 15,
    title: "Glutes & Hamstrings",
    duration: "30 min",
    difficulty: "Intermediate",
    exercises: 6,
    tags: ["Strength", "Lower Body"],
    description: "Target your posterior chain",
    youtubeUrl: "https://www.youtube.com/embed/B4MvP3z7GC4",
    videoId: "B4MvP3z7GC4"
  }
]

// Extract all unique tags
const allTags = ["All", ...Array.from(new Set(workouts.flatMap(w => w.tags))).sort()]

export default function WorkoutsPage() {
  const [selectedTag, setSelectedTag] = useState("All")
  const [activeWorkout, setActiveWorkout] = useState<typeof workouts[0] | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const { user, signOut } = useAuth()

  const filteredWorkouts = selectedTag === "All" 
    ? workouts 
    : workouts.filter(w => w.tags.includes(selectedTag))

  const handleStart = (workout: typeof workouts[0]) => {
    setActiveWorkout(workout)
  }

  const handleClose = () => {
    setActiveWorkout(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="workouts" onShowAuth={() => setShowAuth(true)} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3">Browse Workouts</h2>
            <p className="text-lg text-muted-foreground">
              Choose a workout and start following along with the video
            </p>
          </div>

          {/* Tag Filter */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tag === selectedTag 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card hover:bg-muted text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Workouts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${workout.videoId}/maxresdefault.jpg`}
                    alt={workout.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {workout.difficulty}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {workout.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{workout.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{workout.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {workout.duration}
                    </div>
                    <button 
                      onClick={() => handleStart(workout)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Workout Video Modal */}
      {activeWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{activeWorkout.title}</h3>
                <p className="text-sm text-gray-600">{activeWorkout.duration} • {activeWorkout.difficulty}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={`${activeWorkout.youtubeUrl}?autoplay=1`}
                  title={activeWorkout.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About This Workout</h4>
                  <p className="text-gray-600">{activeWorkout.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {activeWorkout.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {activeWorkout.exercises} exercises
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {activeWorkout.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Vibe Coach. AI-powered fitness coaching for everyone.
          </p>
        </div>
      </footer>

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