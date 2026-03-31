import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const testId = req.nextUrl.searchParams.get('testId')

  try {
    // 1. Stripe fresh payment flow (session_id)
    if (sessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

      if (checkoutSession.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed yet' }, { status: 400 })
      }

      const test = await prisma.test.findUnique({
        where: { id: checkoutSession.metadata?.testId || '' },
      })

      if (!test) {
        return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
      }

      return NextResponse.json({ test })
    }

    // 2. Dashboard / past test flow (testId)
    if (testId) {
      const test = await prisma.test.findUnique({
        where: { id: testId },
      })

      if (!test) {
        return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
      }

      return NextResponse.json({ test })
    }

    // No ID provided
    return NextResponse.json({ error: 'No session ID or test ID found' }, { status: 400 })
  } catch (error: any) {
    console.error('Verify API error:', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
