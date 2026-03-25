import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { priceId, email, testId, tier } = await req.json()

    if (!priceId || !email) {
      return NextResponse.json({ error: 'Price ID and email required' }, { status: 400 })
    }

    const domainUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      billing_address_collection: 'auto',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${domainUrl}/results?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/pricing`,
      metadata: {
        testId: testId || '',      // ← now guaranteed to be passed
        email: email,
        tier: tier || 'BASIC',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
