/**
 * ReferralConfigModel
 *
 * A singleton document (key: "default") that holds global referral policy settings.
 * The admin updates these values in the admin panel — no code changes needed.
 *
 * Fields:
 *  withdrawalMinimum  — minimum referral wallet balance required before a user can withdraw
 *  withdrawalLockDays — number of days after a reward is credited before withdrawal is allowed
 *
 * Usage:
 *  import { getReferralConfig } from '@/app/ults/models/ReferralConfigModel';
 *  const config = await getReferralConfig();
 *  // config.withdrawalMinimum  → e.g. 10000
 *  // config.withdrawalLockDays → e.g. 14
 */

import mongoose from "mongoose";

const ReferralConfigSchema = new mongoose.Schema(
  {
    // Singleton key — only one document with key="default" ever exists
    key: { type: String, default: "default", unique: true },

    // Minimum referral wallet balance (₦) before withdrawal is allowed
    withdrawalMinimum: { type: Number, default: 10000 },

    // Number of days the withdrawal is locked after a reward is credited
    withdrawalLockDays: { type: Number, default: 14 },
  },
  { timestamps: true }
);

const ReferralConfigModel =
  mongoose.models.ReferralConfig ||
  mongoose.model("ReferralConfig", ReferralConfigSchema);

export default ReferralConfigModel;

/**
 * Fetch the global referral config.
 * Creates the default document on first call if it doesn't exist yet.
 * Returns plain object with { withdrawalMinimum, withdrawalLockDays }.
 *
 * Falls back to safe hardcoded defaults if the DB call fails — the system
 * never breaks if the config document is missing.
 */
export async function getReferralConfig() {
  try {
    const config = await ReferralConfigModel.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { withdrawalMinimum: 10000, withdrawalLockDays: 14 } },
      { upsert: true, new: true, lean: true }
    );
    return {
      withdrawalMinimum: config.withdrawalMinimum ?? 10000,
      withdrawalLockDays: config.withdrawalLockDays ?? 14,
    };
  } catch {
    // Non-fatal fallback — system keeps working with safe defaults
    return { withdrawalMinimum: 10000, withdrawalLockDays: 14 };
  }
}
