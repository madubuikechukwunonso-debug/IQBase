import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { generatePremiumReport } from '@/lib/pdf-generator'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    const event = stripe.webhooks.constructEvent(payload, signature!, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any

      const payment = await prisma.payment.create({
        data: {
          stripePaymentId: session.id,
          amount: session.amount_total! / 100,
          tier: session.metadata.tier as "BASIC" | "PREMIUM",
          status: 'COMPLETED',
          userId: session.metadata.userId,
          testId: session.metadata.testId,
        },
      })

      // If premium, generate and attach PDF
      if (session.metadata.tier === 'PREMIUM' && session.metadata.testId) {
        const test = await prisma.test.findUnique({
          where: { id: session.metadata.testId },
          include: { result: true, user: true },
        })

        if (test?.result) {
          const pdfBuffer = await generatePremiumReport(
            test.result,
            test.user.name || test.user.email,
            test.user.email,
            new Date()
          )

          await prisma.test.update({
            where: { id: test.id },
            data: { pdfReport: pdfBuffer, status: 'COMPLETED' },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
