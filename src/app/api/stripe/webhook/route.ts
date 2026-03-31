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

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

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
    const testId = session.metadata?.testId;

    if (!userId || !testId) {
      console.error("Missing userId or testId in metadata");
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

      if (!latestTest) {
        console.error("No test found for this payment");
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
        const userAnswerRecord = latestTest.answers?.find((a: any) => a.questionId === q.id);
        return {
          ...q,
          userAnswer: userAnswerRecord ? userAnswerRecord.selectedAnswer : null,
        };
      });

      // === FULL TestResult OBJECT (with all required fields and non-null values) ===
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

      // Generate PDF
      const pdfBytes = await generatePremiumPDF(
        testResultForPDF,
        latestTest.user?.name || "Premium User",
        latestTest.id,
        questionsWithAnswers
      );

      // Save PDF to database
      await prisma.test.update({
        where: { id: testId },
        data: { pdfReport: pdfBytes },
      });

      // Send email with PDF
      await transporter.sendMail({
        from: `"IQBase" <${process.env.EMAIL_SERVER_USER}>`,
        to: latestTest.user?.email,
        subject: "Your Premium IQBase Report is Ready! 🎉",
        html: `
          <h2>Congratulations on unlocking Premium!</h2>
          <p>Hi ${latestTest.user?.name || "there"},</p>
          <p>Your detailed PDF report is attached.</p>
          <p>Thank you for choosing Premium!</p>
        `,
        attachments: [
          {
            filename: `IQBase-Premium-Report-${latestTest.id}.pdf`,
            content: pdfBytes,
            contentType: "application/pdf",
          },
        ],
      });

      console.log(`✅ Premium PDF saved and emailed to ${latestTest.user?.email}`);
    } catch (error: any) {
      console.error("Error in webhook PDF generation/email:", error);
    }
  }

  return NextResponse.json({ received: true });
}
