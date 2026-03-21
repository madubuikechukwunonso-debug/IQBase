// src/lib/pdf-generator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { TestResult } from '@/types';

export async function generatePremiumReport(
  result: TestResult,
  userName: string,
  userEmail: string,
  testDate: Date
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page.getSize();

  // Fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const primaryColor = rgb(0.2, 0.4, 0.8);
  const darkColor = rgb(0.1, 0.1, 0.1);
  const lightGray = rgb(0.95, 0.95, 0.95);
  const mediumGray = rgb(0.5, 0.5, 0.5);

  // ====================== HEADER WITH LOGO ======================
  // Blue header background
  page.drawRectangle({
    x: 0,
    y: height - 180,
    width: width,
    height: 180,
    color: primaryColor,
  });

  // Logo (from public/logo.png) – centered
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  let logoImage;
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  }

  if (logoImage) {
    const scaledLogo = logoImage.scale(0.45);
    page.drawImage(logoImage, {
      x: (width - scaledLogo.width) / 2,
      y: height - 130,
      width: scaledLogo.width,
      height: scaledLogo.height,
    });
  } else {
    // Fallback text logo if image missing
    page.drawText('IQBase', {
      x: 50,
      y: height - 80,
      size: 42,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText('Official Cognitive Assessment Report', {
    x: 50,
    y: height - 160,
    size: 18,
    font: helvetica,
    color: rgb(1, 1, 1),
  });

  // Certified badge
  page.drawRectangle({
    x: width - 190,
    y: height - 145,
    width: 140,
    height: 110,
    color: rgb(1, 1, 1),
    borderColor: rgb(1, 1, 1),
    borderWidth: 4,
  });
  page.drawText('CERTIFIED', {
    x: width - 175,
    y: height - 95,
    size: 14,
    font: helveticaBold,
    color: primaryColor,
  });

  // ====================== USER INFORMATION ======================
  let yPos = height - 230;

  page.drawText('Participant Information', {
    x: 50,
    y: yPos,
    size: 16,
    font: helveticaBold,
    color: darkColor,
  });
  yPos -= 32;

  page.drawText(`Name: ${userName || 'Valued Participant'}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: helvetica,
    color: darkColor,
  });
  yPos -= 22;

  page.drawText(`Email: ${userEmail}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: helvetica,
    color: darkColor,
  });
  yPos -= 22;

  page.drawText(`Test Date: ${testDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: helvetica,
    color: darkColor,
  });

  // ====================== MAIN IQ SCORE ======================
  yPos -= 65;

  page.drawRectangle({
    x: 50,
    y: yPos - 95,
    width: width - 100,
    height: 115,
    color: lightGray,
  });

  page.drawText('YOUR IQ SCORE', {
    x: 80,
    y: yPos - 25,
    size: 13,
    font: helveticaBold,
    color: mediumGray,
  });

  // Big score
  page.drawText(result.score.toString(), {
    x: 80,
    y: yPos - 82,
    size: 68,
    font: helveticaBold,
    color: primaryColor,
  });

  page.drawText(result.category.toUpperCase(), {
    x: 240,
    y: yPos - 45,
    size: 16,
    font: helveticaBold,
    color: darkColor,
  });

  page.drawText(`Top ${result.percentile}% of test takers`, {
    x: 240,
    y: yPos - 68,
    size: 12,
    font: helvetica,
    color: mediumGray,
  });

  // ====================== CATEGORY BREAKDOWN ======================
  yPos -= 160;
  page.drawText('Category Breakdown', {
    x: 50,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: darkColor,
  });
  yPos -= 35;

  const categories = [
    { label: 'Logical Reasoning', score: result.categoryScores.logical },
    { label: 'Pattern Recognition', score: result.categoryScores.pattern },
    { label: 'Numerical Ability', score: result.categoryScores.numerical },
    { label: 'Processing Speed', score: result.categoryScores.speed },
  ];

  categories.forEach((cat) => {
    page.drawText(cat.label, {
      x: 50,
      y: yPos,
      size: 12,
      font: helvetica,
      color: darkColor,
    });

    page.drawText(`${cat.score}%`, {
      x: 240,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: darkColor,
    });

    // Progress bar
    page.drawRectangle({
      x: 300,
      y: yPos - 6,
      width: 250,
      height: 14,
      color: lightGray,
    });
    page.drawRectangle({
      x: 300,
      y: yPos - 6,
      width: (cat.score / 100) * 250,
      height: 14,
      color: cat.score >= 70 ? rgb(0.2, 0.8, 0.4) : cat.score >= 50 ? rgb(1, 0.75, 0.1) : rgb(0.9, 0.3, 0.3),
    });

    yPos -= 32;
  });

  // ====================== STRENGTHS & WEAKNESSES ======================
  yPos -= 25;

  // Strengths
  page.drawText('Your Strengths', {
    x: 50,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: rgb(0.1, 0.6, 0.3),
  });
  yPos -= 28;
  result.strengths.forEach((strength, i) => {
    page.drawText(`• ${strength}`, {
      x: 60,
      y: yPos,
      size: 11,
      font: helvetica,
      color: darkColor,
    });
    yPos -= 22;
  });

  // Weaknesses
  yPos -= 10;
  page.drawText('Areas for Growth', {
    x: 50,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: rgb(0.8, 0.3, 0.3),
  });
  yPos -= 28;
  result.weaknesses.forEach((weakness, i) => {
    page.drawText(`• ${weakness}`, {
      x: 60,
      y: yPos,
      size: 11,
      font: helvetica,
      color: darkColor,
    });
    yPos -= 22;
  });

  // ====================== FOOTER ======================
  page.drawLine({
    start: { x: 50, y: 70 },
    end: { x: width - 50, y: 70 },
    thickness: 1,
    color: mediumGray,
  });

  page.drawText(
    'This is an official IQBase Premium Report. For informational purposes only.',
    { x: 50, y: 55, size: 9, font: helvetica, color: mediumGray }
  );
  page.drawText('© IQBase - iqbase.com', {
    x: 50,
    y: 40,
    size: 9,
    font: helvetica,
    color: mediumGray,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
