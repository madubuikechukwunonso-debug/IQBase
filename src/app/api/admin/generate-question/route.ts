// src/app/api/admin/generate-question/route.ts
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";           // ← Changed to generateText (no stream)
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { prompt } = await req.json();

  const themes = [
    "logical syllogisms", "conditional reasoning", "pattern recognition in shapes",
    "number series completion", "letter series completion", "verbal analogies",
    "spatial visualization", "matrix completion puzzles", "figure rotation and transformation",
    // ... (keep all your themes - I shortened for brevity)
  ];

  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

  const systemPrompt = `You are an expert IQ test question creator for IQBase.
Generate **exactly one** completely ORIGINAL and UNIQUE high-quality IQ question.
Use the IQ-specific theme "${randomTheme}".
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
}`;

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.85,
    });

    // Extract JSON from the response (Groq sometimes adds extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);   // ← Simple JSON response
  } catch (error: any) {
    console.error("Groq Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate question" },
      { status: 500 }
    );
  }
}
