// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { generatePremiumPDF } from "@/lib/pdf-generator";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
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

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const testId = session.metadata?.testId;

    if (!userId) {
      console.warn("⚠️ No userId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      // 1. Mark user as PREMIUM
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PREMIUM" },
      });

      // 2. If we have a testId, mark it as completed
      if (testId) {
        await prisma.test.update({
          where: { id: testId },
          data: { status: "COMPLETED" },
        });
      }

      // 3. Generate premium PDF report
      if (testId) {
        const latestTest = await prisma.test.findUnique({
          where: { id: testId },
          include: {
            user: { select: { name: true } },
            answers: true,
          },
        });

        if (latestTest) {
          // Fetch all questions
          const questionsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/questions`, {
            cache: "no-store",
          });
          const questionsData = await questionsRes.json();
          const allQuestions = questionsData.questions || [];

          // Attach user answers
          const questionsWithAnswers = allQuestions.map((q: any) => {
            const userAnswerRecord = latestTest.answers.find(
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

          console.log(`✅ Premium PDF generated for user ${userId}, test ${testId}`);
        }
      }

      console.log(`✅ Full payment processing completed for user ${userId}`);
    } catch (error: any) {
      console.error("Error in webhook processing:", error);
    }
  }

  return NextResponse.json({ received: true });
}
