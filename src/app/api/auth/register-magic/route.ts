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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create verification token (stores hashed password temporarily)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        hashedPassword,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Send magic link email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
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
        <p>Click the button below to create your account:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:16px 32px;background:#8b5cf6;color:white;text-decoration:none;border-radius:9999px;font-weight:600;">
          Create My Account
        </a>
        <p style="margin-top:20px;color:#666;font-size:14px;">This link expires in 15 minutes.</p>
        <p style="color:#666;font-size:13px;">If you didn't request this, you can ignore this email.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Magic link sent! Check your inbox / spam folder to complete registration.",
    });
  } catch (error: any) {
    console.error("Register magic error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send magic link" },
      { status: 500 }
    );
  }
}
