import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";
import { FeedbackModel } from "@/app/ults/models/FeedbackModel";
import { sendTransactionalEmail } from "@/app/ults/utils/sendpulseMail";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).select("name email isAdmin").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin accounts cannot be deleted through this form." },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { reason } = await req.json().catch(() => ({}));
    const safeName   = user.name  || "Unknown";
    const safeEmail  = user.email || "Unknown";
    const safeReason = reason?.trim() || "No reason provided";
    const requestedAt = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });

    // 1. Save to admin dashboard Feedback inbox
    try {
      await FeedbackModel.create({
        type:    "contact",
        user:    safeName,
        email:   safeEmail,
        subject: `⚠️ Account Deletion Request — ${safeName}`,
        text:    `User has requested account deletion.\n\nEmail: ${safeEmail}\nReason: ${safeReason}\nRequested at: ${requestedAt}`,
        status:  "new",
      });
    } catch (dbErr) {
      console.error("[delete-account] FeedbackModel save error:", dbErr);
    }

    // 2. Notify admin at info@pax26.com
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;padding:24px;color:#111827;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
        <div style="border-bottom:2px solid #ef4444;padding-bottom:12px;margin-bottom:20px;">
          <h2 style="color:#ef4444;margin:0;font-size:20px;">⚠️ Account Deletion Request</h2>
          <span style="font-size:12px;color:#6b7280;font-family:monospace;">Pax26 Platform · ${requestedAt}</span>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#ef4444;">${safeEmail}</a></p>
          <p style="margin:0;font-size:14px;"><strong>User ID:</strong> <code style="font-size:12px;background:#fee2e2;padding:2px 6px;border-radius:4px;">${userId}</code></p>
        </div>
        <div style="margin-bottom:20px;">
          <h4 style="margin:0 0 8px;color:#374151;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Reason given:</h4>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;font-size:14px;color:#1f2937;line-height:1.6;">${safeReason}</div>
        </div>
        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px;font-size:13px;color:#713f12;">
          <strong>Action required:</strong> Log in to the admin panel and navigate to Users → find this account to process the deletion within 30 days.
        </div>
        <div style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:20px;font-size:12px;color:#6b7280;">
          Submitted via Pax26 Delete Account page.
        </div>
      </div>
    `;

    await sendTransactionalEmail({
      toEmail:      "info@pax26.com",
      toName:       "Pax26 Admin",
      subject:      `⚠️ [Delete Account] Request from ${safeName} (${safeEmail})`,
      html:         adminHtml,
      text:         `Account deletion request from ${safeName} (${safeEmail}).\nUser ID: ${userId}\nReason: ${safeReason}`,
      fromEmail:    "info@pax26.com",
      fromName:     "Pax26 Platform",
      replyToEmail: safeEmail,
      replyToName:  safeName,
    });

    // Also notify secondary admin
    sendTransactionalEmail({
      toEmail:      "asehindej@gmail.com",
      toName:       "Pax26 Admin",
      subject:      `⚠️ [Delete Account] Request from ${safeName} (${safeEmail})`,
      html:         adminHtml,
      text:         `Account deletion request from ${safeName} (${safeEmail}).\nUser ID: ${userId}\nReason: ${safeReason}`,
      fromEmail:    "info@pax26.com",
      fromName:     "Pax26 Platform",
    }).catch(() => {});

    // 3. Confirm to the user
    const userHtml = `
      <div style="font-family:Arial,sans-serif;padding:24px;color:#111827;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
        <h2 style="color:#3b82f6;margin-top:0;">Account Deletion Request Received</h2>
        <p style="font-size:14px;line-height:1.6;">Hello ${safeName},</p>
        <p style="font-size:14px;line-height:1.6;">
          We have received your request to delete your Pax26 account (<strong>${safeEmail}</strong>).
          Our team will process this within <strong>30 days</strong> and send you a confirmation once complete.
        </p>
        <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:4px;padding:14px;margin:20px 0;font-size:13px;color:#1e40af;line-height:1.6;">
          <strong>What happens next:</strong><br/>
          Your account, store data, products, and conversation history will be permanently deleted.
          Any active subscription will be cancelled. This action cannot be undone.
        </div>
        <p style="font-size:14px;line-height:1.6;">
          If you submitted this request by mistake or changed your mind, please reply to this email or
          contact us at <a href="mailto:info@pax26.com" style="color:#3b82f6;">info@pax26.com</a> as soon as possible.
        </p>
        <p style="font-size:14px;line-height:1.6;">
          Best regards,<br/><strong>Pax26 Support Team</strong><br/>
          <a href="https://www.pax26.com" style="color:#3b82f6;">pax26.com</a>
        </p>
      </div>
    `;

    sendTransactionalEmail({
      toEmail:   safeEmail,
      toName:    safeName,
      subject:   "Your Pax26 account deletion request has been received",
      html:      userHtml,
      text:      `Hello ${safeName},\n\nWe received your request to delete your Pax26 account. We will process it within 30 days.\n\nIf this was a mistake, reply to this email immediately.\n\nPax26 Support`,
      fromEmail: "info@pax26.com",
      fromName:  "Pax26 Support",
    }).catch(err => console.error("[delete-account] User confirm email error:", err));

    return NextResponse.json(
      { success: true, message: "Your deletion request has been submitted. We will process it within 30 days." },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("[delete-account] Error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again or contact info@pax26.com." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
