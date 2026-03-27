// src/app/api/admin/tests/[id]/route.ts
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import prisma from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getUser()
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
  }

  try {
    await prisma.test.delete({
      where: { id },
    })

    console.log("✅ Test deleted:", id)
    return NextResponse.json({ success: true, message: "Test deleted successfully" })
  } catch (error: any) {
    console.error("❌ Delete test error:", error)
    return NextResponse.json(
      { error: "Failed to delete test", details: error.message },
      { status: 500 }
    )
  }
}
