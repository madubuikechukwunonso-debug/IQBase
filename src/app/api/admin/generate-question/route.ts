import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const hardcodedPrompts = [
  "Create a challenging logical reasoning question about conditional statements and syllogisms.",
  "Create a pattern recognition question with numbers or shapes that requires deep observation.",
  "Create a numerical reasoning question involving percentages, ratios or sequences.",
  "Create a processing speed question that tests quick decision making.",
  "Create a logical puzzle question with multiple steps and clear options.",
  "Create a visual pattern or matrix question suitable for IQ tests.",
  "Create a numerical word problem that requires careful calculation.",
  "Create a logical analogy or relationship question.",
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Pick random prompt
  const randomPrompt = hardcodedPrompts[Math.floor(Math.random() * hardcodedPrompts.length)]

  console.log("🔍 AI Generator - Using prompt:", randomPrompt)

  try {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `You are an expert IQ test question creator for IQBase.
               Generate ONE high-quality multiple-choice question in valid JSON format ONLY.
               Fields: 
               - type: "logical" | "pattern" | "numerical" | "speed"
               - difficulty: number 1-5
               - question: string
               - options: array of exactly 4 strings
               - correctAnswer: index 0-3
               - explanation: short explanation
               - timeLimit: number in seconds (15-60)
               
               Do not add any extra text. Output only valid JSON.`,
      prompt: randomPrompt,
    })

    const text = await result.text
    console.log("🔍 AI Raw Response:", text)

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      console.error("JSON parse failed:", e)
      throw new Error("AI did not return valid JSON")
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error("❌ AI Generation Error:", error)
    return NextResponse.json({ 
      error: "AI Generation failed", 
      message: error.message 
    }, { status: 500 })
  }
}
