import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { subject, body, toAll, specificEmails } = await req.json();

  let users;
  if (toAll) {
    users = await prisma.user.findMany({ select: { email: true } });
  } else {
    users = specificEmails.map((email: string) => ({ email }));
  }

  // TODO: Send emails using Resend or your email provider

  return NextResponse.json({ success: true, sentTo: users.length });
}
