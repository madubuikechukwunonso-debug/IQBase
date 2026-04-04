// src/app/api/admin/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const admin = await getUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { subject, content, sendTo } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    // Get recipients
    let recipients: string[] = [];

    if (sendTo === "all") {
      const users = await prisma.user.findMany({
        where: { email: { not: null } },
        select: { email: true },
      });
      recipients = users.map(u => u.email!).filter(Boolean);
    } else if (sendTo === "specific" && Array.isArray(sendTo.emails)) {
      recipients = sendTo.emails;
    } else {
      return NextResponse.json({ error: "Invalid recipient option" }, { status: 400 });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    // Send emails using your existing email config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    const sender = process.env.EMAIL_FROM || "no-reply@iqbase.live";

    // Send to all recipients (you can batch this for large lists)
    for (const to of recipients) {
      await transporter.sendMail({
        from: sender,
        to,
        subject,
        html: content,
      });
    }

    console.log(`✅ Newsletter sent to ${recipients.length} recipients`);

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${recipients.length} users`,
    });
  } catch (error: any) {
    console.error("Newsletter send error:", error);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
