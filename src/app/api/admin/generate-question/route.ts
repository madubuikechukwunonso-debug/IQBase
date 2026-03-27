// src/app/api/admin/generate-question/route.ts
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { prompt } = await req.json();

  const systemPrompt = `You are a world-class IQ test designer who creates advanced, thought-provoking, and visually engaging questions.

Generate **exactly one** completely ORIGINAL, high-quality IQ question.

Make it interesting and real-world oriented. Use themes like history, culture, religion, science, nature, architecture, famous figures, symbols, art, philosophy, or daily life scenarios — not just abstract geometric patterns.

Output ONLY valid JSON. No extra text.

Required structure:
{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90),
  "visualDescription": "A rich, highly detailed, vivid description of the image that should accompany this question. Make it visually striking and relevant. Describe colors, clothing, setting, lighting, mood, and composition in detail so it produces a beautiful and meaningful image."
}`;

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.9,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Fallback if visualDescription is missing
    if (!parsed.visualDescription) {
      parsed.visualDescription = parsed.question;
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Groq Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate question" },
      { status: 500 }
    );
  }
}
