// src/lib/pdf-generator.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface QuestionWithAnswer {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer: number | null;
  imageUrl?: string | null;
}

export async function generatePremiumPDF(
  result: any,
  userName: string = "Premium User",
  testId: string,
  questions: QuestionWithAnswer[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const { width } = page.getSize();
  let y = 750;

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // HEADER
  page.drawText('IQBase', { x: 50, y, size: 48, font: helveticaBold, color: rgb(0.55, 0.2, 0.9) });
  y -= 55;
  page.drawText('Premium Cognitive Assessment Report', { x: 50, y, size: 20, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 55;

  // User info with better spacing
  page.drawText(`Name: ${userName}`, { x: 50, y, size: 13, font: helvetica });
  y -= 28;
  page.drawText(`Test ID: ${testId}`, { x: 50, y, size: 13, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
  y -= 28;
  page.drawText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: 50, y, size: 11, font: helvetica, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 45;

  // BIG SCORE BOX
  y = 505;
  page.drawRectangle({
    x: 50,
    y: y - 10,
    width: 495,
    height: 110,
    borderColor: rgb(0.55, 0.2, 0.9),
    borderWidth: 6,
    color: rgb(1, 1, 1),
  });
  page.drawText(result.score.toString(), { x: 90, y: y + 30, size: 82, font: helveticaBold, color: rgb(0.55, 0.2, 0.9) });
  page.drawText('OVERALL IQ SCORE', { x: 250, y: y + 55, size: 18, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });

  // DETAILED REVIEW
  y = 370;
  page.drawText('Detailed Question Review', { x: 50, y, size: 18, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 55;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // New page if close to bottom
    if (y < 220) {
      page = pdfDoc.addPage([595, 842]);
      y = 750;
    }

    // Question
    page.drawText(`Q${i + 1}. ${q.question}`, {
      x: 50,
      y,
      size: 11,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 495,
      lineHeight: 14,
    });
    y -= 68;

    // User answer (red)
    const userOpt = q.userAnswer !== null && q.userAnswer >= 0 ? q.options[q.userAnswer] : "No answer (timed out)";
    page.drawText(`Your answer: ${userOpt}`, { x: 70, y, size: 10, font: helvetica, color: rgb(0.8, 0.2, 0.2) });
    y -= 32;

    // Correct answer (green)
    const correctOpt = q.options[q.correctAnswer];
    page.drawText(`Correct answer: ${correctOpt}`, { x: 70, y, size: 10, font: helvetica, color: rgb(0.1, 0.6, 0.1) });
    y -= 32;

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
    y -= 125; // ← Extra generous spacing to prevent overlap
  }

  // FOOTER
  const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
  lastPage.drawText('Digitally Signed by IQBase', { x: 50, y: 90, size: 14, font: helveticaBold, color: rgb(0.55, 0.2, 0.9) });
  lastPage.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: 65, size: 11, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
