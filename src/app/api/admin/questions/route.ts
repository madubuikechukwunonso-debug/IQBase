// src/app/api/admin/questions/route.ts
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import prisma from "@/lib/prisma"

export async function GET() {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        difficulty: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        timeLimit: true,
        imageUrl: true,          // ← ADDED: now returns the image
        isActive: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error("❌ Fetch questions error:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  try {
    const data = await req.json()

    // === UNIQUENESS CHECK (recommended to prevent duplicates) ===
    const existing = await prisma.question.findFirst({
      where: {
        question: { equals: data.question, mode: "insensitive" },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: "This question already exists in the database." },
        { status: 409 }
      )
    }

    const savedQuestion = await prisma.question.create({
      data: {
        type: data.type || "logical",
        difficulty: Number(data.difficulty) || 3,
        question: data.question,
        options: data.options, // Prisma stores as Json
        correctAnswer: Number(data.correctAnswer),
        explanation: data.explanation || "",
        timeLimit: Number(data.timeLimit) || 60,
        imageUrl: data.imageUrl || null,        // ← FIXED: now saves the image URL
        isActive: true,
      },
    })

    console.log("✅ Question saved to DB with image:", savedQuestion.id, savedQuestion.imageUrl)

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

export async function DELETE(req: Request) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
  }
  try {
    await prisma.question.delete({
      where: { id },
    })
    console.log("✅ Question deleted:", id)
    return NextResponse.json({ success: true, message: "Question deleted successfully" })
  } catch (error: any) {
    console.error("❌ Delete question error:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
