// src/app/api/admin/reports/route.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getUser();
  
  // Only allow admins
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("❌ Reports fetch error:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
