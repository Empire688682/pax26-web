/**
 * transactionalEmailService.js
 *
 * Shared transactional email functions for Pax26 platform events:
 *  - sendWalletTopUpReceipt      → after wallet is funded
 *  - sendPlanActivationReceipt   → after a plan is subscribed
 *  - sendPlanExpiryReminder      → 2 days and 1 day before plan expires
 *
 * Email provider: SendPulse SMTP (same as salesAlertService.js)
 */

import UserModel from "@/app/ults/models/UserModel";
import sendpulse from "@/app/lib/sendpulse";

const FROM_EMAIL  = { name: "Pax26", email: "info@pax26.com" };
const BILLING_URL = "https://www.pax26.com/dashboard/billing";
const FUND_URL    = "https://www.pax26.com/fund-wallet";
const DASHBOARD   = "https://www.pax26.com/dashboard";
const YEAR        = () => new Date().getFullYear();
const NG_TIME     = () => new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });

/* ── Shared HTML shell ───────────────────────────────────────── */
function shell({ headerGradient, headerIcon, headerTitle, headerSub, body, footerNote }) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,-apple-system,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:${headerGradient};padding:28px 32px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
          <span style="font-size:20px;">${headerIcon}</span>
          <span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.02em;">Pax26</span>
        </div>
        <h1 style="color:#fff;margin:16px 0 4px;font-size:22px;font-weight:900;letter-spacing:-0.03em;">${headerTitle}</h1>
        <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">${headerSub}</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:28px 32px;">${body}</td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8f8f6;padding:16px 32px;text-align:center;border-top:1px solid #e8e8e6;">
        <p style="color:#bbb;font-size:11px;margin:0;">${footerNote}</p>
        <p style="color:#bbb;font-size:11px;margin:4px 0 0;">© ${YEAR()} Pax26 Technologies · AI-powered WhatsApp Commerce</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`.trim();
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:6px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:38%;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">${value}</td>
  </tr>`;
}

function ctaButton(href, text, bg = "#6366f1") {
  return `<a href="${href}" style="display:block;text-align:center;background:${bg};color:#fff;padding:13px 20px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;margin-bottom:12px;">${text}</a>`;
}

/* ═══════════════════════════════════════════════════════════════
   1. WALLET TOP-UP RECEIPT
   ═══════════════════════════════════════════════════════════════ */
function buildWalletReceiptHtml({ userName, amount, balanceAfter, reference }) {
  const body = `
    <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${userName || "there"}</strong>, your Pax26 wallet has been successfully funded.
    </p>
    <div style="background:#f8f8f6;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #e8e8e6;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Amount Funded", `₦${Number(amount).toLocaleString()}`)}
        ${balanceAfter !== undefined ? infoRow("New Balance", `₦${Number(balanceAfter).toLocaleString()}`) : ""}
        ${reference ? infoRow("Reference", reference) : ""}
        ${infoRow("Time", NG_TIME())}
        ${infoRow("Status", `<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Success ✓</span>`)}
      </table>
    </div>
    ${ctaButton(BILLING_URL, "Activate / Renew Your Plan →", "#059669")}
    ${ctaButton(DASHBOARD, "Go to Dashboard", "#111")}
    <p style="color:#aaa;font-size:12px;margin:16px 0 0;text-align:center;line-height:1.6;">
      You can use your wallet balance to subscribe or renew any Pax26 plan.<br/>
      Questions? <a href="mailto:info@pax26.com" style="color:#6366f1;">info@pax26.com</a>
    </p>`;

  return shell({
    headerGradient: "linear-gradient(135deg, #059669, #10b981)",
    headerIcon: "💰",
    headerTitle: "Wallet Funded Successfully!",
    headerSub: "Your Pax26 wallet balance has been updated",
    body,
    footerNote: "This receipt was generated automatically after your wallet top-up.",
  });
}

/**
 * sendWalletTopUpReceipt
 * @param {string|ObjectId} userId
 * @param {{ amount: number, balanceAfter?: number, reference?: string }} opts
 */
export async function sendWalletTopUpReceipt(userId, { amount, balanceAfter, reference } = {}) {
  try {
    const user = await UserModel.findById(userId).select("email name").lean();
    if (!user?.email) return;

    const html    = buildWalletReceiptHtml({ userName: user.name, amount, balanceAfter, reference });
    const subject = `💰 Wallet Funded — ₦${Number(amount).toLocaleString()} credited to your Pax26 account`;

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        console.log(`[walletReceipt] 📧 Sent to ${user.email} | result:`, result?.result);
        resolve();
      }, { subject, from: FROM_EMAIL, to: [{ email: user.email }], html });
    });
  } catch (err) {
    console.warn("[walletReceipt] Non-fatal email error:", err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   2. PLAN ACTIVATION RECEIPT
   ═══════════════════════════════════════════════════════════════ */
function buildPlanReceiptHtml({ userName, plan, price, expiresAt }) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const expiry    = expiresAt ? new Date(expiresAt).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "long" }) : "30 days from now";

  const body = `
    <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${userName || "there"}</strong>, your <strong>${planLabel} Plan</strong> has been activated successfully. 🎉
      Your AI sales agent and all plan features are now live.
    </p>
    <div style="background:#f8f8f6;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #e8e8e6;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Plan", `<strong>${planLabel} Plan</strong>`)}
        ${price ? infoRow("Amount Paid", `₦${Number(price).toLocaleString()}`) : ""}
        ${infoRow("Billing Cycle", "Monthly (30 days)")}
        ${infoRow("Expires On", expiry)}
        ${infoRow("Activated At", NG_TIME())}
        ${infoRow("Status", `<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Active ✓</span>`)}
      </table>
    </div>
    ${ctaButton(DASHBOARD, "Go to Dashboard →", "#6366f1")}
    <p style="color:#aaa;font-size:12px;margin:16px 0 0;text-align:center;line-height:1.6;">
      Your plan renews every 30 days. Top up your wallet before the expiry date to auto-renew.<br/>
      Questions? <a href="mailto:info@pax26.com" style="color:#6366f1;">info@pax26.com</a>
    </p>`;

  return shell({
    headerGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    headerIcon: "🚀",
    headerTitle: `${planLabel} Plan Activated!`,
    headerSub: "Your Pax26 AI Commerce plan is now live",
    body,
    footerNote: "This receipt was generated automatically after your plan purchase.",
  });
}

/**
 * sendPlanActivationReceipt
 * @param {string|ObjectId} userId
 * @param {{ plan: string, price: number, expiresAt?: Date }} opts
 */
export async function sendPlanActivationReceipt(userId, { plan, price, expiresAt } = {}) {
  try {
    const user = await UserModel.findById(userId).select("email name").lean();
    if (!user?.email) return;

    const html    = buildPlanReceiptHtml({ userName: user.name, plan, price, expiresAt });
    const subject = `🚀 ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Activated — Welcome to Pax26!`;

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        console.log(`[planReceipt] 📧 Sent to ${user.email} | result:`, result?.result);
        resolve();
      }, { subject, from: FROM_EMAIL, to: [{ email: user.email }], html });
    });
  } catch (err) {
    console.warn("[planReceipt] Non-fatal email error:", err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   3. PLAN EXPIRY REMINDER EMAIL
   ═══════════════════════════════════════════════════════════════ */
function buildExpiryReminderHtml({ userName, plan, daysLeft, expiresAt }) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const expiry    = expiresAt ? new Date(expiresAt).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "long" }) : "soon";
  const urgentColor = daysLeft <= 1 ? "#ef4444" : "#f59e0b";
  const urgentBg    = daysLeft <= 1 ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)";
  const urgentBorder = daysLeft <= 1 ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)";

  const body = `
    <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${userName || "there"}</strong>, your <strong>${planLabel} Plan</strong> expires in
      <strong style="color:${urgentColor};">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong> on <strong>${expiry}</strong>.
    </p>
    <div style="background:${urgentBg};border:1px solid ${urgentBorder};border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      <p style="color:${urgentColor};font-size:13px;font-weight:700;margin:0 0 10px;">⚠️ Action Required — Top Up Your Wallet</p>
      <p style="color:#555;font-size:13px;margin:0;line-height:1.6;">
        To keep your AI agent running and your storefront active, fund your wallet and renew your plan before the expiry date.
        If your plan expires, your account will revert to the <strong>Free plan</strong> with reduced limits.
      </p>
    </div>
    <div style="background:#f8f8f6;border-radius:14px;padding:14px 18px;margin-bottom:24px;border:1px solid #e8e8e6;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Current Plan", `${planLabel} Plan`)}
        ${infoRow("Expires On", expiry)}
        ${infoRow("Days Remaining", `<strong style="color:${urgentColor};">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>`)}
      </table>
    </div>
    ${ctaButton(FUND_URL, "Fund My Wallet →", urgentColor)}
    ${ctaButton(BILLING_URL, "Renew Plan", "#111")}
    <p style="color:#aaa;font-size:12px;margin:16px 0 0;text-align:center;line-height:1.6;">
      How to renew: Fund your wallet → Dashboard → Billing → Select plan → Subscribe.<br/>
      Questions? <a href="mailto:info@pax26.com" style="color:#6366f1;">info@pax26.com</a>
    </p>`;

  return shell({
    headerGradient: daysLeft <= 1
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #f59e0b, #d97706)",
    headerIcon: daysLeft <= 1 ? "🚨" : "⚠️",
    headerTitle: daysLeft <= 1 ? "Plan Expires Tomorrow!" : "Plan Expiring Soon",
    headerSub: `Your ${planLabel} Plan expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
    body,
    footerNote: "You are receiving this because you have an active paid plan on Pax26.",
  });
}

/**
 * sendPlanExpiryReminder
 * @param {{ _id, email, name }} user
 * @param {{ plan: string, daysLeft: number, expiresAt: Date }} opts
 */
export async function sendPlanExpiryReminder(user, { plan, daysLeft, expiresAt } = {}) {
  try {
    if (!user?.email) return;

    const html    = buildExpiryReminderHtml({ userName: user.name, plan, daysLeft, expiresAt });
    const subject = daysLeft <= 1
      ? `🚨 URGENT: Your Pax26 ${plan} Plan expires TOMORROW — Top up now`
      : `⚠️ Your Pax26 ${plan} Plan expires in ${daysLeft} days — Action needed`;

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        console.log(`[expiryReminder] 📧 Sent to ${user.email} | daysLeft=${daysLeft} | result:`, result?.result);
        resolve();
      }, { subject, from: FROM_EMAIL, to: [{ email: user.email }], html });
    });
  } catch (err) {
    console.warn("[expiryReminder] Non-fatal email error:", err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   4. WHATSAPP CONNECTED NOTIFICATION
   ═══════════════════════════════════════════════════════════════ */
function buildWhatsAppConnectedHtml({ userName, displayPhone, phoneNumberId }) {
  const body = `
    <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${userName || "there"}</strong>, your WhatsApp Business number <strong>${displayPhone || "WhatsApp number"}</strong> has been connected to your Pax26 account.
    </p>
    <div style="background:#f8f8f6;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #e8e8e6;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Connected Number", `<strong>${displayPhone || "WhatsApp Number"}</strong>`)}
        ${phoneNumberId ? infoRow("Phone ID", phoneNumberId) : ""}
        ${infoRow("Connected At", NG_TIME())}
        ${infoRow("Status", `<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Connected & Active ✓</span>`)}
      </table>
    </div>
    ${ctaButton(DASHBOARD, "Go to Dashboard →", "#10b981")}
    <p style="color:#aaa;font-size:12px;margin:16px 0 0;text-align:center;line-height:1.6;">
      Your AI Smart Agent will now respond to customer inquiries sent to this number.<br/>
      If you did not perform this action, please log in and disconnect this number immediately or contact <a href="mailto:info@pax26.com" style="color:#6366f1;">info@pax26.com</a>.
    </p>`;

  return shell({
    headerGradient: "linear-gradient(135deg, #10b981, #059669)",
    headerIcon: "📱",
    headerTitle: "WhatsApp Number Connected!",
    headerSub: "Your WhatsApp Business number is live on Pax26",
    body,
    footerNote: "This email was sent automatically following a WhatsApp connection event on your account.",
  });
}

/**
 * sendWhatsAppConnectedNotification
 * @param {string|Object} userOrId
 * @param {{ displayPhone?: string, phoneNumberId?: string }} opts
 */
export async function sendWhatsAppConnectedNotification(userOrId, { displayPhone, phoneNumberId } = {}) {
  try {
    let user = userOrId;
    if (typeof userOrId === "string" || (userOrId && typeof userOrId === "object" && !userOrId.email)) {
      user = await UserModel.findById(userOrId).select("email name").lean();
    }
    if (!user?.email) return;

    const html    = buildWhatsAppConnectedHtml({ userName: user.name, displayPhone, phoneNumberId });
    const subject = `📱 WhatsApp Connected — ${displayPhone || "Number"} is now live on Pax26`;

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        console.log(`[whatsappConnected] 📧 Sent to ${user.email} | result:`, result?.result);
        resolve();
      }, { subject, from: FROM_EMAIL, to: [{ email: user.email }], html });
    });
  } catch (err) {
    console.warn("[whatsappConnected] Non-fatal email error:", err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   5. WHATSAPP DISCONNECTED NOTIFICATION
   ═══════════════════════════════════════════════════════════════ */
function buildWhatsAppDisconnectedHtml({ userName, displayPhone, phoneNumberId }) {
  const body = `
    <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${userName || "there"}</strong>, your WhatsApp Business number <strong>${displayPhone || "WhatsApp number"}</strong> has been disconnected from your Pax26 account.
    </p>
    <div style="background:#fff1f2;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #fecdd3;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Disconnected Number", `<strong>${displayPhone || "N/A"}</strong>`)}
        ${phoneNumberId ? infoRow("Phone ID", phoneNumberId) : ""}
        ${infoRow("Disconnected At", NG_TIME())}
        ${infoRow("AI Agent Status", `<span style="background:#ffe4e6;color:#9f1239;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Paused (No Number)</span>`)}
      </table>
    </div>
    ${ctaButton("https://www.pax26.com/dashboard/automations", "Connect New Number →", "#ef4444")}
    <p style="color:#aaa;font-size:12px;margin:16px 0 0;text-align:center;line-height:1.6;">
      Your AI Smart Agent will not respond to customer messages until a number is reconnected.<br/>
      If you did not initiate this disconnection, please log in immediately to secure your account or contact <a href="mailto:info@pax26.com" style="color:#6366f1;">info@pax26.com</a>.
    </p>`;

  return shell({
    headerGradient: "linear-gradient(135deg, #ef4444, #be123c)",
    headerIcon: "🔌",
    headerTitle: "WhatsApp Number Disconnected",
    headerSub: "WhatsApp has been unlinked from your Pax26 account",
    body,
    footerNote: "This email was sent automatically following a WhatsApp disconnection event on your account.",
  });
}

/**
 * sendWhatsAppDisconnectedNotification
 * @param {string|Object} userOrId
 * @param {{ displayPhone?: string, phoneNumberId?: string }} opts
 */
export async function sendWhatsAppDisconnectedNotification(userOrId, { displayPhone, phoneNumberId } = {}) {
  try {
    let user = userOrId;
    if (typeof userOrId === "string" || (userOrId && typeof userOrId === "object" && !userOrId.email)) {
      user = await UserModel.findById(userOrId).select("email name").lean();
    }
    if (!user?.email) return;

    const html    = buildWhatsAppDisconnectedHtml({ userName: user.name, displayPhone, phoneNumberId });
    const subject = `⚠️ WhatsApp Disconnected — ${displayPhone || "Your number"} has been unlinked`;

    await new Promise((resolve) => {
      sendpulse.smtpSendMail((result) => {
        console.log(`[whatsappDisconnected] 📧 Sent to ${user.email} | result:`, result?.result);
        resolve();
      }, { subject, from: FROM_EMAIL, to: [{ email: user.email }], html });
    });
  } catch (err) {
    console.warn("[whatsappDisconnected] Non-fatal email error:", err.message);
  }
}
