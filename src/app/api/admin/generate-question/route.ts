// src/app/api/admin/generate-question/route.ts
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_TOKEN,
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { prompt, difficulty = 3 } = await req.json();

  // Fetch recent questions to prevent repetition
  let recentQuestions: any[] = [];
  try {
    recentQuestions = await prisma.question.findMany({
      select: { question: true, type: true, difficulty: true },
      orderBy: { createdAt: "desc" },
      take: 35,
    });
  } catch (dbError) {
    console.warn("Warning: Could not fetch recent questions for anti-repetition", dbError);
  }

  const existingList = recentQuestions
    .map((q, i) => `${i + 1}. ${q.question} (Type: ${q.type}, Diff: ${q.difficulty})`)
    .join("\n");

  const systemPrompt = `You are a world-class IQ test question creator.

STRICT ANTI-REPETITION RULES:
Here are the most recent questions already in the database:
${existingList || "No previous questions yet."}

→ NEVER repeat, reword, or create similar logic, numbers, scenarios, or structures.

Generate **exactly one** fresh, high-quality, original IQ question.

Output ONLY valid JSON. No extra text.

{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90),
  "visualDescription": "detailed vivid image description"
}`;

  const userPrompt = prompt || `Create one completely original difficulty ${difficulty} IQ question that is different from all previous ones.`;

  try {
    const completion = await openai.chat.completions.create({
      // More reliable model on HF Router (as of April 2026)
      model: "deepseek-ai/DeepSeek-V3",

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.93,
      max_tokens: 1400,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || "";

    if (!rawText) {
      throw new Error("Model returned empty response");
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in model response");
    }

    let parsed = JSON.parse(jsonMatch[0]);

    // Fallbacks for safety
    if (!parsed.visualDescription) {
      parsed.visualDescription = "A beautiful, artistic, and meaningful illustration for an IQ test question with rich colors and clear composition.";
    }
    if (typeof parsed.difficulty !== "number") parsed.difficulty = difficulty;
    if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error("Model returned invalid options array");
    }

    console.log("✅ Question generated successfully with DeepSeek-V3");
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("❌ Generation Error:", error.message || error);

    return NextResponse.json(
      {
        error: "Question generation failed",
        details: error.message || "Unknown error from model",
        model: "deepseek-ai/DeepSeek-V3"
      },
      { status: 500 }
    );
  }
}
