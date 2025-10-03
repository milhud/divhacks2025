import Link from "next/link"

const workouts = [
  {
    id: 1,
    title: "Full Body Strength",
    duration: "45 min",
    difficulty: "Intermediate",
    exercises: 8,
    category: "Strength",
    description: "Build overall strength with compound movements",
    image: "/person-doing-strength-training-workout.jpg",
  },
  {
    id: 2,
    title: "Upper Body Focus",
    duration: "30 min",
    difficulty: "Beginner",
    exercises: 6,
    category: "Strength",
    description: "Target chest, back, shoulders, and arms",
    image: "/person-doing-upper-body-exercises.jpg",
  },
  {
    id: 3,
    title: "Lower Body Power",
    duration: "40 min",
    difficulty: "Advanced",
    exercises: 7,
    category: "Strength",
    description: "Explosive leg and glute exercises",
    image: "/person-doing-squats-and-leg-exercises.jpg",
  },
  {
    id: 4,
    title: "Core & Stability",
    duration: "25 min",
    difficulty: "Beginner",
    exercises: 5,
    category: "Core",
    description: "Strengthen your core and improve balance",
    image: "/person-doing-core-exercises-and-planks.jpg",
  },
  {
    id: 5,
    title: "HIIT Cardio Blast",
    duration: "20 min",
    difficulty: "Intermediate",
    exercises: 6,
    category: "Cardio",
    description: "High-intensity intervals for maximum burn",
    image: "/high-intensity-cardio.png",
  },
  {
    id: 6,
    title: "Mobility & Flexibility",
    duration: "30 min",
    difficulty: "Beginner",
    exercises: 8,
    category: "Mobility",
    description: "Improve range of motion and prevent injury",
    image: "/person-doing-stretching-and-mobility-exercises.jpg",
  },
]

const categories = ["All", "Strength", "Cardio", "Core", "Mobility"]

export default function WorkoutsPage() {
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
            <Link href="/workouts" className="text-sm text-foreground font-medium transition-colors">
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3">Browse Workouts</h2>
            <p className="text-lg text-muted-foreground">
              Choose a workout and upload your video for AI-powered form analysis
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  category === "All" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Workouts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={workout.image || "/placeholder.svg"}
                    alt={workout.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {workout.difficulty}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                      {workout.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{workout.exercises} exercises</span>
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
                    <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
                      Start
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
