/**
 * salesAlertService.js
 *
 * Sends the seller an email when a customer submits a payment receipt
 * and the AI agent acknowledges it.
 *
 * Trigger: after handlePaymentReceipt returns handled:true and the AI
 * sends "our team will verify your payment."
 *
 * Cost: zero — uses SendPulse SMTP (already integrated, free tier = 15k/month).
 * Available to ALL sellers regardless of plan.
 */

import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import sendpulse from "@/app/lib/sendpulse";

/* ── Build the email HTML ───────────────────────────────────── */
function buildEmail({ businessName, customerPhone, productName, storeSlug }) {
  const dashboardLink = "https://www.pax26.com/dashboard/automations/whatsapp-inbox";
  const storeLink     = storeSlug ? `https://www.pax26.com/store/${storeSlug}` : null;
  const settingsLink  = "https://www.pax26.com/dashboard/automations/ai-business-dashboard";
  const year          = new Date().getFullYear();
  const time          = new Date().toLocaleString("en-NG", {
    timeZone:  "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,-apple-system,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
              <span style="font-size:20px;">⚡</span>
              <span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.02em;">Pax26</span>
            </div>
            <h1 style="color:#fff;margin:16px 0 4px;font-size:22px;font-weight:900;letter-spacing:-0.03em;">
              💰 Payment Proof Received
            </h1>
            <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">
              A customer has sent a payment receipt — review and confirm it
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">

            <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
              Hi <strong>${businessName}</strong>, a customer just sent a payment receipt on WhatsApp and your AI agent has acknowledged it. Go to your inbox to verify the transfer and confirm the order.
            </p>

            <!-- Info card -->
            <div style="background:#f8f8f6;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #e8e8e6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:38%;">Customer</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">${customerPhone}</td>
                </tr>
                ${productName ? `
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Product</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">${productName}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">${time}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Status</td>
                  <td style="padding:6px 0;">
                    <span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Payment Proof Received ✓</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA buttons -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding-right:8px;" width="${storeLink ? "50%" : "100%"}">
                  <a href="${dashboardLink}"
                    style="display:block;text-align:center;background:#111;color:#fff;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;">
                    Open WhatsApp Inbox
                  </a>
                </td>
                ${storeLink ? `
                <td style="padding-left:8px;" width="50%">
                  <a href="${storeLink}"
                    style="display:block;text-align:center;background:#6366f1;color:#fff;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;">
                    View Your Store
                  </a>
                </td>` : ""}
              </tr>
            </table>

            <p style="color:#aaa;font-size:12px;margin:0;text-align:center;line-height:1.6;">
              You received this because a customer submitted payment proof on your WhatsApp store.<br/>
              <a href="${settingsLink}" style="color:#6366f1;">Turn off email alerts</a> in AI Agent Settings.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f6;padding:16px 32px;text-align:center;border-top:1px solid #e8e8e6;">
            <p style="color:#bbb;font-size:11px;margin:0;">
              © ${year} Pax26 Technologies · AI-powered WhatsApp automation
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`.trim();
}

/* ── Main export ────────────────────────────────────────────── */
/**
 * sendSalesAlertEmail
 *
 * @param {string|ObjectId} userId
 * @param {{ customerPhone: string, productName?: string }} options
 */
export async function sendSalesAlertEmail(userId, { customerPhone, productName } = {}) {
  try {
    const [user, profile] = await Promise.all([
      UserModel.findById(userId).select("email name").lean(),
      SellerProfileModel.findOne({ userId }).select("businessName emailSalesAlerts slug").lean(),
    ]);

    if (!user?.email || !profile) return;

    // Respect the seller toggle — defaults to true (on)
    if (profile.emailSalesAlerts === false) {
      console.log(`[salesAlert] Alerts disabled for ${userId}`);
      return;
    }

    const html = buildEmail({
      businessName: profile.businessName || user.name || "there",
      customerPhone,
      productName: productName || null,
      storeSlug:   profile.slug || null,
    });

    const emailPayload = {
      subject: `💰 Payment proof received — ${profile.businessName || "your store"}`,
      from:    { name: "Pax26 Sales Alerts", email: "info@pax26.com" },
      to:      [{ email: user.email }],
      html,
    };

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        if (result?.result === true) {
          console.log(`[salesAlert] ✅ Email sent to ${user.email}`);
        } else {
          console.warn("[salesAlert] ⚠️ SendPulse failed:", result);
        }
        resolve();
      }, emailPayload);
    });
  } catch (err) {
    // Non-fatal — never block AI response for a notification
    console.warn("[salesAlert] Error:", err.message);
  }
}
