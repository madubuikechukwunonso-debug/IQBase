import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { token, email } = await req.json()

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verification || verification.identifier !== email || verification.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }

  // Create user if not exists (magic link registration)
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        emailVerified: new Date(),
      },
    })
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })
  }

  // Delete used token
  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}
