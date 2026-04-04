// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ error: "Invalid or missing verification link" }, { status: 400 });
    }

    // Find the verification token
    const verification = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token,
        },
      },
    });

    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
    }

    if (!verification.hashedPassword) {
      return NextResponse.json({ error: "No password found for this verification" }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Create the user with the hashed password from verification token
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split("@")[0],           // temporary name (user can update later)
          hashedPassword: verification.hashedPassword,
          emailVerified: new Date(),
          role: "USER",
        },
      });
      console.log(`✅ New user created: ${user.email} (ID: ${user.id})`);
    } else if (!user.emailVerified) {
      // Update existing user (rare case)
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully" 
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    return NextResponse.json({ 
      error: "Failed to create account. Please try again." 
    }, { status: 500 });
  }
}
