import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all fields (Email, Subject, Message)." },
        { status: 400 }
      );
    }

    // Send email to cnbhuvan011@gmail.com via Google SMTP
    await sendEmail({
      to: "cnbhuvan011@gmail.com",
      subject: `[Cloud AIF Support Inquiry] ${subject}`,
      text: `You have received a new support message from Cloud AIF:\n\n` +
            `Sender Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `Message:\n${message}\n\n` +
            `--- \nThis email was sent automatically from the Cloud AIF Support Contact form.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #14331f; border-bottom: 2px solid #14331f; padding-bottom: 8px; margin-top: 0;">New Support Inquiry</h2>
          <p><strong>From:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #f1f5f9; margin-top: 15px; white-space: pre-wrap; color: #334155;">
            ${message}
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">Sent automatically from the Cloud AIF Support contact form.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: "Support inquiry sent successfully!" });
  } catch (error: any) {
    console.error("[api/support] Error handling support message:", error);
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 });
  }
}
