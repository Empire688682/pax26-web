/**
 * POST /api/referral/cashout
 *
 * User submits a bank cashout request for their referral wallet balance.
 *
 * Rules:
 *  1. User must meet withdrawal eligibility (verified, balance >= minimum, lock period cleared)
 *  2. No existing pending cashout request
 *  3. Bank details must be provided
 *  4. Balance is held (deducted from referralWalletBalance) immediately on request
 *     so it cannot be spent or double-requested while pending admin review
 *  5. Admin is emailed at info@pax26.com
 *  6. Entry saved to WalletTransaction as cashout_request
 *  7. Entry saved to CashoutRequest collection
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import WalletTransactionModel from "@/app/ults/models/WalletTransactionModel";
import CashoutRequestModel from "@/app/ults/models/CashoutRequestModel";
import { getReferralConfig } from "@/app/ults/models/ReferralConfigModel";
import { sendCashoutRequestAdminEmail, sendCashoutRequestUserEmail } from "@/app/lib/referralEmailService";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { bankName, accountNumber, accountName } = await req.json();

    if (!bankName?.trim() || !accountNumber?.trim() || !accountName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Bank name, account number, and account name are required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404, headers: corsHeaders() }
      );
    }

    const config = await getReferralConfig();
    const balance = user.referralWalletBalance || 0;

    // ── Eligibility checks ────────────────────────────────────────
    if (!user.userVerify) {
      return NextResponse.json(
        { success: false, message: "Your account must be verified before requesting a cashout." },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (balance < config.withdrawalMinimum) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum cashout balance is ₦${config.withdrawalMinimum.toLocaleString()}. Your current balance is ₦${balance.toLocaleString()}.`,
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
          message: `Your cashout is locked for ${daysLeft} more day(s) due to the ${config.withdrawalLockDays}-day holding period.`,
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (user.cashoutPending) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a pending cashout request. Please wait for admin to process it.",
        },
        { status: 409, headers: corsHeaders() }
      );
    }

    // ── Hold balance — deduct immediately so it cannot be double-spent ─
    const balanceBefore = balance;
    const balanceAfter = 0; // full balance is held

    user.referralWalletBalance = balanceAfter;
    user.canWithdraw = false;
    user.cashoutPending = true;
    // Snapshot bank details on the user record for quick admin reference
    user.cashoutBankName      = bankName.trim();
    user.cashoutAccountNumber = accountNumber.trim();
    user.cashoutAccountName   = accountName.trim();
    await user.save();

    // ── Create CashoutRequest record ──────────────────────────────
    const cashoutRequest = await CashoutRequestModel.create({
      userId: user._id,
      amount: balanceBefore,
      bankDetails: {
        bankName:      bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName:   accountName.trim(),
      },
      status: "pending",
    });

    // ── WalletTransaction ledger entry ────────────────────────────
    const walletTx = await WalletTransactionModel.create({
      userId: user._id,
      type: "cashout_request",
      direction: "debit",
      amount: balanceBefore,
      balanceBefore,
      balanceAfter,
      description: `Cashout request submitted — ₦${balanceBefore.toLocaleString()} held pending admin approval`,
      status: "pending",
    });

    // Link wallet tx to cashout request
    await CashoutRequestModel.findByIdAndUpdate(cashoutRequest._id, {
      walletTxId: walletTx._id,
    });

    // ── Notify admin + user by email (non-blocking) ───────────────
    sendCashoutRequestAdminEmail({ user, amount: balanceBefore, cashoutRequest }).catch(
      (err) => console.error("[cashout] Admin email failed (non-fatal):", err?.message)
    );
    sendCashoutRequestUserEmail({ user, amount: balanceBefore }).catch(
      (err) => console.error("[cashout] User email failed (non-fatal):", err?.message)
    );

    return NextResponse.json(
      {
        success: true,
        message: `Your cashout request for ₦${balanceBefore.toLocaleString()} has been submitted. You'll be notified by email once it's processed.`,
        cashoutRequestId: cashoutRequest._id.toString(),
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("[cashout] POST error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
