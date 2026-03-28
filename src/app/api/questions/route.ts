// src/app/api/questions/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch all active questions
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        type: true,
        difficulty: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        timeLimit: true,
        imageUrl: true,          // ← ADDED: This is what was missing
      },
    })

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: "No questions available in the database yet" }, { status: 404 })
    }

    // Shuffle and take exactly 22 questions (or all if less than 22)
    const shuffled = allQuestions.sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, 22)

    return NextResponse.json({ questions: selectedQuestions })
  } catch (error: any) {
    console.error("❌ Questions API error:", error)
    return NextResponse.json(
      { error: "Failed to load questions from database" },
      { status: 500 }
    )
  }
}
