import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { messageId, replyText } = await req.json();

  const msg = await prisma.contactMessage.update({
    where: { id: messageId },
    data: { replied: true, replyText },
  });

  // TODO: Send actual email reply (Resend / Nodemailer)

  return NextResponse.json({ success: true });
}
