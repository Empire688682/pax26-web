/**
 * GET /api/referral/stats
 * Returns referral statistics for the authenticated user.
 */
import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { verifyToken } from '../../helper/VerifyToken';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import UserModel from '@/app/ults/models/UserModel';
import ReferralModel from '@/app/ults/models/ReferralModel';
import WalletTransactionModel from '@/app/ults/models/WalletTransactionModel';
import PlanModel from '@/app/ults/models/PlanModel';
import { isPaidPlan } from '@/app/lib/referralService';

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).select(
      'referralCode referralWalletBalance pendingReferralBonus releasedReferralBonus ' +
      'totalReferrals successfulReferrals canWithdraw withdrawalEligibleAt userVerify paxAI'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Fetch the last 10 wallet transactions for this user
    const recentTransactions = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch pending referrals (signed up but not yet subscribed)
    const pendingReferrals = await ReferralModel.countDocuments({
      referrer: userId,
      status: 'pending',
    });

    const isPaidUser = await isPaidPlan(user.paxAI?.plan);

    // Business rule: withdrawal requires ₦10k + verified account
    const withdrawalBalance = user.referralWalletBalance || 0;
    const isEligibleToWithdraw =
      withdrawalBalance >= 10000 &&
      user.userVerify === true &&
      user.canWithdraw === true;

    // Fetch dynamic plan rewards from database
    const plans = await PlanModel.find({ isActive: true }).lean();
    const planRewards = {};
    let maxReward = 0;
    plans.forEach(plan => {
      if (plan.referralReward && plan.referralReward > 0) {
        planRewards[plan.key] = plan.referralReward;
        if (plan.referralReward > maxReward) maxReward = plan.referralReward;
      }
    });

    // Days remaining on withdrawal lock
    let daysUntilWithdrawal = null;
    if (user.withdrawalEligibleAt) {
      const diff = new Date(user.withdrawalEligibleAt) - new Date();
      daysUntilWithdrawal = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          referralCode: user.referralCode || null,
          isPaidUser,
          totalReferrals: user.totalReferrals || 0,
          successfulReferrals: user.successfulReferrals || 0,
          pendingReferrals,
          referralWalletBalance: withdrawalBalance,
          pendingReferralBonus: user.pendingReferralBonus || 0,
          releasedReferralBonus: user.releasedReferralBonus || 0,
          canWithdraw: isEligibleToWithdraw,
          withdrawalEligibleAt: user.withdrawalEligibleAt || null,
          daysUntilWithdrawal,
          isAccountVerified: user.userVerify || false,
          recentTransactions,
          planRewards,
          maxReward,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
