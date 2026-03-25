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

      // Create payment record
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

      // Update test status to completed (works for both Basic and Premium)
      if (session.metadata?.testId) {
        await prisma.test.update({
          where: { id: session.metadata.testId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      }

      // If premium, generate and attach PDF
      if (session.metadata.tier === 'PREMIUM' && session.metadata.testId) {
        const test = await prisma.test.findUnique({
          where: { id: session.metadata.testId },
          include: { user: true },   // ← only valid relation
        })

        if (test) {
          // Construct TestResult object using ONLY fields that exist in your Prisma schema
          const resultForPdf = {
            score: test.score ?? 0,
            percentile: test.percentile ?? 0,
            category: test.category ?? 'General',
            categoryDescription: 'Your cognitive profile shows strong overall performance.',
            categoryColor: '#3b82f6',
            categoryScores: {
              logical: test.logicalScore ?? 0,
              pattern: test.patternScore ?? 0,
              numerical: test.numericalScore ?? 0,
              speed: test.speedScore ?? 0,
            },
            strengths: [],
            weaknesses: [],
            recommendations: [
              'Regular cognitive exercise, adequate sleep, and a healthy diet support optimal brain function.',
              'Consider exploring new learning domains to diversify your cognitive abilities.',
            ],
          }

          const pdfBuffer = await generatePremiumReport(
            resultForPdf,
            test.user?.name || test.user?.email || 'IQBase User',
            test.user?.email || '',
            new Date()
          )

          await prisma.test.update({
            where: { id: test.id },
            data: { 
              pdfReport: pdfBuffer, 
              status: 'COMPLETED' 
            },
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
