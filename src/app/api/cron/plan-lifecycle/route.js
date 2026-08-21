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
import { sendPlanExpiryReminder } from "@/app/lib/transactionalEmailService";
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
  let expiredCount = 0;

  try {
    // ── 1. SEND EXPIRY REMINDERS (1–2 days before expiration) ──────────────────
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const usersNeedingReminder = await UserModel.find({
      "paxAI.plan": { $ne: "free" },
      "paxAI.planExpiresAt": { $gt: now, $lte: twoDaysFromNow },
    });

    for (const user of usersNeedingReminder) {
      try {
        const expiresAt = new Date(user.paxAI.planExpiresAt);
        const msDiff = expiresAt.getTime() - now.getTime();
        const daysLeft = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));

        // Check if reminder was already sent for this 30-day billing cycle
        const lastStartedAt = user.paxAI.planStartedAt ? new Date(user.paxAI.planStartedAt).getTime() : 0;
        const lastReminderAt = user.paxAI.reminderSentAt ? new Date(user.paxAI.reminderSentAt).getTime() : 0;

        if (lastReminderAt > lastStartedAt) {
          // Already reminded for this current billing cycle
          continue;
        }

        console.log(`[plan-lifecycle] ⚠️ Sending expiry reminder to ${user.email} (${daysLeft} day(s) left)`);

        // Send Email Reminder
        await sendPlanExpiryReminder(
          { _id: user._id, email: user.email, name: user.name },
          { plan: user.paxAI.plan, daysLeft, expiresAt }
        );

        // Send WhatsApp Reminder to user's connected WhatsApp number or contact number
        const waPhone = user.whatsapp?.displayPhone || user.whatsapp?.phoneNumberId || user.number;
        if (user.whatsapp?.connected && user.whatsapp?.phoneNumberId && waPhone) {
          const waMessage = `⚠️ *Pax26 Plan Expiry Notice*\n\nHi ${user.name || "there"}, your Pax26 *${user.paxAI.plan.toUpperCase()} Plan* expires in *${daysLeft} day(s)* on ${expiresAt.toLocaleDateString("en-NG")}.\n\nPlease fund your wallet and renew your plan to prevent service interruption:\nhttps://www.pax26.com/fund-wallet`;

          await sendWhatsAppAutomationReply({
            phoneNumberId: user.whatsapp.phoneNumberId,
            to: waPhone.replace(/\D/g, ""),
            text: waMessage,
          });
        }

        // Record that reminder was sent for this cycle
        user.paxAI.reminderSentAt = now;
        await user.save();
        remindersSent++;

      } catch (userErr) {
        console.error(`[plan-lifecycle] Error reminding user ${user._id}:`, userErr.message);
      }
    }

    // ── 2. AUTO-EXPIRY & DOWNGRADE EXPIRED PLANS ──────────────────────────────
    const expiredUsers = await UserModel.find({
      "paxAI.plan": { $ne: "free" },
      "paxAI.planExpiresAt": { $lte: now },
    });

    for (const user of expiredUsers) {
      try {
        console.log(`[plan-lifecycle] 📉 Downgrading expired user ${user.email} from ${user.paxAI.plan} to free`);

        user.paxAI.plan = "free";
        user.paxAI.productsLimit = 20; // Revert to Free plan limit
        user.paxAI.maxMonthlyMessages = 200;
        user.paxAI.broadcastContactsLimit = 0;
        user.paxAI.scheduledBroadcast = false;
        user.paxAI.segmentation = false;
        user.paxAI.bulkSequences = false;
        user.paxAI.salesAnalyticsEnabled = false;
        user.paxAI.leadFollowupEnabled = false;
        user.paxAI.leadQualificationEnabled = false;
        user.paxAI.productRecommendations = false;
        user.paxAI.removeBranding = false;
        user.paxAI.multiStaff = 0;
        user.paxAI.customStorefrontDomain = false;
        user.paxAI.lastUpdated = now;

        await user.save();
        expiredCount++;

      } catch (err) {
        console.error(`[plan-lifecycle] Error downgrading user ${user._id}:`, err.message);
      }
    }

    console.log(`[plan-lifecycle] ✅ Done. Reminders sent: ${remindersSent}, Expired downgraded: ${expiredCount}`);

    return NextResponse.json({
      success: true,
      remindersSent,
      expiredCount,
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
