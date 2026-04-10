// src/app/api/admin/generate-question/route.ts
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { prompt, difficulty = 3 } = await req.json();

  // Fetch recent questions (keep it reasonable)
  const recentQuestions = await prisma.question.findMany({
    select: { question: true, type: true, difficulty: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const existingList = recentQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

  const systemPrompt = `You are a world-class IQ test question creator.

STRICT ANTI-REPETITION:
Existing questions:
${existingList || "None yet."}

NEVER repeat or reword any of them.

Respond with **ONLY** valid JSON. No extra text.

{
  "type": "logical" | "pattern" | "numerical" | "verbal" | "visual" | "cultural",
  "difficulty": number (1-5),
  "question": "full question",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "brief explanation",
  "timeLimit": 45,
  "visualDescription": "detailed image description"
}`;

  const userPrompt = prompt || `Create one completely original difficulty ${difficulty} IQ question, different from all previous ones.`;

  try {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-reasoner",        // or "deepseek-chat" for faster/cheaper
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 1400,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("No JSON in response");

    let parsed = JSON.parse(jsonMatch[0]);

    // Fallbacks
    if (!parsed.visualDescription) {
      parsed.visualDescription = "A beautiful, artistic illustration suitable for an IQ test question.";
    }
    if (typeof parsed.difficulty !== "number") parsed.difficulty = difficulty;

    console.log("✅ DeepSeek question generated successfully");
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("DeepSeek API Error:", error.message || error);
    return NextResponse.json(
      { error: "Question generation failed", details: error.message },
      { status: 500 }
    );
  }
}
