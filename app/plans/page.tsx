"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"

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
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"
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
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500"
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
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"
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
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500"
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
    image: "https://images.unsplash.com/photo-1506629905607-1b2a0a2a5b8a?w=500"
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
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"
  }
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
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500"
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
    image: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=500"
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
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
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
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500"
  }
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
      const response = await fetch('/api/ai/recommend-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issues: userIssues,
          userProfile: {
            experience: "Intermediate",
            goals: "General Fitness"
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiRecommendation(data.recommendation)
      } else {
        setAiRecommendation("Based on your issues, I recommend starting with our Beginner Weight Loss program. Focus on building consistent habits and gradually increasing intensity. Consider adding our Clean Eating meal plan to support your goals.")
      }
    } catch (error) {
      setAiRecommendation("Based on your issues, I recommend starting with our Beginner Weight Loss program. Focus on building consistent habits and gradually increasing intensity. Consider adding our Clean Eating meal plan to support your goals.")
    }
  }

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
            <Link href="/plans" className="text-sm text-foreground font-medium transition-colors">
              Plans
            </Link>
            <Link href="/wearable" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3 text-gray-900">Workout & Meal Plans</h2>
            <p className="text-lg text-gray-600">
              Get personalized workout and nutrition plans based on your goals
            </p>
          </div>

          {/* AI Recommendation Section */}
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Recommendations</h3>
            <p className="text-gray-600 mb-6">Tell us about your fitness challenges and we'll recommend the perfect plan for you.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What fitness challenges are you facing?
                </label>
                <textarea
                  value={userIssues}
                  onChange={(e) => setUserIssues(e.target.value)}
                  placeholder="e.g., I want to lose weight but struggle with consistency, I need help with meal planning, I want to build muscle but don't know where to start..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <button
                onClick={generateAIRecommendation}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Get AI Recommendation
              </button>
              
              {aiRecommendation && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation:</h4>
                  <p className="text-gray-700">{aiRecommendation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("workout")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "workout"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Workout Plans
            </button>
            <button
              onClick={() => setActiveTab("meal")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "meal"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Meal Plans
            </button>
          </div>

          {/* Workout Plans */}
          {activeTab === "workout" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                      {plan.difficulty}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {plan.focus}
                      </span>
                      <span className="text-xs text-gray-600">{plan.duration}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{plan.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {plan.calories} calories
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {plan.equipment}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Workouts included:</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.workouts.map((workout, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {workout}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Start This Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Meal Plans */}
          {activeTab === "meal" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                      {plan.calories} cal
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {plan.focus}
                      </span>
                      <span className="text-xs text-gray-600">{plan.duration}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{plan.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {plan.restrictions}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Meals included:</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.meals.map((meal, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {meal}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
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

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.title}</h3>
                <p className="text-sm text-gray-600">{selectedPlan.duration} • {selectedPlan.difficulty || selectedPlan.focus}</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedPlan.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Plan Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Duration: {selectedPlan.duration}</div>
                    <div>Calories: {selectedPlan.calories}</div>
                    <div>Equipment: {selectedPlan.equipment || 'N/A'}</div>
                    <div>Restrictions: {selectedPlan.restrictions || 'None'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {activeTab === 'workout' ? 'Workouts' : 'Meals'} Included
                  </h4>
                  <div className="space-y-1">
                    {(selectedPlan.workouts || selectedPlan.meals).map((item: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600">• {item}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Start This Plan
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
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
