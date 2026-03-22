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

  const { prompt } = await req.json()

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: `You are an expert IQ test question creator for IQBase.
             Generate one high-quality question in JSON format.
             Fields: type, difficulty, question, options (array), correctAnswer (index), explanation, timeLimit, imageUrl (only for graphical type).
             Make it challenging and educational.`,
    prompt: prompt || "Create a new graphical or logical IQ question",
  })

  return result.toDataStreamResponse()
}
