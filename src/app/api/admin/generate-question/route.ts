// src/app/api/admin/generate-question/route.ts
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { prompt } = await req.json()

  // Hardcoded prompts fallback (keeps your current logic)
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
  const randomPrompt = prompt || hardcodedPrompts[Math.floor(Math.random() * hardcodedPrompts.length)]

  console.log("🚀 AI Generator started with prompt:", randomPrompt)

  // === CRITICAL: Improved system prompt + real error revealing ===
  const systemPrompt = `You are an expert IQ test question creator.
Generate EXACTLY ONE valid JSON object. No extra text, no markdown, no explanations.
Required fields:
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
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: randomPrompt,
      temperature: 0.7,
    })

    // Return streaming response so your debug console shows live AI tokens
    return result.toDataStreamResponse({
      // This forces the REAL error message to appear in the stream instead of "An error occurred."
      onError: (error) => {
        console.error("❌ Raw AI SDK Error:", error)
        return `REAL ERROR: ${error.message || error}`
      }
    })
  } catch (error: any) {
    console.error("❌ FULL AI GENERATION ERROR (this will appear in Vercel Logs):", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    })

    // Stream the REAL error so your popup console shows it immediately
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(`REAL ERROR: ${error.message || "Unknown error"}\n`)
        controller.close()
      }
    })

    return new Response(errorStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
