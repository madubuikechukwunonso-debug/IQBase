import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  const testId = req.nextUrl.searchParams.get('testId');

  try {
    let test;

    // 1. Stripe fresh payment flow (session_id)
    if (sessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId); // you already have stripe import in some files
      if (checkoutSession.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed yet' }, { status: 400 });
      }

      test = await prisma.test.findUnique({
        where: { id: checkoutSession.metadata?.testId || '' },
        include: {
          answers: true,
          user: { select: { name: true, email: true } },
        },
      });
    }

    // 2. Dashboard / past test flow (testId)
    else if (testId) {
      test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          answers: true,
          user: { select: { name: true, email: true } },
        },
      });
    }

    if (!test) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error: any) {
    console.error('Verify API error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
