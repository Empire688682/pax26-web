/**
 * planExpiryCheck.js
 *
 * Shared atomic helper — checks whether a user's plan is about to expire
 * (within 3, 2, or 1 day) and sends exactly one reminder email per window
 * per billing cycle.
 *
 * Uses a MongoDB findOneAndUpdate + $addToSet to atomically claim the window
 * before sending, so concurrent serverless invocations never produce duplicate
 * emails even if the function is called multiple times in rapid succession.
 *
 * Called by:
 *   1. /api/real-time-data  — fires non-blocking on every authenticated
 *      dashboard load (catches active users immediately)
 *   2. /api/cron/plan-lifecycle — fires on scheduled / manual cron sweep
 *      (catches inactive users)
 */

import UserModel from "@/app/ults/models/UserModel";
import PlanModel  from "@/app/ults/models/PlanModel";
import TransactionModel from "@/app/ults/models/TransactionModel";
import { sendPlanExpiryReminder, sendPlanActivationReceipt } from "@/app/lib/transactionalEmailService";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * runExpiryCheckForUser
 *
 * @param {string|import("mongoose").Types.ObjectId} userId
 * @returns {Promise<{ sent: boolean, windowKey: string|null, error?: string }>}
 */
export async function runExpiryCheckForUser(userId) {
  try {
    // 1. Fetch only the fields we need — lean() for speed
    const user = await UserModel.findById(userId)
      .select("email name walletBalance paxAI.plan paxAI.planExpiresAt paxAI.planStartedAt paxAI.reminderWindowSent")
      .lean();

    if (!user) return { sent: false, windowKey: null };

    const plan = user.paxAI?.plan;

    // Nothing to remind free users about
    if (!plan || plan === "free") return { sent: false, windowKey: null };

    const planExpiresAt = user.paxAI?.planExpiresAt;
    if (!planExpiresAt) return { sent: false, windowKey: null };

    const now        = new Date();
    const expiresAt  = new Date(planExpiresAt);
    const msDiff     = expiresAt.getTime() - now.getTime();

    // Already expired (cron/inline handles auto-renew or downgrade) or more than 3 days away
    if (msDiff <= 0 || msDiff > 3 * MS_PER_DAY) return { sent: false, windowKey: null };

    // Determine which day-window this falls into: "3", "2", or "1"
    const daysLeft  = Math.ceil(msDiff / MS_PER_DAY); // 1, 2, or 3
    const windowKey = String(Math.min(3, Math.max(1, daysLeft))); // clamp to "1"–"3"

    // 2. Atomically claim this window for the current billing cycle.
    //    The query matches only if this windowKey is NOT already in the array.
    //    If it already exists, findOneAndUpdate returns null → we skip.
    const claimed = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        "paxAI.plan": { $ne: "free" },          // still on a paid plan
        "paxAI.planExpiresAt": { $gt: now },     // hasn't expired yet
        "paxAI.reminderWindowSent": { $ne: windowKey }, // window not yet sent
      },
      {
        $addToSet: { "paxAI.reminderWindowSent": windowKey },
        $set:      { "paxAI.lastUpdated": now },
      },
      { new: false } // we don't need the updated doc
    );

    // Another request already claimed this window (or it was sent by the cron)
    if (!claimed) return { sent: false, windowKey };

    // 3. Fetch plan price for the wallet-balance context in the email
    const planMeta = await PlanModel.findOne({ key: plan }).select("price label").lean();
    const planPrice = planMeta?.price ?? null;
    const planLabel = planMeta?.label ?? plan;

    // 4. Send the reminder email
    await sendPlanExpiryReminder(
      { _id: user._id, email: user.email, name: user.name },
      {
        plan:          planLabel,
        planKey:       plan,
        daysLeft,
        expiresAt,
        walletBalance: user.walletBalance ?? 0,
        planPrice,
      }
    );

    console.log(
      `[planExpiryCheck] ✅ Reminder sent to ${user.email} | window=${windowKey} | daysLeft=${daysLeft} | wallet=₦${user.walletBalance ?? 0} | planPrice=₦${planPrice ?? "?"}`
    );

    return { sent: true, windowKey };

  } catch (err) {
    // Non-fatal: log but never break the calling request
    console.error("[planExpiryCheck] Non-fatal error:", err.message);
    return { sent: false, windowKey: null, error: err.message };
  }
}

/**
 * processPlanExpirationOrRenewal
 *
 * Checks if a user's paid plan has expired (paxAI.planExpiresAt <= now).
 * If expired:
 *  - Checks if user.walletBalance >= planMeta.price for their current paid plan.
 *  - If sufficient balance: AUTO-RENEWS the plan for 30 days, deducts wallet balance,
 *    records a Transaction, and sends the Auto-Renewal Receipt Email & WhatsApp notification.
 *  - If insufficient balance: DOWNGRADES to "free" plan and sets downgradeReason.
 *
 * @param {string|import("mongoose").Types.ObjectId} userId
 * @returns {Promise<{ processed: boolean, action: "renewed"|"downgraded"|null, plan?: string }>}
 */
export async function processPlanExpirationOrRenewal(userId) {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return { processed: false, action: null };

    const planKey = user.paxAI?.plan;
    if (!planKey || planKey === "free") return { processed: false, action: null };

    const planExpiresAt = user.paxAI?.planExpiresAt;
    if (!planExpiresAt) return { processed: false, action: null };

    const now = new Date();
    const expiresAt = new Date(planExpiresAt);

    // If plan has NOT expired yet, nothing to do
    if (expiresAt > now) return { processed: false, action: null };

    // Plan IS expired. Fetch plan metadata to check price
    const planMeta = await PlanModel.findOne({ key: planKey });

    const currentBalance = user.walletBalance || 0;
    const planPrice = planMeta?.price ?? null;

    // Check if auto-renew is possible (valid plan price and sufficient wallet balance)
    if (planMeta && planPrice !== null && planMeta.isActive && currentBalance >= planPrice) {
      console.log(`[planLifecycle] 🔄 Auto-renewing plan ${planKey} for user ${user.email} (Wallet: ₦${currentBalance}, Price: ₦${planPrice})`);

      // 1. Deduct wallet balance
      user.walletBalance = currentBalance - planPrice;

      // 2. Extend subscription for 30 days
      const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      user.paxAI.planStartedAt = now;
      user.paxAI.planExpiresAt = newExpiresAt;
      user.paxAI.reminderWindowSent = []; // Reset reminder windows for the new cycle
      user.paxAI.reminderSentAt = null;
      user.paxAI.hadPaidPlan = true;
      user.paxAI.downgradeReason = null;
      user.paxAI.downgradeAt = null;

      // 3. Re-apply plan limits from PlanModel
      user.paxAI.maxMonthlyMessages = planMeta.messagesLimit;
      user.paxAI.messagesUsedThisMonth = 0;
      user.paxAI.broadcastContactsLimit = planMeta.broadcastContactsLimit;
      user.paxAI.broadcastContactsUsedThisMonth = 0;
      user.paxAI.scheduledBroadcast = planMeta.scheduledBroadcast;
      user.paxAI.segmentation = planMeta.segmentation;
      user.paxAI.bulkSequences = planMeta.bulkSequences;
      user.paxAI.removeBranding = planMeta.removeBranding;
      user.paxAI.multiStaff = planMeta.multiStaff;
      user.paxAI.storefrontEnabled = planMeta.storefrontEnabled ?? true;
      user.paxAI.productsLimit = planMeta.productsLimit ?? 20;
      user.paxAI.orderReceiptsEnabled = planMeta.orderReceiptsEnabled ?? true;
      user.paxAI.salesAlertsEnabled = planMeta.salesAlertsEnabled ?? true;
      user.paxAI.salesAnalyticsEnabled = planMeta.salesAnalyticsEnabled ?? false;
      user.paxAI.salesAnalyticsDays = planMeta.salesAnalyticsDays ?? 7;
      user.paxAI.customStorefrontDomain = planMeta.customStorefrontDomain ?? false;
      user.paxAI.aiAgentEnabled = planMeta.aiAgentEnabled ?? true;
      user.paxAI.leadFollowupEnabled = planMeta.leadFollowupEnabled ?? false;
      user.paxAI.leadQualificationEnabled = planMeta.leadQualificationEnabled ?? false;
      user.paxAI.productRecommendations = planMeta.productRecommendations ?? false;
      user.paxAI.lastUpdated = now;

      if (!user.planAnalytics) {
        user.planAnalytics = { aiMessagesUsed: 0, broadcastSent: 0, planRevenue: 0, metaCost: 0 };
      }
      user.planAnalytics.planRevenue += planPrice;

      await user.save();

      // 4. Record transaction
      const ref = `PAX-AUTORENEW-${planKey.toUpperCase()}-${Date.now()}`;
      await TransactionModel.create({
        userId: user._id,
        type: "ai-automation-subscription",
        description: `Automatic Plan Renewal — ${planMeta.label || planKey.toUpperCase()} Plan`,
        amount: planPrice,
        currency: "NGN",
        status: "success",
        reference: ref,
        meta: {
          subscription: {
            plan: planMeta.label || planKey,
            billingCycle: "monthly",
            featureTag: "ai-automation",
            expiresAt: newExpiresAt,
            isAutoRenew: true,
          },
        },
      });

      // 5. Send Auto-Renewal Email Receipt (isAutoRenew: true)
      await sendPlanActivationReceipt(user._id, {
        plan: planKey,
        price: planPrice,
        expiresAt: newExpiresAt,
        isAutoRenew: true,
      });

      // 6. Send WhatsApp confirmation if connected
      const waPhone = user.whatsapp?.displayPhone || user.whatsapp?.phoneNumberId || user.number;
      if (user.whatsapp?.connected && user.whatsapp?.phoneNumberId && waPhone) {
        const waMessage = `🎉 *Pax26 Plan Auto-Renewed!*\n\nHi ${user.name || "there"}, your Pax26 *${(planMeta.label || planKey).toUpperCase()} Plan* was automatically renewed using your wallet balance (₦${planPrice.toLocaleString()} charged).\n\nYour new expiry date is *${newExpiresAt.toLocaleDateString("en-NG")}*.\n\nThank you for choosing Pax26!`;
        await sendWhatsAppAutomationReply({
          phoneNumberId: user.whatsapp.phoneNumberId,
          to: waPhone.replace(/\D/g, ""),
          text: waMessage,
        }).catch((err) => console.error(`[planAutoRenew] WA error for ${user.email}:`, err.message));
      }

      return { processed: true, action: "renewed", plan: planKey };
    }

    // Balance is insufficient → DOWNGRADE TO FREE PLAN
    console.log(`[planLifecycle] 📉 Insufficient balance for auto-renew. Downgrading ${user.email} from ${planKey} to free`);

    user.paxAI.plan = "free";
    user.paxAI.productsLimit = 20;
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
    user.paxAI.downgradeReason = "expired_insufficient_balance";
    user.paxAI.downgradeAt = now;
    user.paxAI.freeTrialUsed = true;
    user.paxAI.lastUpdated = now;

    await user.save();

    return { processed: true, action: "downgraded", plan: "free" };

  } catch (err) {
    console.error("[processPlanExpirationOrRenewal] Non-fatal error:", err.message);
    return { processed: false, action: null, error: err.message };
  }
}
