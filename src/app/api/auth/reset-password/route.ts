// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the verification token (we reuse VerificationToken for reset)
    const verification = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: { identifier: email.toLowerCase(), token },
      },
    });

    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: email.toLowerCase(), token },
      },
    });

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
