import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
        // We can reuse VerificationToken or create a separate ResetToken model later
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your IQBase password",
      html: `
        <h2>Reset your password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:16px 32px;background:#8b5cf6;color:white;text-decoration:none;border-radius:9999px;font-weight:600;">
          Reset Password
        </a>
        <p style="margin-top:20px;color:#666;font-size:14px;">This link expires in 15 minutes.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
