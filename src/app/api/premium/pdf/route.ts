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
    // Get the latest paid test for this user
    const latestTest = await prisma.test.findFirst({
      where: {
        userId: session.user.id,
        // You can add a paid flag here if you have one
      },
      orderBy: { completedAt: "desc" },
      include: {
        user: true,
      },
    });

    if (!latestTest) {
      return NextResponse.json({ error: "No completed test found" }, { status: 404 });
    }

    // You need to pass the full questions array with user answers.
    // For simplicity, we fetch them again or you can store them in the test record.
    const questionsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/questions`, { cache: "no-store" });
    const questionsData = await questionsRes.json();
    const allQuestions = questionsData.questions || [];

    // Match questions to the user's answers (you may need to adjust this part if your DB structure is different)
    const questionsWithAnswers = allQuestions.map((q: any) => {
      const userAnswerRecord = latestTest.answers?.find((a: any) => a.questionId === q.id);
      return {
        ...q,
        userAnswer: userAnswerRecord ? userAnswerRecord.selectedAnswer : null,
      };
    });

    const pdfBytes = await generatePremiumPDF(
      latestTest.result as any,           // your TestResult
      session.user.name || "Premium User",
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
