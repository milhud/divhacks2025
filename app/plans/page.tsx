"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Avatar } from "@/components/avatar"

const workoutPlans = [
  {
    id: 1,
    title: "Beginner Weight Loss",
    duration: "4 weeks",
    difficulty: "Beginner",
    focus: "Weight Loss",
    description: "Perfect for beginners looking to lose weight and build healthy habits",
    workouts: ["Morning Cardio", "Full Body Strength", "Core & Abs", "Yoga Flow"],
    calories: "300-500 per session",
    equipment: "Bodyweight only",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  },
  {
    id: 2,
    title: "Muscle Building Program",
    duration: "8 weeks",
    difficulty: "Intermediate",
    focus: "Muscle Gain",
    description: "Structured program to build lean muscle mass and strength",
    workouts: ["Push Day", "Pull Day", "Leg Day", "Upper Body Focus"],
    calories: "400-600 per session",
    equipment: "Gym equipment recommended",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500",
  },
  {
    id: 3,
    title: "HIIT Fat Burner",
    duration: "6 weeks",
    difficulty: "Advanced",
    focus: "Fat Loss",
    description: "High-intensity program for maximum fat burning",
    workouts: ["HIIT Cardio Blast", "Full Body HIIT", "Tabata Training", "Boxing Workout"],
    calories: "500-800 per session",
    equipment: "Minimal equipment",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  },
  {
    id: 4,
    title: "Strength & Power",
    duration: "10 weeks",
    difficulty: "Advanced",
    focus: "Strength",
    description: "Build maximum strength and power with compound movements",
    workouts: ["Strength Training", "Lower Body Power", "Push Day", "Pull Day"],
    calories: "600-900 per session",
    equipment: "Full gym access",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500",
  },
  {
    id: 5,
    title: "Flexibility & Mobility",
    duration: "4 weeks",
    difficulty: "Beginner",
    focus: "Flexibility",
    description: "Improve flexibility, mobility, and reduce injury risk",
    workouts: ["Yoga Flow", "Evening Stretch", "Mobility & Flexibility", "Recovery Yoga"],
    calories: "150-300 per session",
    equipment: "Yoga mat",
    image: "https://images.unsplash.com/photo-1506629905607-1b2a0a2a5b8a?w=500",
  },
  {
    id: 6,
    title: "Quick & Effective",
    duration: "3 weeks",
    difficulty: "Intermediate",
    focus: "General Fitness",
    description: "Short, effective workouts for busy schedules",
    workouts: ["Quick Abs", "Morning Cardio", "Full Body Burn", "Core & Stability"],
    calories: "200-400 per session",
    equipment: "Bodyweight only",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  },
]

const mealPlans = [
  {
    id: 1,
    title: "Weight Loss Meal Plan",
    duration: "4 weeks",
    calories: "1200-1500",
    focus: "Weight Loss",
    description: "Balanced meals designed for sustainable weight loss",
    meals: ["High protein breakfast", "Lean lunch", "Light dinner", "Healthy snacks"],
    restrictions: "Low carb, high protein",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500",
  },
  {
    id: 2,
    title: "Muscle Building Nutrition",
    duration: "8 weeks",
    calories: "2500-3000",
    focus: "Muscle Gain",
    description: "High-calorie, protein-rich meals for muscle growth",
    meals: ["Protein-packed breakfast", "Pre-workout meal", "Post-workout shake", "Hearty dinner"],
    restrictions: "High protein, balanced macros",
    image: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=500",
  },
  {
    id: 3,
    title: "Clean Eating Plan",
    duration: "6 weeks",
    calories: "1800-2200",
    focus: "General Health",
    description: "Whole foods approach for optimal health and energy",
    meals: ["Overnight oats", "Quinoa salad", "Grilled fish", "Vegetable stir-fry"],
    restrictions: "No processed foods",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
  },
  {
    id: 4,
    title: "Plant-Based Nutrition",
    duration: "4 weeks",
    calories: "1600-2000",
    focus: "Plant-Based",
    description: "Complete nutrition from plant sources",
    meals: ["Smoothie bowl", "Buddha bowl", "Lentil curry", "Nut butter toast"],
    restrictions: "Vegan, no animal products",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
  },
]

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState("workout")
  const [showAuth, setShowAuth] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [userIssues, setUserIssues] = useState("")
  const [aiRecommendation, setAiRecommendation] = useState("")
  const { user, signOut } = useAuth()

  const generateAIRecommendation = async () => {
    if (!userIssues.trim()) return

    try {
      const response = await fetch("/api/ai/recommend-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issues: userIssues,
          userProfile: {
            experience: "Intermediate",
            goals: "General Fitness",
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiRecommendation(data.recommendation)
      } else {
        setAiRecommendation(
          "Based on your issues, I recommend starting with our Beginner Weight Loss program. Focus on building consistent habits and gradually increasing intensity. Consider adding our Clean Eating meal plan to support your goals.",
        )
      }
    } catch (error) {
      setAiRecommendation(
        "Based on your issues, I recommend starting with our Beginner Weight Loss program. Focus on building consistent habits and gradually increasing intensity. Consider adding our Clean Eating meal plan to support your goals.",
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/plans" className="text-sm text-foreground font-semibold transition-colors">
              Plans
            </Link>
            <Link href="/wearable" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-balance text-foreground">
              Your <span className="text-primary">Plans</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Personalized workout and nutrition plans based on your goals
            </p>
          </div>

          <div className="mb-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">AI-Powered Recommendations</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Tell us about your fitness challenges and we'll recommend the perfect plan for you.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">
                  What fitness challenges are you facing?
                </label>
                <textarea
                  value={userIssues}
                  onChange={(e) => setUserIssues(e.target.value)}
                  placeholder="e.g., I want to lose weight but struggle with consistency, I need help with meal planning, I want to build muscle but don't know where to start..."
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
              </div>

              <button
                onClick={generateAIRecommendation}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all hover:scale-105"
              >
                Get AI Recommendation
              </button>

              {aiRecommendation && (
                <div className="mt-4 p-6 bg-card rounded-xl border border-border">
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    AI Recommendation
                  </h4>
                  <div className="text-foreground">
                    <MarkdownRenderer content={aiRecommendation} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-8 bg-muted p-1.5 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("workout")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "workout"
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Workout Plans
            </button>
            <button
              onClick={() => setActiveTab("meal")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "meal"
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Meal Plans
            </button>
          </div>

          {activeTab === "workout" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group bg-card rounded-2xl border-2 border-border overflow-hidden hover:border-primary transition-all hover:scale-105"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={plan.image || "/placeholder.svg"}
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                      {plan.difficulty}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30">
                        {plan.focus}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">{plan.duration}</span>
                    </div>
                    <h3 className="text-xl font-black mb-2">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        {plan.calories} calories
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {plan.equipment}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold text-foreground mb-2 text-sm">Workouts included:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.workouts.map((workout, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg font-medium"
                          >
                            {workout}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all hover:scale-105"
                    >
                      Start This Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "meal" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group bg-card rounded-2xl border-2 border-border overflow-hidden hover:border-accent transition-all hover:scale-105"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={plan.image || "/placeholder.svg"}
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                      {plan.calories} cal
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-bold rounded-full border border-accent/30">
                        {plan.focus}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">{plan.duration}</span>
                    </div>
                    <h3 className="text-xl font-black mb-2">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {plan.restrictions}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold text-foreground mb-2 text-sm">Meals included:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.meals.map((meal, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg font-medium"
                          >
                            {meal}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full px-4 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl text-sm font-bold transition-all hover:scale-105"
                    >
                      Start This Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">{selectedPlan.title}</h3>
                <p className="text-sm text-muted-foreground font-semibold">
                  {selectedPlan.duration} • {selectedPlan.difficulty || selectedPlan.focus}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-bold text-foreground mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">{selectedPlan.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-foreground mb-2">Plan Details</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Duration: {selectedPlan.duration}</div>
                    <div>Calories: {selectedPlan.calories}</div>
                    <div>Equipment: {selectedPlan.equipment || "N/A"}</div>
                    <div>Restrictions: {selectedPlan.restrictions || "None"}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    {activeTab === "workout" ? "Workouts" : "Meals"} Included
                  </h4>
                  <div className="space-y-1">
                    {(selectedPlan.workouts || selectedPlan.meals).map((item: string, index: number) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all hover:scale-105">
                  Start This Plan
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
