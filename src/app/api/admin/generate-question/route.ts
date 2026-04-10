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

  // Fetch recent questions (limit to reduce token usage)
  const recentQuestions = await prisma.question.findMany({
    select: { question: true, type: true, difficulty: true },
    orderBy: { createdAt: "desc" },
    take: 30,                    // Reduced to avoid context bloat
  });

  const existingList = recentQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

  const systemPrompt = `You are an expert IQ test creator.

RULES:
- NEVER repeat or slightly modify any existing question.
Existing questions:
${existingList || "None yet."}

You MUST respond with **ONLY** a valid JSON object. 
No thinking, no explanation, no markdown, no extra text before or after the JSON.

JSON format:
{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number,
  "question": "full question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "brief explanation",
  "timeLimit": 45,
  "visualDescription": "detailed image prompt"
}`;

  const userPrompt = prompt || `Generate one completely new original difficulty ${difficulty} IQ question.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "Qwen/Qwen2.5-72B-Instruct",     // ← Switched to Qwen (much better at strict JSON)
      // Alternative: "deepseek-ai/DeepSeek-V3" if you want to test again

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 1200,
    });

    let rawText = completion.choices[0]?.message?.content?.trim() || "";

    if (!rawText) throw new Error("Empty response from model");

    // Aggressive JSON cleaning
    let jsonStr = rawText;

    // Remove common unwanted wrappers
    jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    jsonStr = jsonStr.replace(/^[\s\S]*?(\{[\s\S]*\})/, "$1"); // Extract first JSON object

    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Raw model output:", rawText.substring(0, 600));
      throw new Error("Model did not return valid JSON");
    }

    // Fallbacks
    if (!parsed.visualDescription) {
      parsed.visualDescription = "Artistic and meaningful illustration for an IQ test question with rich colors and clear details.";
    }
    if (typeof parsed.difficulty !== "number") parsed.difficulty = difficulty;
    if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error("Invalid options");
    }

    console.log("✅ Successfully generated question");
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Generation Error:", error.message || error);
    return NextResponse.json(
      {
        error: "Question generation failed",
        details: error.message || "Check server logs for raw output",
      },
      { status: 500 }
    );
  }
}
