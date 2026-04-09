// src/app/api/admin/generate-question/route.ts
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";   // Adjust path if your prisma client is elsewhere

const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_TOKEN,   // ← Correct variable name as you specified
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { prompt, difficulty } = await req.json();

  // === Fetch recent questions to give the model "memory" and prevent repetition ===
  const recentQuestions = await prisma.question.findMany({
    select: {
      question: true,
      type: true,
      difficulty: true,
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const existingList = recentQuestions
    .map((q, i) => `${i + 1}. ${q.question} (Type: ${q.type}, Difficulty: ${q.difficulty})`)
    .join("\n");

  const systemPrompt = `You are a world-class IQ test designer specializing in creating original, high-quality cognitive assessment questions.

CRITICAL ANTI-REPETITION RULES — Follow strictly:
- NEVER repeat, slightly reword, or use similar logic, numbers, scenarios, or structures from previously generated questions.
Here are the most recent 40 questions already in the system:

${existingList || "No previous questions yet."}

- Make every new question meaningfully different in theme, reasoning style, and wording.
- Vary between syllogism, sequences, analogies, conditional reasoning, probability, spatial thinking, etc.
- Use real-world, cultural, historical, scientific, or philosophical themes when appropriate.

Generate **exactly one** completely ORIGINAL high-quality IQ question.

Output ONLY valid JSON. No extra text, no markdown, no explanations.

Required JSON structure:
{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number (1-5),
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number (0-3),
  "explanation": string,
  "timeLimit": number (30-90),
  "visualDescription": "Rich, detailed, vivid description for image generation including colors, clothing, setting, lighting, mood, and composition."
}`;

  const userPrompt = prompt || 
    `Create one fresh, original ${difficulty ? `difficulty level ${difficulty}` : "medium difficulty"} IQ question that is different from all previous ones.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/DeepSeek-R1:fastest",     // Strong reasoning + good speed/cost balance
      // Alternative options:
      // "deepseek-ai/DeepSeek-R1"          → strongest reasoning
      // "deepseek-ai/DeepSeek-V3:fastest"  → faster & cheaper

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.92,
      max_tokens: 1300,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content || "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in model response");

    let parsed = JSON.parse(jsonMatch[0]);

    // Safety fallbacks
    if (!parsed.visualDescription) {
      parsed.visualDescription = parsed.question || "A beautiful and thoughtful IQ test illustration.";
    }
    if (typeof parsed.difficulty !== "number") {
      parsed.difficulty = difficulty || 3;
    }
    if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error("Invalid options array returned");
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Hugging Face / DeepSeek Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate question",
        details: error?.response?.data || null 
      },
      { status: 500 }
    );
  }
}
