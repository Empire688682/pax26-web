/**
 * POST /api/wallet/withdraw
 * Request a withdrawal from the referral wallet.
 *
 * Business rules enforced:
 *  1. User must be verified (userVerify === true)
 *  2. referralWalletBalance >= ₦10,000
 *  3. 14-day waiting period must have elapsed (withdrawalEligibleAt < now)
 *  4. canWithdraw flag must be true
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

export async function POST(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const balance = user.referralWalletBalance || 0;

    /* ── Eligibility checks ─────────────────────────────────────── */
    if (!user.userVerify) {
      return NextResponse.json(
        { success: false, message: 'Your account must be verified before you can withdraw.' },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (balance < 10000) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum withdrawal balance is ₦10,000. Your current balance is ₦${balance.toLocaleString()}.`,
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (user.withdrawalEligibleAt && new Date(user.withdrawalEligibleAt) > new Date()) {
      const daysLeft = Math.ceil(
        (new Date(user.withdrawalEligibleAt) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return NextResponse.json(
        {
          success: false,
          message: `Withdrawal is locked for ${daysLeft} more day(s) due to the 14-day holding period.`,
          withdrawalEligibleAt: user.withdrawalEligibleAt,
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (!user.canWithdraw) {
      return NextResponse.json(
        { success: false, message: 'You are not eligible to withdraw at this time.' },
        { status: 403, headers: corsHeaders() }
      );
    }

    /* ── Process withdrawal ─────────────────────────────────────── */
    const balanceBefore = balance;
    const balanceAfter  = 0; // Full withdrawal — transfer to VTU wallet

    // Credit the main VTU wallet with the referral balance
    user.walletBalance          = (user.walletBalance || 0) + balanceBefore;
    user.referralWalletBalance  = balanceAfter;
    user.canWithdraw            = false;
    user.withdrawalEligibleAt   = null;

    await user.save();

    /* ── Ledger entry ───────────────────────────────────────────── */
    await WalletTransactionModel.create({
      userId: user._id,
      type: 'withdrawal',
      direction: 'debit',
      amount: balanceBefore,
      balanceBefore,
      balanceAfter,
      description: 'Referral wallet withdrawal to main wallet',
      status: 'completed',
    });

    return NextResponse.json(
      {
        success: true,
        message: `₦${balanceBefore.toLocaleString()} has been transferred to your main wallet.`,
        amountWithdrawn: balanceBefore,
        newMainWalletBalance: user.walletBalance,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Wallet withdraw error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
