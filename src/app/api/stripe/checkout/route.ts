// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getUser } from "@/lib/session"

export async function POST(req: NextRequest) {
  try {
    const { priceId, testId, tier } = await req.json()

    // Get the authenticated user
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    const domainUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "auto",
      customer_email: user.email || undefined,   // ← Fixed: never null
      line_items: [{ price: priceId, quantity: 1 }],

      // Use payment-success page so session has time to load
      success_url: `${domainUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/pricing`,

      metadata: {
        userId: user.id,           // ← Critical for webhook
        testId: testId || "",
        tier: tier || "BASIC",
        email: user.email || "",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
