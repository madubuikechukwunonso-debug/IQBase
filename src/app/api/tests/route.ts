import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tests = await prisma.test.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        percentile: true,
        category: true,
        logicalScore: true,
        patternScore: true,
        numericalScore: true,
        speedScore: true,
        createdAt: true,
        pdfReport: true,   // for premium badge
      },
    })

    return NextResponse.json({ tests })
  } catch (error: any) {
    console.error('Error fetching tests:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}
