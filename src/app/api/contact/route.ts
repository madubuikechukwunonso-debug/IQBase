import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Optional: send email notification to admin (you can add Resend/Nodemailer here)

    return NextResponse.json({ success: true, id: contact.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
