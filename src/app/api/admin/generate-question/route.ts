// src/app/api/admin/generate-question/route.ts
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"

export async function POST(req: Request) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { prompt, category, difficulty } = await req.json()

  // Improved prompt that respects your modal inputs and forces clean JSON
  const system = `You are an expert IQ test question creator for IQBase.
Generate **one** high-quality, original IQ question in valid JSON format only.
Fields required:
- type: "${category || "logical"}" (or pattern/numerical/verbal)
- difficulty: ${difficulty || 3} (1-5)
- question: string
- options: string[] (exactly 4 plausible options)
- correctAnswer: number (0-based index of the correct option)
- explanation: string (clear and educational)
- timeLimit: number (seconds, 30-90)

Make it challenging, fair, and educational. 
Output ONLY valid JSON. No extra text, no markdown, no explanations outside the JSON.`

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system,
    prompt: prompt || "Create a new challenging IQ question",
    temperature: 0.75,
  })

  // Stream response so frontend can show live AI output
  return result.toDataStreamResponse()
}
