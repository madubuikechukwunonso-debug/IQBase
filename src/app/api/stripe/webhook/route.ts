// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { generatePremiumPDF } from "@/lib/pdf-generator";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",   // ← FIXED: must match your installed stripe package
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("No userId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      // Mark user as premium
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PREMIUM" },
      });

      // Get latest test with correct fields
      const latestTest = await prisma.test.findFirst({
        where: { userId },
        orderBy: { completedAt: "desc" },
        select: {
          id: true,
          score: true,
          user: {
            select: { name: true },
          },
          answers: {
            select: {
              questionId: true,
              selectedAnswer: true,
            },
          },
        },
      });

      if (!latestTest) {
        console.error("No test found for user");
        return NextResponse.json({ received: true });
      }

      // Get all questions
      const questionsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/questions`, {
        cache: "no-store",
      });
      const questionsData = await questionsRes.json();
      const allQuestions = questionsData.questions || [];

      // Attach user answers
      const questionsWithAnswers = allQuestions.map((q: any) => {
        const userAnswerRecord = latestTest.answers?.find(
          (a: any) => a.questionId === q.id
        );
        return {
          ...q,
          userAnswer: userAnswerRecord ? userAnswerRecord.selectedAnswer : null,
        };
      });

      // Generate PDF
      const pdfBytes = await generatePremiumPDF(
        { score: latestTest.score || 0, breakdown: [] } as any,
        latestTest.user?.name || "Premium User",
        latestTest.id,
        questionsWithAnswers
      );

      console.log(`✅ Premium PDF generated for user ${userId}, test ${latestTest.id}`);
    } catch (error: any) {
      console.error("Error in webhook PDF generation:", error);
    }
  }

  return NextResponse.json({ received: true });
}
