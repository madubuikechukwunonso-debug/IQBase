// src/app/api/admin/generate-question/route.ts
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"   // ← kept your original auth

export async function POST(req: Request) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { prompt } = await req.json()

  // Hardcoded prompts fallback (exactly like your frontend)
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

  console.log("🚀 AI Generator started with prompt:", finalPrompt)

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
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.7,
      // Log real errors on the server
      onError: (error) => {
        console.error("❌ Raw streamText error:", error)
      },
    })

    // Return streaming response + forward REAL error messages to your debug console
    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => {
        console.error("❌ AI SDK Error forwarded to client:", error)
        const message = error instanceof Error ? error.message : String(error)
        return `REAL ERROR: ${message}`
      },
    })
  } catch (error: any) {
    console.error("❌ FULL CATCH BLOCK ERROR:", error)

    // Stream the real error so your popup console shows it instantly
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
