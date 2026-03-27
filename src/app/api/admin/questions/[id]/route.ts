// src/app/api/admin/questions/[id]/route.ts
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import prisma from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = params

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
    return NextResponse.json(
      { error: "Failed to delete question", details: error.message },
      { status: 500 }
    )
  }
}
