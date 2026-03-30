// src/app/api/auth/register-magic/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Hash the password immediately
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create verification token with hashed password
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
        hashedPassword,   // ← Stored here temporarily
      },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"IQBase" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Complete your IQBase registration",
      html: `
        <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: white; border-radius: 20px;">
          <h1 style="font-size: 28px; margin-bottom: 8px;">Welcome to IQBase 👋</h1>
          <p style="font-size: 18px; color: #a3a3a3;">Click the button below to create your account:</p>
          <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 16px 32px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 18px;">
            Create My Account
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
          <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Magic link sent" });
  } catch (error: any) {
    console.error("Register-magic error:", error);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }
}
