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

  const systemPrompt = `You are an expert IQ test question creator for IQBase.
Generate **exactly one** valid JSON object for a VISUAL / MATRIX / PATTERN question.
Required structure:
{
  "type": "visual",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90)
}
Output ONLY the JSON.`

  try {
    const result = await streamText({
      // ✅ This is the stable, production-ready model name (September 2024 release)
      model: google("gemini-1.5-flash-002"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
    })

    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => {
        console.error("❌ Gemini Error:", error)
        return `REAL ERROR: ${error instanceof Error ? error.message : String(error)}`
      },
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
