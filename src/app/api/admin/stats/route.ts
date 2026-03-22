import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import prisma from "@/lib/prisma"

export async function GET() {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const [
    totalUsers,
    totalTests,
    totalRevenue,
    totalQuestions,
    activeQuestions,
    recentTests
  ] = await Promise.all([
    prisma.user.count(),
    prisma.test.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.question.count(),
    prisma.question.count({ where: { isActive: true } }),
    prisma.test.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ])

  return NextResponse.json({
    stats: {
      totalUsers,
      totalTests,
      totalRevenue: (totalRevenue._sum.amount || 0) / 100,
      totalQuestions,
      activeQuestions,
    },
    recentTests: recentTests.map(t => ({
      id: t.id,
      email: t.user?.email || "Anonymous",
      score: t.score,
      date: t.createdAt.toISOString().split("T")[0],
      status: t.status,
      paid: !!t.payments?.length
    }))
  })
}
