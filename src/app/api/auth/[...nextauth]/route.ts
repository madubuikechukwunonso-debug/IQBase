// src/app/api/auth/register-magic/route.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import nodemailer from "nodemailer"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const trimmedEmail = email.toLowerCase().trim()

    // Create verification token (15 minutes expiry)
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: trimmedEmail,
        token,
        expires,
      },
    })

    // Build magic link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const magicLink = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(trimmedEmail)}`

    // ✅ HARDCODED BEAUTIFUL HTML EMAIL TEMPLATE
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    await transport.sendMail({
      to: trimmedEmail,
      from: process.env.EMAIL_FROM,
      subject: `Your magic link for IQBase`,
      html: `
        <div style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0a0a; color: white; border-radius: 16px;">
          <h1 style="font-size: 28px; margin-bottom: 8px;">Welcome to IQBase 👋</h1>
          <p style="font-size: 18px; color: #a3a3a3;">Click the button below to verify your email and create your account:</p>
          <a href="${magicLink}" style="display: inline-block; margin: 24px 0; padding: 16px 32px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 18px;">
            Create my account
          </a>
          <p style="color: #666; font-size: 14px;">Link expires in 15 minutes.</p>
          <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Register-magic error:", error)
    return NextResponse.json(
      { error: "Failed to send magic link. Please try again." },
      { status: 500 }
    )
  }
}
