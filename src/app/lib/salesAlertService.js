/**
 * salesAlertService.js
 *
 * Sends the seller an email whenever the AI sends payment details to a customer.
 * This is a "potential sale" alert — not a confirmed payment, just a heads-up
 * that a customer is at the payment stage.
 *
 * Triggered from triggerAIResponse when the AI's outgoing text contains
 * payment account details (bank name, account number pattern).
 *
 * Cost: zero — uses SendPulse SMTP which is already integrated.
 * Plan: available to ALL sellers regardless of plan.
 */

import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import sendpulse from "@/app/lib/sendpulse";

/* ── Detect if the AI reply contains payment details ─────────── */
const PAYMENT_DETAILS_PATTERN = /(?:account\s*number|acc\.?\s*no|bank\s*name|account\s*name|acct\s*:|\b\d{10}\b)/i;

export function aiReplyContainsPaymentDetails(text) {
  if (!text || typeof text !== "string") return false;
  return PAYMENT_DETAILS_PATTERN.test(text);
}

/* ── Build the email HTML ─────────────────────────────────────── */
function buildSalesAlertEmail({ businessName, customerPhone, productName, storeSlug, isConfirmedReceipt }) {
  const storeLink = storeSlug ? `https://www.pax26.com/store/${storeSlug}` : null;
  const dashboardLink = "https://www.pax26.com/dashboard/automations/whatsapp-inbox";
  const headerTitle = isConfirmedReceipt ? "💰 Payment Proof Received" : "🛒 Potential Sale Alert";
  const headerSubtitle = isConfirmedReceipt
    ? "A customer has sent a payment receipt — review and confirm it"
    : "A customer has received payment details from your AI agent";
  const statusLabel = isConfirmedReceipt ? "Payment Proof Sent ✓" : "Awaiting Payment";
  const statusBg = isConfirmedReceipt ? "#dcfce7" : "#fef3c7";
  const statusColor = isConfirmedReceipt ? "#166534" : "#92400e";
  const bodyText = isConfirmedReceipt
    ? `Hi <strong>${businessName}</strong>, a customer has sent a payment receipt on WhatsApp. Your AI agent has acknowledged it — go to your inbox to verify and confirm the order.`
    : `Hi <strong>${businessName}</strong>, your AI agent just sent bank transfer details to a customer on WhatsApp. This means they are likely ready to pay — here is a heads-up so you can follow up if needed.`;
  const time = new Date().toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
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
<body style="margin:0; padding:0; background:#f5f5f3; font-family: system-ui, -apple-system, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#fff; border-radius:20px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 28px 32px; text-align:center;">
              <div style="display:inline-flex; align-items:center; gap:10px; background:rgba(255,255,255,0.15); border-radius:12px; padding:8px 16px;">
                <span style="font-size:20px;">⚡</span>
                <span style="color:#fff; font-weight:800; font-size:18px; letter-spacing:-0.02em;">Pax26</span>
              </div>
              <h1 style="color:#fff; margin:16px 0 4px; font-size:22px; font-weight:900; letter-spacing:-0.03em;">
                🛒 Potential Sale Alert
              </h1>
              <p style="color:rgba(255,255,255,0.8); margin:0; font-size:14px;">
                A customer has received payment details from your AI agent
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">

              <p style="color:#555; font-size:14px; margin:0 0 20px; line-height:1.6;">
                Hi <strong>${businessName}</strong>, your AI agent just sent bank transfer details to a customer on WhatsApp. This means they're likely ready to pay — here's a heads-up so you can follow up if needed.
              </p>

              <!-- Info card -->
              <div style="background:#f8f8f6; border-radius:14px; padding:18px 20px; margin-bottom:24px; border:1px solid #e8e8e6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0; font-size:12px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; width:40%;">Customer</td>
                    <td style="padding:6px 0; font-size:14px; color:#111; font-weight:600;">${customerPhone}</td>
                  </tr>
                  ${productName ? `
                  <tr>
                    <td style="padding:6px 0; font-size:12px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Product</td>
                    <td style="padding:6px 0; font-size:14px; color:#111; font-weight:600;">${productName}</td>
                  </tr>` : ""}
                  <tr>
                    <td style="padding:6px 0; font-size:12px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                    <td style="padding:6px 0; font-size:14px; color:#111; font-weight:600;">${time}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; font-size:12px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Status</td>
                    <td style="padding:6px 0;">
                      <span style="background:#fef3c7; color:#92400e; padding:3px 10px; border-radius:6px; font-size:12px; font-weight:700;">Awaiting Payment</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-right:8px;" width="50%">
                    <a href="${dashboardLink}"
                      style="display:block; text-align:center; background:#111; color:#fff; padding:12px 16px; border-radius:12px; font-size:13px; font-weight:700; text-decoration:none;">
                      Open WhatsApp Inbox
                    </a>
                  </td>
                  ${storeLink ? `
                  <td style="padding-left:8px;" width="50%">
                    <a href="${storeLink}"
                      style="display:block; text-align:center; background:#6366f1; color:#fff; padding:12px 16px; border-radius:12px; font-size:13px; font-weight:700; text-decoration:none;">
                      View Your Store
                    </a>
                  </td>` : ""}
                </tr>
              </table>

              <p style="color:#aaa; font-size:12px; margin:0; text-align:center; line-height:1.6;">
                This notification was sent because your AI agent shared payment details with a customer.<br/>
                You can turn this off in <a href="https://www.pax26.com/dashboard/automations/ai-business-dashboard" style="color:#6366f1;">AI Agent Settings</a>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f6; padding:16px 32px; text-align:center; border-top:1px solid #e8e8e6;">
              <p style="color:#bbb; font-size:11px; margin:0;">
                © ${new Date().getFullYear()} Pax26 Technologies · AI-powered WhatsApp automation
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/* ── Main export ──────────────────────────────────────────────── */
/**
 * sendSalesAlertEmail
 *
 * Call this after the AI sends a reply that contains payment details.
 * Checks the seller's emailSalesAlerts setting before sending.
 *
 * @param {string} userId          - Seller's User._id
 * @param {string} customerPhone   - The customer's WhatsApp number
 * @param {string} [productName]   - Optional product name from conversation
 */
export async function sendSalesAlertEmail(userId, { customerPhone, productName } = {}) {
  try {
    // Load user email
    const user = await UserModel.findById(userId).select("email name").lean();
    if (!user?.email) return;

    // Load seller profile to check the toggle and get store info
    const profile = await SellerProfileModel.findOne({ userId })
      .select("businessName emailSalesAlerts slug")
      .lean();

    if (!profile) return;

    // Respect the seller's toggle — default on
    if (profile.emailSalesAlerts === false) {
      console.log(`[salesAlert] Email alerts disabled for user ${userId}`);
      return;
    }

    const html = buildSalesAlertEmail({
      businessName: profile.businessName || user.name || "there",
      customerPhone,
      productName: productName || null,
      storeSlug: profile.slug || null,
    });

    const emailPayload = {
      subject: `🛒 Potential sale — a customer is ready to pay on ${profile.businessName || "your store"}`,
      from: {
        name: "Pax26 Sales Alerts",
        email: "info@pax26.com",
      },
      to: [{ email: user.email }],
      html,
    };

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        if (result?.result === true) {
          console.log(`[salesAlert] ✅ Email sent to ${user.email}`);
          resolve(true);
        } else {
          console.warn("[salesAlert] ⚠️ SendPulse failed:", result);
          resolve(false);
        }
      }, emailPayload);
    });
  } catch (err) {
    // Non-fatal — never block the AI response for a notification email
    console.warn("[salesAlert] Error sending sales alert email:", err.message);
  }
}
