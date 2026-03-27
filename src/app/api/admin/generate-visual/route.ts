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
Create a high-quality VISUAL IQ question (matrix, pattern, figure completion, symmetry, or spatial reasoning).
Return ONLY valid JSON (no markdown, no extra text):

{
  "type": "visual",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90)
}`

  try {
    // 1. Generate the JSON question with Gemini
    const textResult = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.8,
    })

    const textBuffer = await textResult.text
    const jsonMatch = textBuffer.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) throw new Error("Could not parse JSON from Gemini")

    const questionData = JSON.parse(jsonMatch[0])

    // 2. Generate real image with Flux.1-schnell on Replicate
    const imagePrompt = `Clean, high-contrast black and white IQ test style image: ${questionData.question}. Simple geometric shapes, clear lines, perfect for matrix or pattern completion, no text in image.`

    // Create prediction
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: {
          prompt: imagePrompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
        },
      }),
    })

    const prediction = await createRes.json()
    const predictionId = prediction.id

    // Poll until ready (max 25 seconds)
    let imageUrl = null
    for (let i = 0; i < 25; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second poll

      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` },
      })
      const statusData = await statusRes.json()

      if (statusData.status === "succeeded") {
        imageUrl = statusData.output[0]
        break
      }
      if (statusData.status === "failed") {
        throw new Error("Image generation failed on Replicate")
      }
    }

    if (!imageUrl) throw new Error("Image generation timed out")

    // Add image URL to question
    questionData.imageUrl = imageUrl

    return NextResponse.json(questionData)
  } catch (error: any) {
    console.error("❌ Visual generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
