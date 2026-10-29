/**
 * GET  /api/admin/referral/cashouts
 *   Returns all cashout requests (paginated, filterable by status).
 *   Admin only.
 *
 * PATCH /api/admin/referral/cashouts
 *   Mark a cashout request as paid or rejected.
 *   Body: { cashoutRequestId, action: "paid" | "rejected", adminNote? }
 *   Admin only.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import WalletTransactionModel from "@/app/ults/models/WalletTransactionModel";
import CashoutRequestModel from "@/app/ults/models/CashoutRequestModel";
import { sendCashoutPaidUserEmail, sendCashoutRejectedUserEmail } from "@/app/lib/referralEmailService";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// ── GET: list all cashout requests ───────────────────────────────────
export async function GET(req) {
  await connectDb();
  try {
    const adminId = await verifyToken(req);
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }
    const admin = await UserModel.findById(adminId).select("isAdmin").lean();
    if (!admin?.isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers: corsHeaders() });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all"; // "pending" | "paid" | "rejected" | "all"
    const page   = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip   = (page - 1) * limit;

    const filter = status !== "all" ? { status } : {};

    const [requests, total] = await Promise.all([
      CashoutRequestModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email number referralWalletBalance cashoutBankName cashoutAccountNumber cashoutAccountName successfulReferrals releasedReferralBonus")
        .lean(),
      CashoutRequestModel.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        requests,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("[admin/cashouts] GET error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}

// ── PATCH: mark as paid or rejected ──────────────────────────────────
export async function PATCH(req) {
  await connectDb();
  try {
    const adminId = await verifyToken(req);
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }
    const admin = await UserModel.findById(adminId).select("isAdmin").lean();
    if (!admin?.isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers: corsHeaders() });
    }

    const { cashoutRequestId, action, adminNote = "" } = await req.json();

    if (!cashoutRequestId || !["paid", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "cashoutRequestId and action (paid|rejected) are required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cashout = await CashoutRequestModel.findById(cashoutRequestId);
    if (!cashout) {
      return NextResponse.json({ success: false, message: "Cashout request not found." }, { status: 404, headers: corsHeaders() });
    }
    if (cashout.status !== "pending") {
      return NextResponse.json(
        { success: false, message: `Request is already ${cashout.status}.` },
        { status: 409, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(cashout.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404, headers: corsHeaders() });
    }

    const now = new Date();

    if (action === "paid") {
      // ── Mark paid ─────────────────────────────────────────────
      cashout.status      = "paid";
      cashout.adminNote   = adminNote;
      cashout.processedBy = adminId;
      cashout.processedAt = now;
      await cashout.save();

      // Update wallet ledger entry to completed
      if (cashout.walletTxId) {
        await WalletTransactionModel.findByIdAndUpdate(cashout.walletTxId, {
          $set: { status: "completed", type: "cashout_payment" },
        });
      }

      // Clear pending flag on user
      user.cashoutPending = false;
      await user.save();

      // Email user the good news (non-blocking)
      sendCashoutPaidUserEmail({ user, amount: cashout.amount, adminNote }).catch(
        (err) => console.error("[admin/cashouts] Paid email failed (non-fatal):", err?.message)
      );

      return NextResponse.json(
        { success: true, message: `Cashout request marked as paid. User notified by email.` },
        { status: 200, headers: corsHeaders() }
      );
    }

    if (action === "rejected") {
      // ── Mark rejected + refund balance ────────────────────────
      cashout.status      = "rejected";
      cashout.adminNote   = adminNote;
      cashout.processedBy = adminId;
      cashout.processedAt = now;
      await cashout.save();

      // Refund the held balance back to referral wallet
      const refundedBalance = (user.referralWalletBalance || 0) + cashout.amount;
      user.referralWalletBalance = refundedBalance;
      user.cashoutPending = false;
      user.canWithdraw = refundedBalance >= 10000 && user.userVerify === true;
      await user.save();

      // Reverse the wallet ledger entry
      if (cashout.walletTxId) {
        await WalletTransactionModel.findByIdAndUpdate(cashout.walletTxId, {
          $set: { status: "failed", description: `Cashout rejected — ₦${cashout.amount.toLocaleString()} refunded to referral wallet` },
        });
      }

      // Credit back transaction
      await WalletTransactionModel.create({
        userId: user._id,
        type: "adjustment",
        direction: "credit",
        amount: cashout.amount,
        balanceBefore: user.referralWalletBalance - cashout.amount,
        balanceAfter: refundedBalance,
        description: `Cashout request rejected — balance refunded`,
        status: "completed",
      });

      // Email user (non-blocking)
      sendCashoutRejectedUserEmail({ user, amount: cashout.amount, adminNote }).catch(
        (err) => console.error("[admin/cashouts] Rejected email failed (non-fatal):", err?.message)
      );

      return NextResponse.json(
        { success: true, message: `Cashout request rejected. Balance of ₦${cashout.amount.toLocaleString()} refunded to user's referral wallet.` },
        { status: 200, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error("[admin/cashouts] PATCH error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
  }
}
