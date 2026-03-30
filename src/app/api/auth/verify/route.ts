// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid-link", req.url));
  }

  try {
    const verification = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.identifier !== email.toLowerCase() || verification.expires < new Date()) {
      return NextResponse.redirect(new URL("/login?error=expired-link", req.url));
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split("@")[0],
          hashedPassword: verification.hashedPassword!,
          emailVerified: new Date(),
          role: "USER",
        },
      });
    } else if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.redirect(new URL("/login?error=server-error", req.url));
  }
}
