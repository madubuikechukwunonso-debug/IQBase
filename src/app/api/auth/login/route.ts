import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await compare(password, user.hashedPassword);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ FIXED
    const session = await auth.createSession(user.id);

    // ✅ FIXED
    const sessionCookie = auth.createSessionCookie(session);

    return new NextResponse(null, {
      status: 302,
      headers: {
        "Set-Cookie": sessionCookie.serialize(),
        Location: "/dashboard",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
