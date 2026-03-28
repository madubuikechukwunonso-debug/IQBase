// src/lib/pdf-generator.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TestResult } from '@/types';

interface QuestionWithAnswer {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer: number | null;   // index of user's choice (-1 = timed out)
  imageUrl?: string | null;
}

export async function generatePremiumPDF(
  result: TestResult,
  userName: string = "Premium User",
  testId: string,
  questions: QuestionWithAnswer[]   // ← Pass full questions + user answers here
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Light background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.98, 0.98),
  });

  // === LOGO + HEADER ===
  page.drawText('IQBase', {
    x: 50,
    y: height - 80,
    size: 48,
    font: helveticaBold,
    color: rgb(0.55, 0.2, 0.9), // your purple brand color
  });

  page.drawText('Premium Cognitive Assessment Report', {
    x: 50,
    y: height - 130,
    size: 20,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // User info
  let y = height - 190;
  page.drawText(`Name: ${userName}`, { x: 50, y, size: 14, font: helvetica });
  y -= 25;
  page.drawText(`Test ID: ${testId}`, { x: 50, y, size: 12, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  y -= 25;
  page.drawText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: 50,
    y,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Big score box
  y = height - 300;
  page.drawRectangle({
    x: 50,
    y: y - 10,
    width: 495,
    height: 110,
    borderColor: rgb(0.55, 0.2, 0.9),
    borderWidth: 6,
    color: rgb(1, 1, 1),
  });

  page.drawText(result.score.toString(), {
    x: 90,
    y: y + 30,
    size: 82,
    font: helveticaBold,
    color: rgb(0.55, 0.2, 0.9),
  });

  page.drawText('OVERALL IQ SCORE', {
    x: 250,
    y: y + 55,
    size: 18,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  // === PER-QUESTION BREAKDOWN ===
  y = height - 430;
  page.drawText('Detailed Question Review', {
    x: 50,
    y,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 40;

  questions.forEach((q, i) => {
    // Question number + text
    page.drawText(`Q${i + 1}. ${q.question}`, {
      x: 50,
      y,
      size: 11,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 495,
      lineHeight: 14,
    });
    y -= 45;

    // User's answer
    const userOpt = q.userAnswer !== null && q.userAnswer >= 0 ? q.options[q.userAnswer] : "No answer (timed out)";
    page.drawText(`Your answer: ${userOpt}`, {
      x: 70,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 20;

    // Correct answer
    const correctOpt = q.options[q.correctAnswer];
    page.drawText(`Correct answer: ${correctOpt}`, {
      x: 70,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.1, 0.6, 0.1),
    });
    y -= 20;

    // Explanation
    page.drawText(q.explanation, {
      x: 70,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
      maxWidth: 460,
      lineHeight: 13,
    });
    y -= 55;

    // Divider
    if (i < questions.length - 1) {
      page.drawLine({
        start: { x: 50, y: y + 10 },
        end: { x: 545, y: y + 10 },
        thickness: 1,
        color: rgb(0.9, 0.9, 0.9),
      });
      y -= 10;
    }
  });

  // === SIGNATURE LINE ===
  y = 90;
  page.drawText('Digitally Signed by IQBase', {
    x: 50,
    y,
    size: 14,
    font: helveticaBold,
    color: rgb(0.55, 0.2, 0.9),
  });
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: y - 25,
    size: 11,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Final save
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
