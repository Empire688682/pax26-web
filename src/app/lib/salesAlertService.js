/**
 * salesAlertService.js
 *
 * Sends the seller an email when a potential sale / payment proof is received
 * (prompting them to log in to Sales Analytics to confirm the order),
 * or when an order is confirmed.
 *
 * Cost: zero — uses SendPulse SMTP (already integrated).
 * Available to ALL sellers regardless of plan.
 */

import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import sendpulse from "@/app/lib/sendpulse";

/* ── Build the email HTML ───────────────────────────────────── */
function buildEmail({ businessName, customerPhone, productName, amountPaid, deliveryFee, orderId, storeSlug, isConfirmed }) {
  const salesAnalyticsLink = "https://www.pax26.com/dashboard/automations/sales";
  const inboxLink          = "https://www.pax26.com/dashboard/automations/whatsapp-inbox";
  const settingsLink       = "https://www.pax26.com/dashboard/automations/ai-business-dashboard";
  const year               = new Date().getFullYear();
  const time               = new Date().toLocaleString("en-NG", {
    timeZone:  "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const headerTitle = isConfirmed ? "🎉 New Confirmed Sale!" : "⚡ Potential Sale Alert";
  const headerSubtitle = isConfirmed 
    ? "An order has been verified and confirmed for your store!"
    : "Action Required — Customer submitted payment proof / order";
  const bodyIntro = isConfirmed
    ? `Hi <strong>${businessName}</strong>, a sale of ${amountPaid ? `<strong>₦${Number(amountPaid).toLocaleString()}</strong>` : "a product"} has been confirmed for your store.`
    : `Hi <strong>${businessName}</strong>, a potential customer just submitted payment proof / order on WhatsApp. Please log in and visit your <strong>Sales Analytics</strong> page to verify the transfer and confirm the order.`;
  const statusBadge = isConfirmed
    ? `<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Confirmed Sale ✓</span>`
    : `<span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Potential Sale — Action Required ⏳</span>`;

  const deliveryFeeVal = Number(deliveryFee) || 0;
  const grandTotalVal = Number(amountPaid) || 0;
  const productsSubtotalVal = grandTotalVal > deliveryFeeVal ? grandTotalVal - deliveryFeeVal : grandTotalVal;

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
          <td style="background:linear-gradient(135deg, ${isConfirmed ? "#059669,#10b981" : "#6366f1,#8b5cf6"});padding:28px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
              <span style="font-size:20px;">⚡</span>
              <span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.02em;">Pax26</span>
            </div>
            <h1 style="color:#fff;margin:16px 0 4px;font-size:22px;font-weight:900;letter-spacing:-0.03em;">
              ${headerTitle}
            </h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">
              ${headerSubtitle}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">

            <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
              ${bodyIntro}
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
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Product(s)</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;line-height:1.5;word-break:break-word;">${productName}</td>
                </tr>` : ""}
                ${deliveryFeeVal > 0 ? `
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Products Total</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">₦${productsSubtotalVal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Delivery Fee</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">₦${deliveryFeeVal.toLocaleString()}</td>
                </tr>` : ""}
                ${amountPaid ? `
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Grand Total</td>
                  <td style="padding:6px 0;font-size:14px;color:#10b981;font-weight:700;">₦${grandTotalVal.toLocaleString()}</td>
                </tr>` : ""}
                ${orderId ? `
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Order ID</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">#${orderId.toString().slice(-8).toUpperCase()}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">${time}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Status</td>
                  <td style="padding:6px 0;">
                    ${statusBadge}
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA buttons -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding-right:8px;" width="50%">
                  <a href="${salesAnalyticsLink}"
                    style="display:block;text-align:center;background:#6366f1;color:#fff;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;">
                    ${isConfirmed ? "View Sales Analytics →" : "Confirm Order in Analytics →"}
                  </a>
                </td>
                <td style="padding-left:8px;" width="50%">
                  <a href="${inboxLink}"
                    style="display:block;text-align:center;background:#111;color:#fff;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;">
                    Open WhatsApp Inbox
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#aaa;font-size:12px;margin:0;text-align:center;line-height:1.6;">
              You received this because a sale notification was triggered for your WhatsApp store.<br/>
              <a href="${settingsLink}" style="color:#6366f1;">Manage sales notifications</a> in AI Agent Settings.
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
 * @param {{ customerPhone?: string, productName?: string, amountPaid?: number, deliveryFee?: number, orderId?: string, isConfirmed?: boolean }} options
 */
export async function sendSalesAlertEmail(userId, { customerPhone, productName, amountPaid, deliveryFee, orderId, isConfirmed = false } = {}) {
  console.log(`[salesAlert] 📧 sendSalesAlertEmail called | userId=${userId} | isConfirmed=${isConfirmed} | orderId=${orderId}`);
  try {
    const [user, profile] = await Promise.all([
      UserModel.findById(userId).select("email name").lean(),
      SellerProfileModel.findOne({ userId }).select("businessName emailSalesAlerts slug").lean(),
    ]);

    if (!user?.email) {
      console.warn(`[salesAlert] ❌ No email address on user record (userId=${userId}). Cannot send email.`);
      return;
    }
    if (!profile) {
      console.warn(`[salesAlert] ❌ No seller profile found (userId=${userId}). Cannot send email.`);
      return;
    }
    console.log(`[salesAlert] ✅ User=${user.email} | businessName=${profile.businessName} | emailSalesAlerts=${profile.emailSalesAlerts}`);

    // Respect the seller toggle — defaults to true (on)
    if (profile.emailSalesAlerts === false) {
      console.log(`[salesAlert] 🚫 emailSalesAlerts=false for userId=${userId} — email suppressed.`);
      return;
    }

    const html = buildEmail({
      businessName: profile.businessName || user.name || "there",
      customerPhone: customerPhone || "Customer",
      productName: productName || null,
      amountPaid: amountPaid || null,
      deliveryFee: deliveryFee || null,
      orderId: orderId || null,
      storeSlug: profile.slug || null,
      isConfirmed,
    });

    const subject = isConfirmed
      ? `🎉 New Confirmed Sale (${amountPaid ? `₦${Number(amountPaid).toLocaleString()}` : "Order"}) — ${profile.businessName || "your store"}`
      : `⚡ Potential Sale Alert (${amountPaid ? `₦${Number(amountPaid).toLocaleString()}` : "Pending"}) — ${profile.businessName || "your store"}`;

    const emailPayload = {
      subject,
      from:    { name: "Pax26 Sales Alerts", email: "info@pax26.com" },
      to:      [{ email: user.email }],
      html,
    };

    console.log(`[salesAlert] 🚀 Calling SendPulse.smtpSendMail to=${user.email} | subject="${subject}"`);

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        console.log(`[salesAlert] 📨 SendPulse callback result:`, JSON.stringify(result));
        if (result?.result === true) {
          console.log(`[salesAlert] ✅ Email sent to ${user.email} (Confirmed: ${isConfirmed})`);
        } else {
          console.warn(`[salesAlert] ⚠️ SendPulse did NOT confirm success. result.result=${result?.result} | message=${result?.message || result?.error || "(no message)"}`);
        }
        resolve();
      }, emailPayload);
    });
  } catch (err) {
    // Non-fatal — never block AI response or order confirmation for a notification
    console.warn(`[salesAlert] 💥 Caught error in sendSalesAlertEmail:`, err.message, err.stack);
  }
}
