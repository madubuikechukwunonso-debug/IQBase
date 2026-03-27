import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  // Create verification token
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  // Send magic link using NextAuth's built-in email
  const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`

  // Trigger the Email provider
  await fetch(`${process.env.NEXTAUTH_URL}/api/auth/signin/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, url, provider: "email" }),
  })

  return NextResponse.json({ success: true })
}
