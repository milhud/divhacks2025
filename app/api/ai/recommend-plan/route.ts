import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { issues, userProfile } = await request.json()

    if (!issues) {
      return NextResponse.json(
        { error: 'Issues are required' },
        { status: 400 }
      )
    }

    const prompt = `
You are an expert fitness and nutrition coach. Based on the user's fitness challenges and profile, recommend the most suitable workout and meal plan.

User's Issues: ${issues}
User Profile: ${JSON.stringify(userProfile, null, 2)}

Available Workout Plans:
1. Beginner Weight Loss (4 weeks) - Perfect for beginners looking to lose weight
2. Muscle Building Program (8 weeks) - Structured program to build lean muscle mass
3. HIIT Fat Burner (6 weeks) - High-intensity program for maximum fat burning
4. Strength & Power (10 weeks) - Build maximum strength with compound movements
5. Flexibility & Mobility (4 weeks) - Improve flexibility and reduce injury risk
6. Quick & Effective (3 weeks) - Short, effective workouts for busy schedules

Available Meal Plans:
1. Weight Loss Meal Plan (4 weeks) - Balanced meals for sustainable weight loss
2. Muscle Building Nutrition (8 weeks) - High-calorie, protein-rich meals
3. Clean Eating Plan (6 weeks) - Whole foods approach for optimal health
4. Plant-Based Nutrition (4 weeks) - Complete nutrition from plant sources

Please provide:
1. Recommended workout plan with reasoning
2. Recommended meal plan with reasoning
3. Specific tips for their challenges
4. Expected timeline for results
5. Any additional advice

Keep the response concise but helpful, focusing on actionable advice.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert fitness and nutrition coach with 10+ years of experience. Provide personalized, actionable recommendations based on user needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const recommendation = completion.choices[0]?.message?.content || "Based on your challenges, I recommend starting with our Beginner Weight Loss program and Clean Eating meal plan. Focus on building consistent habits and gradually increasing intensity."

    return NextResponse.json({
      recommendation,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI recommendation error:', error)
    
    // Fallback recommendation
    const fallbackRecommendation = "Based on your challenges, I recommend starting with our Beginner Weight Loss program and Clean Eating meal plan. Focus on building consistent habits and gradually increasing intensity. Consider tracking your progress and staying consistent with your routine."
    
    return NextResponse.json({
      recommendation: fallbackRecommendation,
      timestamp: new Date().toISOString()
    })
  }
}
