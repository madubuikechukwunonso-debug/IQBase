// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { generatePremiumPDF } from "@/lib/pdf-generator";   // ← FIXED import
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const testId = session.metadata?.testId;   // optional if you pass it

    if (!userId) {
      console.error("No userId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      // Mark user as premium (or create premium record)
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PREMIUM" },   // or whatever flag you use
      });

      // Get the user's latest test result
      const latestTest = await prisma.test.findFirst({
        where: { userId },
        orderBy: { completedAt: "desc" },
        include: { result: true },
      });

      if (!latestTest) {
        console.error("No test found for user");
        return NextResponse.json({ received: true });
      }

      // Get full questions with user answers
      const questionsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/questions`, {
        cache: "no-store",
      });
      const questionsData = await questionsRes.json();
      const allQuestions = questionsData.questions || [];

      const questionsWithAnswers = allQuestions.map((q: any) => {
        const userAnswerRecord = latestTest.answers?.find((a: any) => a.questionId === q.id);
        return {
          ...q,
          userAnswer: userAnswerRecord ? userAnswerRecord.selectedAnswer : null,
        };
      });

      // Generate the PDF
      const pdfBytes = await generatePremiumPDF(
        latestTest.result as any,
        latestTest.user?.name || "Premium User",
        latestTest.id,
        questionsWithAnswers
      );

      // Optional: You can store the PDF in DB or send via email here if needed

      console.log(`✅ Premium PDF generated for user ${userId}, test ${latestTest.id}`);
    } catch (error: any) {
      console.error("Error in webhook PDF generation:", error);
    }
  }

  return NextResponse.json({ received: true });
}
