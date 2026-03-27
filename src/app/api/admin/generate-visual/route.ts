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

  const systemPrompt = `You are an expert IQ test creator for IQBase.
Create a high-quality **VISUAL** IQ question (pattern, matrix, figure completion, or spatial reasoning).
Always describe the visual clearly using ASCII art or a numbered grid so it is easy to visualize.
Return **ONLY** valid JSON (no markdown, no extra text):

{
  "type": "visual",
  "difficulty": number (1-5),
  "question": "Clear description of the visual pattern (use ASCII art if helpful)",
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90),
  "imageUrl": null   // placeholder for future real image generation
}

Make the visual description very clear and vivid.`

  try {
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
    })

    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => `REAL ERROR: ${error instanceof Error ? error.message : String(error)}`,
    })
  } catch (error: any) {
    console.error("❌ FULL Gemini CATCH ERROR:", error)
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
