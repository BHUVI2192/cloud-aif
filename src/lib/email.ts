import nodemailer from "nodemailer";

// Retrieve config from env variables
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const smtpUser = process.env.SMTP_USER; // Your Gmail address (e.g., info@cloudaif.in)
const smtpPass = process.env.SMTP_PASS; // Google App Password (not your normal password)
const fromEmail = process.env.SMTP_FROM || smtpUser || "no-reply@cloudaif.in";

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for port 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email using Google SMTP.
 * Fails silently in development if credentials are not configured, so it doesn't crash the app.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  if (!smtpUser || !smtpPass) {
    console.warn(
      `[email] SMTP credentials missing (SMTP_USER / SMTP_PASS). Skipping email dispatch to: ${to}`
    );
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Cloud AIF" <${fromEmail}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });

    console.log(`[email] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[email] Error sending email to ${to}:`, error);
  }
}
