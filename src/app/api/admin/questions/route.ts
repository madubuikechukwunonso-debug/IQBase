// src/app/api/admin/questions/route.ts
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import prisma from "@/lib/prisma"   // your existing Prisma client

export async function POST(req: Request) {
  const user = await getUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const data = await req.json()

    const savedQuestion = await prisma.question.create({
      data: {
        type: data.type || "logical",
        difficulty: Number(data.difficulty) || 3,
        question: data.question,
        options: data.options,                 // Prisma will store as Json
        correctAnswer: Number(data.correctAnswer),
        explanation: data.explanation || "",
        timeLimit: Number(data.timeLimit) || 60,
        isActive: true,
      },
    })

    console.log("✅ Question saved to DB:", savedQuestion.id)

    return NextResponse.json({
      success: true,
      message: "Question saved successfully to the database!",
      question: savedQuestion,
    })
  } catch (error: any) {
    console.error("❌ Save question error:", error)
    return NextResponse.json(
      { error: "Failed to save question", details: error.message },
      { status: 500 }
    )
  }
}
