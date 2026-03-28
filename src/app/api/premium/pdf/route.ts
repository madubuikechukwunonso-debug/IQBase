// src/app/api/premium/pdf/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePremiumPDF } from "@/lib/pdf-generator";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the latest completed test – only fields that actually exist in your schema
    const latestTest = await prisma.test.findFirst({
      where: { userId: session.user.id },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        score: true,           // This field exists
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
      return NextResponse.json({ error: "No completed test found" }, { status: 404 });
    }

    // Build minimal result object for the PDF generator
    const resultForPDF = {
      score: latestTest.score || 0,
      breakdown: [], // empty for now – PDF generator will still work
    };

    // Get all questions
    const questionsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/questions`, {
      cache: "no-store",
    });
    const questionsData = await questionsRes.json();
    const allQuestions = questionsData.questions || [];

    // Attach user answers to each question
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
      resultForPDF as any,
      latestTest.user?.name || "Premium User",
      latestTest.id,
      questionsWithAnswers
    );

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="IQBase-Premium-Report-${latestTest.id}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
