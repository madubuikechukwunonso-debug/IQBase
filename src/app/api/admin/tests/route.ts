import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  console.log("🔍 /api/admin/users - Full Session:", JSON.stringify(session, null, 2))
  console.log("🔍 Role received:", session?.user?.role)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized - Admin access required',
      receivedRole: session?.user?.role 
    }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      blocked: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId, blocked } = await req.json()

  await prisma.user.update({
    where: { id: userId },
    data: { blocked }
  })

  return NextResponse.json({ success: true })
}
