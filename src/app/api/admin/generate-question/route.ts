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

  // Fetch recent questions for memory / anti-repetition
  let recentQuestions: any[] = [];
  try {
    recentQuestions = await prisma.question.findMany({
      select: { question: true, type: true, difficulty: true },
      orderBy: { createdAt: "desc" },
      take: 35,
    });
  } catch (e) {
    console.warn("Could not fetch recent questions");
  }

  const existingList = recentQuestions
    .map((q, i) => `${i + 1}. ${q.question} (Type: ${q.type}, Diff: ${q.difficulty})`)
    .join("\n");

  const systemPrompt = `You are a world-class IQ test question creator.

STRICT RULES:
- NEVER repeat or slightly reword any of the following existing questions:
${existingList || "No previous questions yet."}

Generate **exactly one** fresh, original IQ question.

IMPORTANT: Your entire response must be a single valid JSON object. 
Do not add any explanation, thinking, or extra text before or after the JSON.

Output format:
{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number (1-5),
  "question": "the full question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctAnswer": 0,
  "explanation": "short clear explanation",
  "timeLimit": 45,
  "visualDescription": "detailed description for image if visual"
}`;

  const userPrompt = prompt || `Create one completely new and original difficulty ${difficulty} IQ question that is different from all previous ones.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 1600,
      // We remove response_format because it's unreliable on HF router for this model
    });

    let rawText = completion.choices[0]?.message?.content?.trim() || "";

    if (!rawText) {
      throw new Error("Model returned empty response");
    }

    // Improved JSON extraction - handles common cases where model adds extra text
    let jsonStr = rawText;

    // Try to extract JSON if there's extra text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON Parse Failed. Raw output:", rawText.substring(0, 500));
      throw new Error("Model did not return valid JSON");
    }

    // Safety fallbacks
    if (!parsed.visualDescription) {
      parsed.visualDescription = "A beautiful artistic illustration suitable for an IQ test question with rich details and clear composition.";
    }
    if (typeof parsed.difficulty !== "number") parsed.difficulty = difficulty;
    if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error("Invalid options array");
    }
    if (typeof parsed.correctAnswer !== "number") {
      parsed.correctAnswer = 0;
    }

    console.log("✅ Question generated successfully");
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("❌ Generation Error:", error.message || error);

    return NextResponse.json(
      {
        error: "Question generation failed",
        details: error.message || "Model failed to return valid JSON",
      },
      { status: 500 }
    );
  }
}
