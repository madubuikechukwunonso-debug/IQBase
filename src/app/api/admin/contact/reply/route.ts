// src/app/api/admin/contact/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { messageId, replyText } = await req.json();

    if (!messageId || !replyText?.trim()) {
      return NextResponse.json({ error: "Message ID and reply text are required" }, { status: 400 });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        replyText: replyText.trim(),
        replied: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Reply saved successfully",
      data: updatedMessage 
    });
  } catch (error: any) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
  }
}
