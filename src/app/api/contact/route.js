import { NextResponse } from "next/server";
import sendpulse from "@/app/lib/sendpulse";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const { name, email, message, phone } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full Name is required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid Email Address is required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Message content is required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const safeName = name.trim();
    const safeEmail = email.trim();
    const safeMessage = message.trim();
    const safePhone = phone ? phone.trim() : "";

    // 1. Send Email Notification to info@pax26.com
    const adminEmailPayload = {
      subject: `[Contact Form] Message from ${safeName}`,
      from: {
        name: `${safeName} (Pax26 Contact Form)`,
        email: "info@pax26.com",
      },
      to: [
        {
          name: "Pax26 Support",
          email: "info@pax26.com",
        },
      ],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
            <h2 style="color: #3b82f6; margin: 0; font-size: 20px;">New Contact Message</h2>
            <span style="font-size: 12px; color: #6b7280; font-family: monospace;">Pax26 Platform</span>
          </div>

          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>From:</strong> ${safeName}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #3b82f6;">${safeEmail}</a></p>
            ${safePhone ? `<p style="margin: 0; font-size: 14px;"><strong>Phone:</strong> ${safePhone}</p>` : ""}
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message Details:</h4>
            <div style="background: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1f2937;">
              ${safeMessage}
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Sent via Pax26 Contact Form on ${new Date().toLocaleString()}. You can reply directly to <a href="mailto:${safeEmail}">${safeEmail}</a>.</p>
          </div>
        </div>
      `,
    };

    // Send Admin Email via SendPulse
    const adminEmailSuccess = await new Promise((resolve) => {
      try {
        sendpulse.smtpSendMail((result) => {
          if (result && result.result === true) {
            resolve(true);
          } else {
            console.error("SendPulse admin mail failed:", result);
            resolve(false);
          }
        }, adminEmailPayload);
      } catch (err) {
        console.error("SendPulse admin exception:", err);
        resolve(false);
      }
    });

    // 2. Send Automated Confirmation Email to the User
    const autoReplyPayload = {
      subject: "We received your message — Pax26 Support",
      from: {
        name: "Pax26 Support",
        email: "info@pax26.com",
      },
      to: [
        {
          name: safeName,
          email: safeEmail,
        },
      ],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #3b82f6; margin-top: 0;">Thank you for contacting Pax26!</h2>
          <p style="font-size: 14px; line-height: 1.6;">Hello ${safeName},</p>
          <p style="font-size: 14px; line-height: 1.6;">We have received your enquiry. Our support team will review your message and get back to you at <strong>${safeEmail}</strong> within 2 hours.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase;">Your Message:</p>
            <p style="margin: 0; font-size: 13px; font-style: italic; color: #374151; white-space: pre-wrap;">"${safeMessage}"</p>
          </div>

          <p style="font-size: 14px; line-height: 1.6;">Best regards,<br/><strong>Pax26 Support Team</strong><br/><a href="https://pax26.com" style="color: #3b82f6;">https://pax26.com</a></p>
        </div>
      `,
    };

    // Send User Auto-Reply (fire and forget / async)
    try {
      sendpulse.smtpSendMail(() => {}, autoReplyPayload);
    } catch (err) {
      console.error("Auto-reply trigger error:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully to info@pax26.com! We will get back to you shortly.",
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while sending your message. Please try again." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
