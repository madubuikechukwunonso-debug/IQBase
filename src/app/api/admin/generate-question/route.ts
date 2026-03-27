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

  // Your existing hardcoded prompts (kept exactly as before)
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
  const finalPrompt = prompt || hardcodedPrompts[Math.floor(Math.random() * hardcodedPrompts.length)]

  console.log("🚀 Groq AI Generator started with prompt:", finalPrompt)

  const systemPrompt = `You are an expert IQ test question creator for IQBase.
Generate **exactly one** valid JSON object. No extra text, no markdown, no explanations outside the JSON.

Required structure:
{
  "type": "logical" | "pattern" | "numerical" | "verbal",
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
      model: groq("llama-3.3-70b-versatile"),   // Best free Groq model for structured IQ questions
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.7,
    })

    // Stream response with live tokens + real error forwarding to your debug console
    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => {
        console.error("❌ Groq Error forwarded:", error)
        return `REAL ERROR: ${error instanceof Error ? error.message : String(error)}`
      },
    })
  } catch (error: any) {
    console.error("❌ FULL Groq CATCH ERROR:", error)

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
