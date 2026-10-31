// src/app/api/cron/quota-warning/route.js
//
// Called daily by Upstash QStash or a manual GET/POST request with Bearer CRON_SECRET.
//
// Finds all AI-enabled users whose remaining monthly messages have dropped
// below the WARNING_THRESHOLD (20) and:
//   1. Sends a quota-warning email via sendQuotaWarningEmail
//      • Free users  → advice to upgrade to a paid plan
//      • Paid users  → advice to buy extra messages or upgrade their plan
//   2. Sends a mobile push notification (if the seller has a push token)
//
// A `quotaWarningSentAt` flag on the user document prevents sending
// duplicate warnings within the same billing cycle.
// The flag is reset to null whenever the monthly counter resets
// (plan renewal or free-tier 30-day reset in handleIncomingWhatsapp.js).

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import PlanModel from "@/app/ults/models/PlanModel";
import { sendQuotaWarningEmail } from "@/app/lib/transactionalEmailService";
import { sendMobilePush } from "@/app/lib/pushNotificationService";

// ─── Config ──────────────────────────────────────────────────────────────────
// Warn when fewer than this many messages remain.
const WARNING_THRESHOLD = 20;

// ─── Auth helper (same as plan-lifecycle) ────────────────────────────────────
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

// ─── Core logic ──────────────────────────────────────────────────────────────
async function runQuotaWarning() {
  await connectDb();

  let warnedCount    = 0;
  let skippedCount   = 0;
  let errorCount     = 0;

  try {
    // Fetch all plans once so we can look up each user's limit quickly
    const allPlans = await PlanModel.find({}).lean();
    const planMap  = Object.fromEntries(allPlans.map((p) => [p.key, p]));

    // Find users whose AI agent is enabled and who have used at least some messages.
    // We fetch all users with a non-zero messagesUsedThisMonth so we can check
    // the remaining count after combining with their plan's actual limit.
    // We also skip users who already received a warning in the current cycle
    // (quotaWarningSentAt is set AND messagesUsedThisMonth hasn't reset since then).
    const candidates = await UserModel.find({
      "paxAI.enabled": true,
      "paxAI.messagesUsedThisMonth": { $gt: 0 },
      // Only consider users whose AI agent is not disabled
      $or: [
        { "paxAI.aiAgentEnabled": true },
        { "paxAI.aiAgentEnabled": { $exists: false } },
      ],
    }).select(
      "_id name email mobilePushToken mobileNotifPrefs paxAI"
    ).lean();

    console.log(`[quota-warning] 🔍 Found ${candidates.length} candidate(s) to check`);

    for (const user of candidates) {
      try {
        const plan         = user.paxAI?.plan || "free";
        const planMeta     = planMap[plan];
        const messagesLimit = planMeta?.messagesLimit ?? user.paxAI?.maxMonthlyMessages ?? 0;
        const messagesUsed  = user.paxAI?.messagesUsedThisMonth ?? 0;
        const remaining     = Math.max(0, messagesLimit - messagesUsed);

        // Only act if below the warning threshold
        if (remaining >= WARNING_THRESHOLD) {
          skippedCount++;
          continue;
        }

        // Skip if a warning was already sent this cycle.
        // "This cycle" means: quotaWarningSentAt exists AND it happened AFTER the
        // last time messagesUsedThisMonth would have been reset (planStartedAt for
        // free users; planExpiresAt - 30d for paid users).
        const warningSentAt = user.paxAI?.quotaWarningSentAt
          ? new Date(user.paxAI.quotaWarningSentAt)
          : null;

        if (warningSentAt) {
          // Determine the start of the current billing cycle
          let cycleStart;
          if (plan === "free") {
            cycleStart = user.paxAI?.planStartedAt
              ? new Date(user.paxAI.planStartedAt)
              : new Date(0);
          } else {
            // Paid: cycle started 30 days before planExpiresAt
            cycleStart = user.paxAI?.planExpiresAt
              ? new Date(new Date(user.paxAI.planExpiresAt).getTime() - 30 * 24 * 60 * 60 * 1000)
              : new Date(0);
          }

          if (warningSentAt >= cycleStart) {
            // Warning already sent in the current cycle — skip
            skippedCount++;
            console.log(`[quota-warning] ⏭️ Already warned ${user.email} this cycle (${remaining} left)`);
            continue;
          }
        }

        // ── Send email ────────────────────────────────────────────────────
        await sendQuotaWarningEmail(
          { _id: user._id, email: user.email, name: user.name },
          { plan, messagesUsed, messagesLimit, remaining }
        );

        // ── Send mobile push ──────────────────────────────────────────────
        const isFree      = plan === "free";
        const pushTitle   = remaining <= 5 ? "🚨 AI Agent Almost Silent!" : "⚠️ AI Replies Running Low";
        const pushBody    = isFree
          ? `Only ${remaining} AI repl${remaining === 1 ? "y" : "ies"} left. Upgrade to a paid plan to keep your agent running.`
          : `Only ${remaining} AI repl${remaining === 1 ? "y" : "ies"} left this month. Buy extra messages or upgrade your plan.`;

        // Use 'escalation' channel — it's the highest-priority existing channel
        // (no mobileNotifPrefs gate needed for account-level billing alerts)
        sendMobilePush(user._id, {
          type:  "escalation",
          title: pushTitle,
          body:  pushBody,
          data:  {
            type:      "quota_warning",
            remaining,
            plan,
            screen:    "billing",
          },
        }).catch((err) =>
          console.warn(`[quota-warning] Push failed for ${user.email} (non-fatal):`, err?.message)
        );

        // ── Mark warning as sent ──────────────────────────────────────────
        await UserModel.findByIdAndUpdate(user._id, {
          $set: { "paxAI.quotaWarningSentAt": new Date() },
        });

        warnedCount++;
        console.log(`[quota-warning] ✅ Warned ${user.email} | plan=${plan} | remaining=${remaining}`);

      } catch (userErr) {
        errorCount++;
        console.error(`[quota-warning] ❌ Error processing user ${user._id}:`, userErr.message);
      }
    }

    console.log(
      `[quota-warning] 🏁 Done. Warned: ${warnedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`
    );

    return NextResponse.json({
      success: true,
      warnedCount,
      skippedCount,
      errorCount,
    });

  } catch (err) {
    console.error("[quota-warning] Fatal error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────
export async function POST(req) {
  const rawBody  = await req.text();
  const authorized = await isAuthorized(req, rawBody);
  if (!authorized)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return runQuotaWarning();
}

export async function GET(req) {
  const authorized = await isAuthorized(req, "");
  if (!authorized)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return runQuotaWarning();
}
