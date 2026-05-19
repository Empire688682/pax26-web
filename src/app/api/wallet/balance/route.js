/**
 * GET /api/wallet/balance
 * Returns the referral wallet balance and recent wallet transactions.
 */
import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { verifyToken } from '../../helper/VerifyToken';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import UserModel from '@/app/ults/models/UserModel';
import WalletTransactionModel from '@/app/ults/models/WalletTransactionModel';

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
      'referralWalletBalance pendingReferralBonus releasedReferralBonus ' +
      'canWithdraw withdrawalEligibleAt userVerify'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const transactions = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          referralWalletBalance: user.referralWalletBalance || 0,
          pendingReferralBonus: user.pendingReferralBonus || 0,
          releasedReferralBonus: user.releasedReferralBonus || 0,
          canWithdraw: user.canWithdraw || false,
          withdrawalEligibleAt: user.withdrawalEligibleAt || null,
          isAccountVerified: user.userVerify || false,
          transactions,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
