// src/app/api/cron/plan-lifecycle/route.js
//
// Called daily by Upstash QStash or manual GET/POST request with Bearer CRON_SECRET.
//
// Performs 2 key tasks:
// 1. REMINDERS: Finds paid users whose plan expires in 1 or 2 days and sends:
//    - Expiry Reminder Email via sendPlanExpiryReminder
//    - WhatsApp message to seller's own number (if connected)
// 2. AUTO-EXPIRY: Finds paid users whose plan has expired (planExpiresAt < NOW) and:
//    - Downgrades paxAI.plan to "free"
//    - Resets productsLimit to 20, maxMonthlyMessages to 200, broadcastContactsLimit to 0, etc.

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { runExpiryCheckForUser, processPlanExpirationOrRenewal } from "@/app/lib/planExpiryCheck";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

async function isAuthorized(req, rawBody) {
  const signature = req.headers.get("upstash-signature");
  if (signature && process.env.QSTASH_CURRENT_SIGNING_KEY) {
    try {
      const { Receiver } = await import("@upstash/qstash");
      const receiver = new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
      });
      const isValid = await receiver.verify({ signature, body: rawBody });
      if (isValid) return true;
    } catch { /* fall through */ }
  }
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader === `Bearer ${secret}`) return true;
  return false;
}

async function runPlanLifecycle() {
  await connectDb();

  const now = new Date();
  let remindersSent = 0;
  let autoRenewedCount = 0;
  let downgradedCount = 0;

  try {
    // ── 1. SEND EXPIRY REMINDERS (Up to 3 days before expiration) ─────────────
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const usersNeedingReminder = await UserModel.find({
      "paxAI.plan": { $ne: "free" },
      "paxAI.planExpiresAt": { $gt: now, $lte: threeDaysFromNow },
    }).select("_id name email number whatsapp paxAI");

    for (const user of usersNeedingReminder) {
      try {
        const result = await runExpiryCheckForUser(user._id);

        if (result.sent) {
          remindersSent++;

          // Send WhatsApp Reminder to user's connected WhatsApp number or contact number if available
          const waPhone = user.whatsapp?.displayPhone || user.whatsapp?.phoneNumberId || user.number;
          if (user.whatsapp?.connected && user.whatsapp?.phoneNumberId && waPhone) {
            const expiresAt = new Date(user.paxAI.planExpiresAt);
            const msDiff = expiresAt.getTime() - now.getTime();
            const daysLeft = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
            const waMessage = `⚠️ *Pax26 Plan Expiry Notice*\n\nHi ${user.name || "there"}, your Pax26 *${user.paxAI.plan.toUpperCase()} Plan* expires in *${daysLeft} day(s)* on ${expiresAt.toLocaleDateString("en-NG")}.\n\nPlease fund your wallet and renew your plan to prevent service interruption:\nhttps://www.pax26.com/fund-wallet`;

            await sendWhatsAppAutomationReply({
              phoneNumberId: user.whatsapp.phoneNumberId,
              to: waPhone.replace(/\D/g, ""),
              text: waMessage,
            }).catch((err) => console.error(`[plan-lifecycle] WA error for ${user.email}:`, err.message));
          }
        }
      } catch (userErr) {
        console.error(`[plan-lifecycle] Error reminding user ${user._id}:`, userErr.message);
      }
    }

    // ── 2. AUTO-RENEW OR DOWNGRADE EXPIRED PLANS ──────────────────────────────
    const expiredUsers = await UserModel.find({
      "paxAI.plan": { $ne: "free" },
      "paxAI.planExpiresAt": { $lte: now },
    }).select("_id email");

    for (const user of expiredUsers) {
      try {
        const res = await processPlanExpirationOrRenewal(user._id);
        if (res.action === "renewed") {
          autoRenewedCount++;
        } else if (res.action === "downgraded") {
          downgradedCount++;
        }
      } catch (err) {
        console.error(`[plan-lifecycle] Error processing expired user ${user._id}:`, err.message);
      }
    }

    console.log(`[plan-lifecycle] ✅ Sweep complete. Reminders sent: ${remindersSent}, Auto-renewed: ${autoRenewedCount}, Downgraded: ${downgradedCount}`);

    return NextResponse.json({
      success: true,
      remindersSent,
      autoRenewedCount,
      downgradedCount,
    });

  } catch (err) {
    console.error("[plan-lifecycle] Fatal error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const rawBody = await req.text();
  const authorized = await isAuthorized(req, rawBody);
  if (!authorized) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return runPlanLifecycle();
}

export async function GET(req) {
  const authorized = await isAuthorized(req, "");
  if (!authorized) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return runPlanLifecycle();
}
