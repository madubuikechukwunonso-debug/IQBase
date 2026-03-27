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

  // === 90+ PURE IQ-TEST FOCUSED THEMES (no broad academic subjects) ===
  const themes = [
    "logical syllogisms", "conditional reasoning", "pattern recognition in shapes",
    "number series completion", "letter series completion", "verbal analogies",
    "spatial visualization", "matrix completion puzzles", "figure rotation and transformation",
    "mirror image problems", "water image problems", "paper folding and cutting",
    "cube and dice problems", "odd one out in figures", "embedded figure detection",
    "figure completion", "direction sense test", "blood relation puzzles",
    "coding decoding", "alphabet test", "mathematical operations",
    "clock and calendar problems", "calendar reasoning", "time and distance puzzles",
    "age calculation", "profit and loss reasoning", "ratio and proportion logic",
    "percentage calculation puzzles", "simple interest logic", "compound interest reasoning",
    "data sufficiency", "statement and assumption", "statement and conclusion",
    "cause and effect reasoning", "course of action", "input output machine",
    "puzzle seating arrangement", "floor based puzzles", "circular seating arrangement",
    "linear seating arrangement", "box and stack puzzles", "month and day puzzles",
    "year and date puzzles", "family tree logic", "relationship puzzles",
    "symbol based reasoning", "mathematical reasoning", "logical Venn diagrams",
    "syllogism with Venn", "analytical reasoning", "critical reasoning",
    "abstract reasoning", "non verbal series", "non verbal classification",
    "non verbal analogy", "figure series completion", "figure odd one out",
    "figure matrix", "figure classification", "figure analogy",
    "spatial orientation", "visual memory puzzles", "pattern folding",
    "pattern unfolding", "dot situation", "hidden image detection",
    "mirror reflection series", "water reflection series", "paper cutting patterns",
    "cube face counting", "dice opposite faces", "dice number patterns",
    "clock angle problems", "calendar date problems", "missing number in grid",
    "missing letter in grid", "number matrix", "letter matrix",
    "symbol matrix", "word analogy", "number analogy",
    "letter analogy", "mixed series", "alpha numeric series",
    "continuous pattern series", "reversed pattern series", "alternating pattern series"
  ]

  const randomTheme = themes[Math.floor(Math.random() * themes.length)]

  const systemPrompt = `You are an expert IQ test question creator for IQBase.
Generate **exactly one** completely ORIGINAL and UNIQUE high-quality IQ question.
Never repeat common patterns or questions you have made before.
Use the IQ-specific theme "${randomTheme}" to make it fresh and different every time.
Output ONLY valid JSON. No extra text, no markdown.

Required structure:
{
  "type": "logical" | "pattern" | "numerical" | "verbal",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90)
}`

  try {
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.85,
    })

    // ✅ FIXED for AI SDK v6
    return result.toTextStreamResponse()

  } catch (error: any) {
    console.error("❌ Groq Error:", error)
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
