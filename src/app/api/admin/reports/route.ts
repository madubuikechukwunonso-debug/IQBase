// src/app/api/admin/reports/route.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json({ messages: [] }); // safe empty array
  }
}
