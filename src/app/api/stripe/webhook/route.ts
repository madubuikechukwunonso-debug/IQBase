// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { generatePremiumPDF } from "@/lib/pdf-generator";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("🔍 FULL METADATA RECEIVED IN WEBHOOK:", session.metadata);

    const userId = session.metadata?.userId;
    const testId = session.metadata?.testId;
    const tierRaw = session.metadata?.tier;
    const tier = tierRaw ? tierRaw.toLowerCase().trim() : "unknown";

    console.log(`📦 Checkout completed → tier: "${tier}" | testId: ${testId} | userId: ${userId}`);

    if (!userId || !testId) {
      console.error("❌ Missing userId or testId in metadata");
      return NextResponse.json({ received: true });
    }

    // Only process Premium tier
    if (tier !== "premium") {
      console.log(`✅ BASIC PLAN DETECTED – no PDF/email needed`);
      return NextResponse.json({ received: true });
    }

    try {
      const latestTest = await prisma.test.findFirst({
        where: { id: testId, userId },
        include: {
          user: { select: { name: true, email: true } },
          answers: true,
        },
      });

      if (!latestTest || !latestTest.user?.email) {
        console.error("❌ Test or user email not found for premium PDF");
        return NextResponse.json({ received: true });
      }

      // Fetch questions + user answers
      const questionsRes = await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/questions`, {
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

      // Generate PDF
      const testResultForPDF = {
        ...latestTest,
        score: latestTest.score ?? 0,
        percentile: latestTest.percentile ?? 50,
        category: latestTest.category ?? "General",
        categoryDescription: latestTest.category || "General IQ Assessment",
        categoryColor: "#8b5cf6",
        categoryScores: {
          logical: latestTest.logicalScore ?? 0,
          pattern: latestTest.patternScore ?? 0,
          numerical: latestTest.numericalScore ?? 0,
          speed: latestTest.speedScore ?? 0,
        },
        strengths: ["Strong analytical thinking", "Good pattern recognition"],
        weaknesses: ["Room for improvement in speed"],
        recommendations: [
          "Practice more numerical reasoning questions",
          "Focus on timed pattern recognition drills",
          "Review logical syllogisms for better accuracy"
        ],
      };

      const pdfBytes = await generatePremiumPDF(
        testResultForPDF,
        latestTest.user?.name || "Premium User",
        latestTest.id,
        questionsWithAnswers
      );

      const pdfBuffer = Buffer.from(pdfBytes);

      // Save PDF to database
      await prisma.test.update({
        where: { id: testId },
        data: { pdfReport: pdfBuffer },
      });

      // ==================== EMAIL SENDING (Fixed like register-magic) ====================
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,   // ← Use the same variable that worked in register-magic
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"IQBase" <${process.env.EMAIL_SERVER_USER}>`,
        to: latestTest.user.email,
        subject: "Your Premium IQBase Report is Ready! 🎉",
        html: `
          <h2>Congratulations on unlocking Premium!</h2>
          <p>Hi ${latestTest.user.name || "there"},</p>
          <p>Your detailed PDF report is attached.</p>
          <p>Thank you for choosing Premium!</p>
        `,
        attachments: [
          {
            filename: `IQBase-Premium-Report-${latestTest.id}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      console.log(`✅ Premium PDF generated and emailed to ${latestTest.user.email}`);

    } catch (error: any) {
      console.error("❌ Error in webhook PDF/email processing:", error);
    }
  }

  return NextResponse.json({ received: true });
}
