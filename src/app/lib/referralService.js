/**
 * referralService.js
 *
 * Core business logic for the Pax26 referral system.
 * Call processReferralReward() inside any subscription-success hook.
 */

import UserModel from '@/app/ults/models/UserModel';
import ReferralModel from '@/app/ults/models/ReferralModel';
import WalletTransactionModel from '@/app/ults/models/WalletTransactionModel';

import PlanModel from '@/app/ults/models/PlanModel';

/**
 * Determine if a plan key is a paid plan by checking the DB.
 * @param {string} planKey
 * @returns {Promise<boolean>}
 */
export async function isPaidPlan(planKey) {
  if (!planKey) return false;
  const plan = await PlanModel.findOne({ key: planKey?.toLowerCase() });
  return plan && plan.price > 0;
}

/**
 * Ensure a paid user has a referral code assigned.
 * Called once after a successful subscription.
 * Does nothing if the user already has a code.
 *
 * @param {import('mongoose').Document} user  - Mongoose User document (already fetched)
 */
export async function ensureReferralCode(user) {
  if (user.referralCode) return; // already has one

  const { customAlphabet } = await import('nanoid');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const nanoid = customAlphabet(chars, 4);
  const count = await UserModel.countDocuments();
  const prefix = (user.name || 'USR').toUpperCase().slice(0, 3);
  user.referralCode = `PAX${prefix}${nanoid()}${count}`;
  await user.save();
}

/**
 * Process referral reward when a referred user subscribes to a paid plan.
 *
 * Business rules enforced here:
 *  1. Referred user must appear in ReferralModel (sign-up with a code).
 *  2. Reward must not have already been given for this referral.
 *  3. Reward is based on the plan the referred user subscribed to.
 *  4. Reward goes to referralWalletBalance (NOT the main VTU wallet).
 *  5. Withdrawal lock: withdrawalEligibleAt = now + 14 days.
 *  6. canWithdraw is set based on referralWalletBalance >= ₦10,000.
 *  7. Counters (totalReferrals, successfulReferrals) are incremented.
 *
 * @param {string|mongoose.Types.ObjectId} referredUserId  - The user who just subscribed
 * @param {string} planKey                                 - The plan they subscribed to
 * @returns {{ rewarded: boolean, amount: number, referrerId: string|null }}
 */
export async function processReferralReward(referredUserId, planKey) {
  // Fetch plan from database to get the dynamic reward amount
  const plan = await PlanModel.findOne({ key: planKey });
  const reward = plan?.referralReward || 0;
  
  if (!reward) {
    // Free plan or unknown plan or 0 reward — no reward
    return { rewarded: false, amount: 0, referrerId: null };
  }

  // Find the pending referral record for this user
  const referral = await ReferralModel.findOne({
    referredUser: referredUserId,
    status: 'pending',
    rewardGiven: false,
  });

  if (!referral) {
    // No referral record or already rewarded
    return { rewarded: false, amount: 0, referrerId: null };
  }

  // Prevent self-referral (edge-case guard)
  if (referral.referrer.toString() === referredUserId.toString()) {
    referral.status = 'invalid';
    await referral.save();
    return { rewarded: false, amount: 0, referrerId: null };
  }

  // Fetch referrer
  const referrer = await UserModel.findById(referral.referrer);
  if (!referrer) {
    return { rewarded: false, amount: 0, referrerId: null };
  }

  const balanceBefore = referrer.referralWalletBalance || 0;
  const balanceAfter  = balanceBefore + reward;

  const now = new Date();
  const withdrawalEligibleAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  /* ── Update referral record ─────────────────────────────── */
  referral.status       = 'rewarded';
  referral.rewardGiven  = true;
  referral.rewardAmount = reward;
  referral.planKey      = planKey;
  referral.rewardedAt   = now;
  await referral.save();

  /* ── Credit referrer's referral wallet ──────────────────── */
  referrer.referralWalletBalance = balanceAfter;
  referrer.releasedReferralBonus = (referrer.releasedReferralBonus || 0) + reward;
  referrer.successfulReferrals   = (referrer.successfulReferrals || 0) + 1;

  // Reset / extend 14-day lock
  referrer.withdrawalEligibleAt = withdrawalEligibleAt;
  referrer.canWithdraw = balanceAfter >= 10000 && referrer.userVerify === true;

  await referrer.save();

  /* ── Write wallet ledger entry ──────────────────────────── */
  await WalletTransactionModel.create({
    userId:        referrer._id,
    type:          'referral_reward',
    direction:     'credit',
    amount:        reward,
    balanceBefore,
    balanceAfter,
    description:   `Referral reward for ${planKey} subscription`,
    referralId:    referral._id,
    status:        'completed',
  });

  return { rewarded: true, amount: reward, referrerId: referrer._id.toString() };
}
