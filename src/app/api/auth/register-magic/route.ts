// src/app/api/auth/register-magic/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires, hashedPassword },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Debug logging
    console.log("📧 Attempting to send email to:", email);
    console.log("📧 EMAIL_SERVER_HOST:", process.env.EMAIL_SERVER_HOST || "MISSING");
    console.log("📧 EMAIL_SERVER_USER:", process.env.EMAIL_SERVER_USER ? "✅ Set" : "❌ MISSING");
    console.log("📧 EMAIL_SERVER_PASSWORD:", process.env.EMAIL_SERVER_PASSWORD ? "✅ Set" : "❌ MISSING");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"IQBase" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Complete your IQBase registration",
      html: `
        <h2>Welcome to IQBase 👋</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to create your account:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:16px 32px;background:#8b5cf6;color:white;text-decoration:none;border-radius:9999px;font-weight:600;">
          Create My Account
        </a>
        <p style="margin-top:20px;color:#666;font-size:14px;">This link expires in 15 minutes.</p>
      `,
    });

    console.log("✅ Magic link sent successfully to", email);

    return NextResponse.json({
      success: true,
      message: "Magic link sent! Check your email to complete registration.",
    });
  } catch (error: any) {
    console.error("❌ Register magic error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link. Please check your email settings on Vercel." },
      { status: 500 }
    );
  }
}
