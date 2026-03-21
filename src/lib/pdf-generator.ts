import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { TestResult } from '@/types'

export async function generatePremiumReport(
  result: TestResult,
  userName: string,
  userEmail: string,
  testDate: Date
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size

  const { width, height } = page.getSize()

  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors
  const primaryColor = rgb(0.2, 0.4, 0.8)
  const darkColor = rgb(0.1, 0.1, 0.1)
  const lightGray = rgb(0.9, 0.9, 0.9)
  const mediumGray = rgb(0.5, 0.5, 0.5)

  // Header Background
  page.drawRectangle({
    x: 0,
    y: height - 180,
    width: width,
    height: 180,
    color: primaryColor,
  })

  // Logo / Title
  page.drawText('IQBase', {
    x: 50,
    y: height - 60,
    size: 36,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('Cognitive Assessment Report', {
    x: 50,
    y: height - 100,
    size: 18,
    font: helvetica,
    color: rgb(1, 1, 1),
  })

  // Certificate Badge
  page.drawRectangle({
    x: width - 180,
    y: height - 140,
    width: 130,
    height: 100,
    color: rgb(1, 1, 1),
    borderColor: primaryColor,
    borderWidth: 3,
  })

  page.drawText('CERTIFIED', {
    x: width - 165,
    y: height - 85,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText('COGNITIVE', {
    x: width - 165,
    y: height - 105,
    size: 10,
    font: helvetica,
    color: mediumGray,
  })

  page.drawText('PROFILE', {
    x: width - 165,
    y: height - 120,
    size: 10,
    font: helvetica,
    color: mediumGray,
  })

  // User Info Section
  let yPos = height - 220

  page.drawText('Participant Information', {
    x: 50,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: darkColor,
  })

  yPos -= 30

  page.drawText(`Name: ${userName || 'Not provided'}`, {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkColor,
  })

  yPos -= 20

  page.drawText(`Email: ${userEmail}`, {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkColor,
  })

  yPos -= 20

  page.drawText(`Test Date: ${testDate.toLocaleDateString()}`, {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkColor,
  })

  // Score Section
  yPos -= 50

  page.drawRectangle({
    x: 50,
    y: yPos - 80,
    width: width - 100,
    height: 100,
    color: lightGray,
  })

  page.drawText('COGNITIVE SCORE', {
    x: 80,
    y: yPos - 30,
    size: 12,
    font: helveticaBold,
    color: mediumGray,
  })

  page.drawText(result.score.toString(), {
    x: 80,
    y: yPos - 75,
    size: 48,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText(result.category.toUpperCase(), {
    x: 200,
    y: yPos - 50,
    size: 14,
    font: helveticaBold,
    color: darkColor,
  })

  page.drawText(`Percentile: ${result.percentile}%`, {
    x: 200,
    y: yPos - 70,
    size: 11,
    font: helvetica,
    color: mediumGray,
  })

  // Category Breakdown
  yPos -= 140

  page.drawText('Category Breakdown', {
    x: 50,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: darkColor,
  })

  yPos -= 40

  const categories = [
    { label: 'Logical Reasoning', score: result.categoryScores.logical },
    { label: 'Pattern Recognition', score: result.categoryScores.pattern },
    { label: 'Numerical Ability', score: result.categoryScores.numerical },
    { label: 'Processing Speed', score: result.categoryScores.speed },
  ]

  categories.forEach((cat) => {
    // Label
    page.drawText(cat.label, {
      x: 50,
      y: yPos,
      size: 11,
      font: helvetica,
      color: darkColor,
    })

    // Score
    page.drawText(`${cat.score}%`, {
      x: 200,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: darkColor,
    })

    // Bar background
    page.drawRectangle({
      x: 260,
      y: yPos - 5,
      width: 300,
      height: 12,
      color: lightGray,
    })

    // Bar fill
    page.drawRectangle({
      x: 260,
      y: yPos - 5,
      width: (cat.score / 100) * 300,
      height: 12,
      color:
        cat.score >= 70
          ? rgb(0.2, 0.8, 0.4)
          : cat.score >= 50
          ? rgb(1, 0.8, 0.2)
          : rgb(0.9, 0.3, 0.3),
    })

    yPos -= 30
  })

  // Interpretation
  yPos -= 20

  page.drawText('Interpretation', {
    x: 50,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: darkColor,
  })

  yPos -= 30

  // Wrap description text
  const description = result.categoryDescription
  const words = description.split(' ')
  let line = ''
  const maxWidth = 500

  words.forEach((word) => {
    const testLine = line + word + ' '
    const testWidth = helvetica.widthOfTextAtSize(testLine, 10)

    if (testWidth > maxWidth && line !== '') {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 10,
        font: helvetica,
        color: darkColor,
      })
      yPos -= 15
      line = word + ' '
    } else {
      line = testLine
    }
  })

  if (line !== '') {
    page.drawText(line, {
      x: 50,
      y: yPos,
      size: 10,
      font: helvetica,
      color: darkColor,
    })
  }

  // Footer
  page.drawLine({
    start: { x: 50, y: 80 },
    end: { x: width - 50, y: 80 },
    thickness: 1,
    color: lightGray,
  })

  page.drawText(
    'This report is for informational purposes only and does not constitute a clinical diagnosis.',
    {
      x: 50,
      y: 60,
      size: 8,
      font: helvetica,
      color: mediumGray,
    }
  )

  page.drawText('Generated by IQBase - iqbase.com', {
    x: 50,
    y: 45,
    size: 8,
    font: helvetica,
    color: mediumGray,
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
