// src/app/api/admin/generate-question/route.ts
import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"

export async function POST(req: Request) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { prompt } = await req.json()

  // Random theme to force originality and prevent repeats
  const themes = [
    "science", "history", "culture", 
    "nature and ecosystems", "food", "aquatic life", 
    "technology", "biology", "historical artifacts", 
    "government"
  ]
  const randomTheme = themes[Math.floor(Math.random() * themes.length)]

  const systemPrompt = `You are an expert IQ test question creator for IQBase.
Generate **exactly one** completely ORIGINAL and UNIQUE high-quality IQ question.
Never repeat common patterns or questions you have made before.
Use the theme "${randomTheme}" to make it fresh and different every time.
Output ONLY valid JSON. No extra text, no markdown.

Required structure:
{
  "type": "logical" | "pattern" | "numerical" | "verbal",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90)
}`

  try {
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.85,   // higher = more originality and variety
    })

    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => `REAL ERROR: ${error instanceof Error ? error.message : String(error)}`,
    })
  } catch (error: any) {
    console.error("❌ Groq Error:", error)
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(`REAL ERROR: ${error.message || "Unknown error"}\n`)
        controller.close()
      },
    })
    return new Response(errorStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
