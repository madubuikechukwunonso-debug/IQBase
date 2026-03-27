// src/app/api/admin/users/[id]/block/route.ts
import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getUser()
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = params
  const { blocked } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { blocked: Boolean(blocked) },
    })

    console.log(`✅ User ${id} ${blocked ? "blocked" : "unblocked"}`)
    return NextResponse.json({
      success: true,
      message: `User ${blocked ? "blocked" : "unblocked"} successfully`,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("❌ Block/unblock error:", error)
    return NextResponse.json(
      { error: "Failed to update user status", details: error.message },
      { status: 500 }
    )
  }
}
