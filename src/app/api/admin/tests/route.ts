import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  // Debugging log
  console.log("Admin /tests API - Session:", session?.user)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
  }

  const tests = await prisma.test.findMany({
    include: {
      user: {
        select: { email: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ tests })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { testId } = await req.json()

  await prisma.test.delete({
    where: { id: testId }
  })

  return NextResponse.json({ success: true })
}
