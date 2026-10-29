/**
 * referralEmailService.js
 *
 * All email notifications related to the referral cashout flow:
 *
 *  sendCashoutRequestAdminEmail  → admin notified at info@pax26.com when user requests cashout
 *  sendCashoutRequestUserEmail   → user notified their request is received and pending
 *  sendCashoutPaidUserEmail      → user notified when admin marks request as paid
 *  sendCashoutRejectedUserEmail  → user notified when admin rejects request
 */

import sendpulse from "@/app/lib/sendpulse";

const FROM_EMAIL     = { name: "Pax26", email: "info@pax26.com" };
const ADMIN_EMAIL    = "info@pax26.com";
const REFERRAL_URL   = "https://www.pax26.com/dashboard/referral";
const YEAR           = () => new Date().getFullYear();
const NG_TIME        = () => new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });
const fmt            = (n) => `₦${(n || 0).toLocaleString("en-NG")}`;

/* ── Shared HTML shell (matches transactionalEmailService pattern) ── */
function shell({ headerGradient, headerIcon, headerTitle, headerSub, body, footerNote }) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,-apple-system,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:${headerGradient};padding:28px 32px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
          <span style="font-size:20px;">⚡</span>
          <span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.02em;">Pax26</span>
        </div>
        <h1 style="color:#fff;margin:16px 0 4px;font-size:22px;font-weight:900;letter-spacing:-0.03em;">${headerTitle}</h1>
        <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">${headerSub}</p>
      </td></tr>
      <tr><td style="padding:28px 32px;">${body}</td></tr>
      <tr><td style="background:#f8f8f6;padding:16px 32px;text-align:center;border-top:1px solid #e8e8e6;">
        <p style="color:#bbb;font-size:11px;margin:0;">${footerNote}</p>
        <p style="color:#bbb;font-size:11px;margin:4px 0 0;">© ${YEAR()} Pax26 Technologies · AI-powered WhatsApp Commerce</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`.trim();
}

/* ── Shared sendpulse SMTP sender ─────────────────────────────── */
function sendEmail({ toEmail, toName, subject, html }) {
  return new Promise((resolve) => {
    const message = {
      html,
      subject,
      from: FROM_EMAIL,
      to: [{ name: toName || toEmail, email: toEmail }],
    };
    sendpulse.smtpSendMail((result) => {
      if (result?.result === true) {
        console.log(`[referralEmail] ✅ Sent "${subject}" → ${toEmail}`);
      } else {
        console.warn(`[referralEmail] ⚠️ Failed "${subject}" → ${toEmail}:`, JSON.stringify(result));
      }
      resolve(result);
    }, message);
  });
}

/* ═══════════════════════════════════════════════════════
   1. Admin notification — new cashout request received
═══════════════════════════════════════════════════════ */
export async function sendCashoutRequestAdminEmail({ user, amount, cashoutRequest }) {
  try {
    const adminUrl = `https://pax26-admin.vercel.app/referrals`;
    const html = shell({
      headerGradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      headerIcon: "💸",
      headerTitle: "New Cashout Request",
      headerSub: `Action required — a referral partner has requested a bank payout`,
      body: `
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">A user has submitted a referral cashout request that requires your approval.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e2e8f0;">
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">User</span><br/>
            <span style="color:#111827;font-size:15px;font-weight:700;">${user.name || "Unknown"}</span>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Email</span><br/>
            <span style="color:#111827;font-size:14px;">${user.email}</span>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Amount Requested</span><br/>
            <span style="color:#16a34a;font-size:20px;font-weight:900;">${fmt(amount)}</span>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Bank</span><br/>
            <span style="color:#111827;font-size:14px;">${cashoutRequest.bankDetails.bankName}</span>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Account Number</span><br/>
            <span style="color:#111827;font-size:14px;font-family:monospace;letter-spacing:0.1em;">${cashoutRequest.bankDetails.accountNumber}</span>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Account Name</span><br/>
            <span style="color:#111827;font-size:14px;">${cashoutRequest.bankDetails.accountName}</span>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Requested At</span><br/>
            <span style="color:#111827;font-size:13px;">${NG_TIME()}</span>
          </td></tr>
        </table>

        <div style="text-align:center;">
          <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:-0.01em;">
            Review in Admin Panel →
          </a>
        </div>
      `,
      footerNote: "This is an automated alert from the Pax26 platform. Log in to the admin panel to action this request.",
    });

    await sendEmail({
      toEmail: ADMIN_EMAIL,
      toName: "Pax26 Admin",
      subject: `💸 Cashout Request — ${fmt(amount)} from ${user.name || user.email}`,
      html,
    });
  } catch (err) {
    console.error("[referralEmail] sendCashoutRequestAdminEmail error:", err?.message);
  }
}

/* ═══════════════════════════════════════════════════════
   2. User confirmation — request received, pending review
═══════════════════════════════════════════════════════ */
export async function sendCashoutRequestUserEmail({ user, amount }) {
  try {
    const firstName = (user.name || "there").split(" ")[0];
    const html = shell({
      headerGradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
      headerIcon: "🎉",
      headerTitle: "Cashout Request Received!",
      headerSub: "We've got your request and we're on it",
      body: `
        <p style="color:#374151;font-size:16px;margin:0 0 8px;font-weight:700;">Hey ${firstName}! 👋</p>
        <p style="color:#374151;font-size:14px;margin:0 0 20px;line-height:1.7;">
          Your referral cashout request of <strong style="color:#0f766e;">${fmt(amount)}</strong> has been received and is now under review.
          Our team typically processes cashouts within 1–3 business days.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
          <tr><td>
            <p style="color:#166534;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">What happens next</p>
            <p style="color:#374151;font-size:13px;margin:0 0 6px;line-height:1.6;">✅ Your request is now <strong>pending review</strong></p>
            <p style="color:#374151;font-size:13px;margin:0 0 6px;line-height:1.6;">🏦 Our team will transfer <strong>${fmt(amount)}</strong> to your bank account</p>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.6;">📧 You'll receive a confirmation email once it's done</p>
          </td></tr>
        </table>

        <p style="color:#6b7280;font-size:13px;margin:0 0 20px;line-height:1.7;">
          Questions? Reply to this email or visit your referral dashboard anytime.
        </p>

        <div style="text-align:center;">
          <a href="${REFERRAL_URL}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
            View Referral Dashboard →
          </a>
        </div>
      `,
      footerNote: "Thank you for being a Pax26 referral partner. We appreciate you spreading the word!",
    });

    await sendEmail({
      toEmail: user.email,
      toName: user.name || "Pax26 User",
      subject: `Your ${fmt(amount)} cashout request is being processed 🎉`,
      html,
    });
  } catch (err) {
    console.error("[referralEmail] sendCashoutRequestUserEmail error:", err?.message);
  }
}

/* ═══════════════════════════════════════════════════════
   3. User paid — admin confirmed payment
═══════════════════════════════════════════════════════ */
export async function sendCashoutPaidUserEmail({ user, amount, adminNote }) {
  try {
    const firstName = (user.name || "there").split(" ")[0];
    const html = shell({
      headerGradient: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
      headerIcon: "💰",
      headerTitle: "Your Money is on the Way!",
      headerSub: "Cashout confirmed — payment sent to your bank",
      body: `
        <p style="color:#374151;font-size:16px;margin:0 0 8px;font-weight:700;">Congratulations ${firstName}! 🥳</p>
        <p style="color:#374151;font-size:14px;margin:0 0 20px;line-height:1.7;">
          Your referral cashout of <strong style="color:#15803d;font-size:18px;">${fmt(amount)}</strong> has been approved and sent to your bank account.
          You've earned this — thank you for being an amazing Pax26 ambassador! 🙌
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #86efac;">
          <tr><td>
            <p style="color:#166534;font-size:22px;font-weight:900;margin:0 0 4px;text-align:center;">${fmt(amount)}</p>
            <p style="color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0;text-align:center;">Paid to your bank account</p>
            ${adminNote ? `<p style="color:#374151;font-size:13px;margin:12px 0 0;text-align:center;font-style:italic;">"${adminNote}"</p>` : ""}
          </td></tr>
        </table>

        <p style="color:#374151;font-size:14px;margin:0 0 12px;line-height:1.7;">
          Keep sharing your referral link — every new subscriber earns you more. Your next payout is just a few referrals away! 🚀
        </p>

        <p style="color:#6b7280;font-size:13px;margin:0 0 20px;line-height:1.7;">
          It may take 1–2 business days to appear in your account depending on your bank. If you have any issues, reply to this email.
        </p>

        <div style="text-align:center;">
          <a href="${REFERRAL_URL}" style="display:inline-block;background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Refer More · Earn More →
          </a>
        </div>
      `,
      footerNote: "This payment confirmation is from Pax26 Technologies. Keep your referral link active to earn more.",
    });

    await sendEmail({
      toEmail: user.email,
      toName: user.name || "Pax26 User",
      subject: `💰 ${fmt(amount)} paid to your bank account — Pax26 Referral`,
      html,
    });
  } catch (err) {
    console.error("[referralEmail] sendCashoutPaidUserEmail error:", err?.message);
  }
}

/* ═══════════════════════════════════════════════════════
   4. User rejected — with balance refunded
═══════════════════════════════════════════════════════ */
export async function sendCashoutRejectedUserEmail({ user, amount, adminNote }) {
  try {
    const firstName = (user.name || "there").split(" ")[0];
    const html = shell({
      headerGradient: "linear-gradient(135deg, #9a3412 0%, #f97316 100%)",
      headerIcon: "ℹ️",
      headerTitle: "Cashout Request Update",
      headerSub: "Your balance has been returned to your referral wallet",
      body: `
        <p style="color:#374151;font-size:16px;margin:0 0 8px;font-weight:700;">Hi ${firstName},</p>
        <p style="color:#374151;font-size:14px;margin:0 0 20px;line-height:1.7;">
          We weren't able to process your cashout request of <strong>${fmt(amount)}</strong> at this time.
          Don't worry — your balance has been <strong>fully refunded</strong> to your referral wallet.
        </p>

        ${adminNote ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid #fed7aa;">
          <tr><td>
            <p style="color:#9a3412;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Note from our team</p>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.6;font-style:italic;">"${adminNote}"</p>
          </td></tr>
        </table>` : ""}

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid #e2e8f0;">
          <tr><td>
            <p style="color:#374151;font-size:13px;margin:0 0 6px;line-height:1.6;">✅ <strong>${fmt(amount)}</strong> has been returned to your referral wallet</p>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.6;">📞 Reply to this email if you need to resolve any account issues</p>
          </td></tr>
        </table>

        <p style="color:#6b7280;font-size:13px;margin:0 0 20px;line-height:1.7;">
          You can submit a new cashout request once any outstanding requirements are met. We're here to help!
        </p>

        <div style="text-align:center;">
          <a href="${REFERRAL_URL}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
            View Referral Wallet →
          </a>
        </div>
      `,
      footerNote: "Questions about this decision? Reply to this email and our team will assist you.",
    });

    await sendEmail({
      toEmail: user.email,
      toName: user.name || "Pax26 User",
      subject: `Cashout request update — your balance has been refunded`,
      html,
    });
  } catch (err) {
    console.error("[referralEmail] sendCashoutRejectedUserEmail error:", err?.message);
  }
}
