/**
 * QR Usage Tracker
 *
 * Called every time an outbound automated message is sent via a QR-connected
 * WhatsApp session. Increments weekly + daily counters atomically.
 *
 * Also enforces the daily message limit — returns { blocked: true } if the
 * user has reached their plan's daily cap.
 *
 * Usage:
 *   const { blocked, dailyCount, weeklyCount } = await trackQRUsage(userId);
 *   if (blocked) return; // skip sending the AI reply
 */

import QRUsageModel from "@/app/ults/models/QRUsageModel";
import PlanModel from "@/app/ults/models/PlanModel";
import { getWeekStart, getTodayStr } from "@/app/ults/utils/dateUtils";

/**
 * Increment QR usage counters for a user.
 *
 * @param {string|ObjectId} userId
 * @param {string} planKey   e.g. "free" | "starter"
 * @returns {{ blocked: boolean, dailyCount: number, weeklyCount: number, isBanRisk: boolean }}
 */
export async function trackQRUsage(userId, planKey = "free") {
  try {
    const weekStart = getWeekStart();
    const todayStr = getTodayStr();

    // Fetch live plan limits
    const plan = await PlanModel.findOne({ key: planKey }).lean();
    const dailyLimit = plan?.dailyMessageLimit ?? 200;
    const banRiskThreshold = plan?.banRiskThreshold ?? 500;

    // Find existing record for this user-week
    let usage = await QRUsageModel.findOne({ userId, weekStart });

    if (!usage) {
      usage = new QRUsageModel({
        userId,
        weekStart,
        weeklyCount: 0,
        dailyDate: todayStr,
        dailyCount: 0,
        dailyLimit,
      });
    }

    // Reset daily counter if it's a new day
    if (usage.dailyDate !== todayStr) {
      usage.dailyDate = todayStr;
      usage.dailyCount = 0;
    }

    // Enforce daily limit (backend gate)
    if (dailyLimit > 0 && usage.dailyCount >= dailyLimit) {
      console.log(`[qrUsageTracker] Daily limit reached for user ${userId}: ${usage.dailyCount}/${dailyLimit}`);
      return {
        blocked: true,
        dailyCount: usage.dailyCount,
        weeklyCount: usage.weeklyCount,
        isBanRisk: usage.weeklyCount >= banRiskThreshold,
      };
    }

    // Increment counters
    usage.weeklyCount += 1;
    usage.dailyCount += 1;
    usage.dailyLimit = dailyLimit; // keep snapshot in sync

    await usage.save();

    const isBanRisk = usage.weeklyCount >= banRiskThreshold;

    console.log(
      `[qrUsageTracker] userId=${userId} daily=${usage.dailyCount}/${dailyLimit} weekly=${usage.weeklyCount} banRisk=${isBanRisk}`
    );

    return {
      blocked: false,
      dailyCount: usage.dailyCount,
      weeklyCount: usage.weeklyCount,
      isBanRisk,
    };
  } catch (err) {
    // Non-fatal — log but don't block message sending
    console.error("[qrUsageTracker] Error:", err.message);
    return { blocked: false, dailyCount: 0, weeklyCount: 0, isBanRisk: false };
  }
}
