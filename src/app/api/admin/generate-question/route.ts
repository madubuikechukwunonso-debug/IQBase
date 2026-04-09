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

  // Fetch recent questions for anti-repetition (memory)
  let recentQuestions: any[] = [];
  try {
    recentQuestions = await prisma.question.findMany({
      select: { question: true, type: true, difficulty: true },
      orderBy: { createdAt: "desc" },
      take: 35,
    });
  } catch (dbError) {
    console.warn("Could not fetch recent questions:", dbError);
  }

  const existingList = recentQuestions
    .map((q, i) => `${i + 1}. ${q.question} (Type: ${q.type}, Diff: ${q.difficulty})`)
    .join("\n");

  const systemPrompt = `You are an expert IQ test question creator.

ANTI-REPETITION RULES (strict):
Here are recently used questions:
${existingList || "No previous questions."}

Do NOT repeat, reword, or use similar logic, numbers, scenarios, or structures.

Generate **exactly one** fresh, high-quality IQ question.

Output ONLY valid JSON:

{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90),
  "visualDescription": "detailed vivid description for image generation"
}`;

  const userPrompt = prompt || `Create one original difficulty ${difficulty} IQ question that is completely different from all previous ones.`;

  try {
    const completion = await openai.chat.completions.create({
      // More reliable & faster models on HF Router:
      model: "deepseek-ai/DeepSeek-V3",           // ← Best balance right now
      // Alternatives you can try:
      // model: "deepseek-ai/DeepSeek-V3:fastest",
      // model: "Qwen/Qwen2.5-72B-Instruct",     // very good & stable

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.95,
      max_tokens: 1400,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || "";

    if (!rawText) throw new Error("Empty response from model");

    // Extract JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in response");

    let parsed = JSON.parse(jsonMatch[0]);

    // Fallbacks
    if (!parsed.visualDescription) {
      parsed.visualDescription = "A beautiful, thoughtful, and artistic illustration suitable for an IQ test question.";
    }
    if (typeof parsed.difficulty !== "number") parsed.difficulty = difficulty;
    if (!Array.isArray(parsed.options) || parsed.options.length < 4) {
      throw new Error("Invalid options returned by model");
    }

    console.log("✅ Question generated successfully");
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("❌ Question Generation Error:", error?.message || error);

    return NextResponse.json(
      { 
        error: "Question generation failed",
        details: error?.message || "Unknown error",
        modelUsed: "deepseek-ai/DeepSeek-V3"
      },
      { status: 500 }
    );
  }
}
