"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Avatar } from "@/components/avatar"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    fitness_level: "",
    goals: "",
    bio: "",
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    // Create mock profile function
    const createMockProfile = () => {
      // Try to load from localStorage first
      const savedProfile = localStorage.getItem(`profile_${user?.id}`)
      let mockProfile

      if (savedProfile) {
        try {
          mockProfile = JSON.parse(savedProfile)
        } catch (e) {
          mockProfile = null
        }
      }

      if (!mockProfile) {
        mockProfile = {
          id: user?.id,
          full_name: user?.user_metadata?.full_name || user?.email || "User",
          age: "",
          height_cm: "",
          weight_kg: "",
          fitness_level: "",
          goals: "",
          bio: "",
        }
      }

      setProfile(mockProfile)
      setFormData({
        full_name: mockProfile.full_name,
        age: mockProfile.age,
        height_cm: mockProfile.height_cm,
        weight_kg: mockProfile.weight_kg,
        fitness_level: mockProfile.fitness_level,
        goals: mockProfile.goals,
        bio: mockProfile.bio,
      })
      setLoading(false)
    }

    try {
      // Check if Supabase is configured and user exists
      if (!supabase || !user?.id) {
        console.log("Supabase not configured or no user, using mock profile")
        createMockProfile()
        return
      }

      // Try to fetch profile with timeout
      const profilePromise = supabase.from("profiles").select("*").eq("id", user.id).single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000),
      )

      const { data, error } = (await Promise.race([profilePromise, timeoutPromise])) as any

      if (error) {
        console.log("Profile fetch error, using mock profile:", error.message || "Unknown error")
        createMockProfile()
        return
      }

      if (data) {
        setProfile(data)
        setFormData({
          full_name: data?.full_name || "",
          age: data?.age || "",
          height_cm: data?.height_cm || "",
          weight_kg: data?.weight_kg || "",
          fitness_level: data?.fitness_level || "",
          goals: data?.goals || "",
          bio: data?.bio || "",
        })
      } else {
        console.log("No profile data found, using mock profile")
        createMockProfile()
      }
    } catch (error) {
      console.log("Unexpected error, using mock profile:", error)
      createMockProfile()
    }
  }

  const handleSave = async () => {
    try {
      const updatedProfile = { ...profile, ...formData }

      // Always save to localStorage as backup
      if (user?.id) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile))
      }

      // If Supabase is not configured, just update local state
      if (!supabase || !user?.id) {
        console.log("Supabase not configured, updating local profile only")
        setProfile(updatedProfile)
        setEditing(false)
        return
      }

      const { error } = await supabase.from("profiles").update(formData).eq("id", user.id)

      if (error) {
        console.log("Error updating profile, using local storage:", error.message || "Unknown error")
        // Still update local state even if Supabase fails
        setProfile(updatedProfile)
        setEditing(false)
        return
      }

      setProfile(updatedProfile)
      setEditing(false)
    } catch (error) {
      console.log("Unexpected error, using local storage:", error)
      // Still update local state even if there's an error
      const updatedProfile = { ...profile, ...formData }
      setProfile(updatedProfile)
      setEditing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go to home page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Spottr</h1>
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
            <Link href="/wearable" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Wearable
            </Link>
            <Link href="/profile" className="text-sm text-foreground font-medium transition-colors">
              Profile
            </Link>
          </nav>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3 text-foreground">Your Profile</h2>
            <p className="text-lg text-muted-foreground">Manage your personal information and fitness preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar name={profile?.full_name || user?.email || "User"} size="lg" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-600">{profile?.full_name || user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.full_name || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                {editing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.age || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                {editing ? (
                  <input
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.height_cm || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                {editing ? (
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.weight_kg || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
                {editing ? (
                  <select
                    name="fitness_level"
                    value={formData.fitness_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile?.fitness_level || "Not set"}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
                {editing ? (
                  <select
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select goal</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile?.goals || "Not set"}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{profile?.bio || "No bio provided"}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="mt-8 bg-card rounded-xl border border-border p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Your Stats</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24</div>
                <div className="text-sm text-muted-foreground">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">89%</div>
                <div className="text-sm text-muted-foreground">Avg Form Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">18.5h</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">7</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
