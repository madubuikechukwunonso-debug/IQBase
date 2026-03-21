import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export const getStripeSession = async ({
  priceId,
  domainUrl,
  customerEmail,
  metadata = {},
}: {
  priceId: string
  domainUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    billing_address_collection: 'auto',
    customer_email: customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${domainUrl}/results?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainUrl}/pricing`,
    metadata,
  })

  return session
}

export const getPaymentStatus = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return session.payment_status
}
