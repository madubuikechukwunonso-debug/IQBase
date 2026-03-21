import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendCertificateEmail(
  to: string,
  pdfBuffer: Buffer,
  iqScore: number,
  userName: string
) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `🎉 Your Official IQBase Certificate – IQ ${iqScore}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Congratulations ${userName}!</h1>
        <p>Your official IQBase certificate is attached.</p>
        <p><strong>IQ Score:</strong> ${iqScore}</p>
        <p>Thank you for choosing the Premium plan. This certificate is verified and official.</p>
        <p>Best regards,<br><strong>The IQBase Team</strong></p>
      </div>
    `,
    attachments: [
      {
        filename: `IQBase-Certificate-${iqScore}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
