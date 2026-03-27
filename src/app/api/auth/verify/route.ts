// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json()

    if (!token || !email) {
      return NextResponse.json({ error: "Token and email are required" }, { status: 400 })
    }

    const trimmedEmail = email.toLowerCase().trim()

    // Find the verification token
    const verification = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verification || verification.identifier !== trimmedEmail || verification.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    })

    if (!user) {
      // Create new user (magic link registration)
      user = await prisma.user.create({
        data: {
          email: trimmedEmail,
          name: trimmedEmail.split("@")[0],
          emailVerified: new Date(),
        },
      })
    } else {
      // Update existing user to verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    }

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Verify route error:", error)
    return NextResponse.json(
      { error: "Failed to verify account. Please try again." },
      { status: 500 }
    )
  }
}
