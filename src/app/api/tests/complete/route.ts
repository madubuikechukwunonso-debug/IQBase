import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { answers, result } = await req.json()

  const test = await prisma.test.create({
    data: {
      userId: session.user.id,
      score: result.score,
      percentile: result.percentile,
      category: result.category,
      logicalScore: result.categoryScores?.logical ?? 0,
      patternScore: result.categoryScores?.pattern ?? 0,
      numericalScore: result.categoryScores?.numerical ?? 0,
      speedScore: result.categoryScores?.speed ?? 0,
      status: 'COMPLETED',
      completedAt: new Date(),
      answers: {
        create: answers.map((a: any) => ({
          questionId: a.questionId,
          questionType: a.questionType || 'unknown',
          difficulty: a.difficulty || 1,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
          timeSpent: a.timeSpent,
        })),
      },
    },
  })

  return NextResponse.json({ testId: test.id, test })
}
