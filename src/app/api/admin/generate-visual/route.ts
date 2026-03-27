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
Create a high-quality VISUAL IQ question (matrix, pattern, figure completion, spatial reasoning).
Return ONLY valid JSON (no markdown, no extra text):

{
  "type": "visual",
  "difficulty": number (1-5),
  "question": "Clear description of the visual pattern (use ASCII art if helpful)",
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90)
}

Make the question clear and vivid.`

  try {
    // Step 1: Generate the JSON question with Gemini
    const textResult = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
    })

    const textBuffer = await textResult.text
    const jsonMatch = textBuffer.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) throw new Error("Could not parse JSON")

    const questionData = JSON.parse(jsonMatch[0])

    // Step 2: Generate real image with Flux.1-schnell
    const imagePrompt = `Create a clean, high-contrast black and white IQ test style image for this question: ${questionData.question}. Use simple geometric shapes, clear lines, high contrast, no text. Perfect for IQ matrix or pattern completion.`

    const imageResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "a5b5c0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0b0c0", // Flux.1-schnell
        input: {
          prompt: imagePrompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
        },
      }),
    })

    const imageData = await imageResponse.json()
    const imageUrl = imageData.output[0] // Flux returns the image URL directly

    // Add the image URL to the question
    questionData.imageUrl = imageUrl

    return NextResponse.json(questionData)
  } catch (error: any) {
    console.error("❌ Visual generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
