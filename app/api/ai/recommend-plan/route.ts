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

Please provide a comprehensive recommendation using markdown formatting:

## Recommended Workout Plan
- **Plan Name**: [Selected plan]
- **Reasoning**: Why this plan is perfect for you
- **Duration**: How long to follow this plan

## Recommended Meal Plan
- **Plan Name**: [Selected plan]
- **Reasoning**: Why this nutrition approach fits your goals
- **Key Focus**: Main nutritional priorities

## Specific Tips for Your Challenges
- Address each challenge with actionable advice
- Use bullet points for clarity

## Expected Timeline
- **Week 1-2**: Initial changes you'll notice
- **Week 3-4**: Progress milestones
- **Month 2+**: Long-term results

## Additional Advice
- Pro tips for success
- Common pitfalls to avoid
- Motivation and encouragement

Use **bold** for emphasis and bullet points for easy reading.
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
