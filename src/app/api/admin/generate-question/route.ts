import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const hardcodedPrompts = [
  "Create a challenging logical reasoning question about conditional statements, syllogisms or deduction.",
  "Create a pattern recognition question with numbers, shapes or sequences that requires deep observation.",
  "Create a numerical reasoning question involving percentages, ratios, profit/loss or sequences.",
  "Create a processing speed question that tests quick decision making and mental math.",
  "Create a logical puzzle question with multiple steps and clear multiple-choice options.",
  "Create a visual pattern or matrix question suitable for standard IQ tests.",
  "Create a word-based logical reasoning question that involves analogies or relationships.",
  "Create a numerical series or sequence question that is tricky but solvable.",
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Pick a random prompt automatically
  const randomPrompt = hardcodedPrompts[Math.floor(Math.random() * hardcodedPrompts.length)]

  try {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `You are an expert IQ test question creator for IQBase.
               Generate ONE high-quality multiple-choice question in valid JSON format only.
               Fields required:
               - type: "logical" | "pattern" | "numerical" | "speed"
               - difficulty: number between 1 and 5
               - question: the question text
               - options: array of exactly 4 strings
               - correctAnswer: index (0-3) of the correct option
               - explanation: short explanation of the correct answer
               - timeLimit: number in seconds (15-60)
               
               Make the question challenging, educational and fair.`,
      prompt: randomPrompt,
    })

    const text = await result.text
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
