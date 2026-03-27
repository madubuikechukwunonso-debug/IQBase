// src/app/api/admin/generate-visual/route.ts
import { google } from "@ai-sdk/google"
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
  const themes = ["space", "nature", "technology", "animals", "ancient symbols", "geometric art", "ocean", "city skyline", "mythical creatures"]
  const randomTheme = themes[Math.floor(Math.random() * themes.length)]

  const systemPrompt = `You are an expert IQ test creator for IQBase.
Create a completely ORIGINAL and UNIQUE visual IQ question (matrix, pattern, figure completion, symmetry, or spatial reasoning).
Never repeat common patterns. Use the theme "${randomTheme}" to make it fresh.
Include a clear ASCII art / grid representation in the question text.
Return ONLY valid JSON (no markdown, no extra text):

{
  "type": "visual",
  "difficulty": number (1-5),
  "question": "Clear description + ASCII art / grid of the visual pattern",
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90)
}`

  try {
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.85,   // higher = more variety
    })

    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => `REAL ERROR: ${error instanceof Error ? error.message : String(error)}`,
    })
  } catch (error: any) {
    console.error("❌ Gemini Visual Error:", error)
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
