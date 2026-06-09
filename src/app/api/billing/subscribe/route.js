import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import TransactionModel from "@/app/ults/models/TransactionModel";
import PlanModel from "@/app/ults/models/PlanModel";
import {
  ensureReferralCode,
  processReferralReward,
} from "@/app/lib/referralService";

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

    const { plan: planKey, paymentType = "wallet", reference } = await req.json();
    console.log("Subscribing to plan: ", planKey, "via", paymentType);

    // Fetch plan details from Database instead of hardcoded catalogue
    const planMeta = await PlanModel.findOne({ key: planKey });

    if (!planMeta) {
      return NextResponse.json(
        { success: false, message: "This plan is no longer available." },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (!planMeta.isActive) {
      return NextResponse.json(
        { success: false, message: "This plan is currently undergoing maintenance and cannot be purchased." },
        { status: 403, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    /* ── Payment deduction check ────────────────────────────── */
    const balanceBefore = user.walletBalance;
    let balanceAfter = balanceBefore;

    if (paymentType === "wallet") {
      if (balanceBefore < planMeta.price) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient wallet balance. You need ₦${planMeta.price.toLocaleString()} but have ₦${balanceBefore.toLocaleString()}.`,
          },
          { status: 400, headers: corsHeaders() }
        );
      }
      balanceAfter = balanceBefore - planMeta.price;
      user.walletBalance = balanceAfter;
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    /* ── Upgrade plan atomically ────────────────────────────── */
    user.paxAI.plan = planKey;
    user.paxAI.maxMonthlyMessages = planMeta.messagesLimit;
    user.paxAI.messagesUsedThisMonth = 0;       // reset monthly counter
    user.paxAI.broadcastContactsLimit = planMeta.broadcastContactsLimit;
    user.paxAI.broadcastContactsUsedThisMonth = 0;
    user.paxAI.scheduledBroadcast = planMeta.scheduledBroadcast;
    user.paxAI.segmentation = planMeta.segmentation;
    user.paxAI.bulkSequences = planMeta.bulkSequences;
    user.paxAI.removeBranding = planMeta.removeBranding;
    user.paxAI.multiStaff = planMeta.multiStaff;
    user.paxAI.webhookAccess = planMeta.webhookAccess;
    user.paxAI.planStartedAt = now;              // start new billing cycle
    user.paxAI.lastUpdated = now;

    // Reset message handled count for all contacts
    if (user.whatsapp && user.whatsapp.contacts && Array.isArray(user.whatsapp.contacts.list)) {
      user.whatsapp.contacts.list.forEach(contact => {
        contact.messageCount = 0;
      });
    }

    // Increment Plan Revenue Tracking
    if (!user.planAnalytics) {
      user.planAnalytics = { aiMessagesUsed: 0, broadcastSent: 0, planRevenue: 0, metaCost: 0 };
    }
    user.planAnalytics.planRevenue += planMeta.price;

    await user.save();

    /* ── Ensure paid user gets a referral code ────────────────── */
    await ensureReferralCode(user);

     /* ── Record transaction ───────────────────────────────────── */
    const finalReference = reference || `PAX-SUB-${planKey.toUpperCase()}-${Date.now()}`;
    await TransactionModel.create({
      userId,
      type: "ai-automation-subscription",
      amount: planMeta.price,
      currency: "NGN",
      status: "success",
      reference: finalReference,
      meta: {
        subscription: {
          plan: planMeta.label,
          billingCycle: "monthly",
          featureTag: "ai-automation",
          expiresAt,
        },
      },
    });

    /* ── Process referral reward (if this user was referred) ──── */
    let referralRewarded = false;
    let referralRewardAmount = 0;
    try {
      const result = await processReferralReward(userId, planKey);
      referralRewarded = result.rewarded;
      referralRewardAmount = result.amount;
    } catch (refErr) {
      // Non-fatal — log and continue
      console.error("Referral reward error (non-fatal):", refErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: `You are now on the ${planMeta.label} plan! 🎉`,
        plan: planKey,
        balanceAfter,
        expiresAt,
        referral: referralRewarded
          ? { rewarded: true, amount: referralRewardAmount }
          : undefined,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Billing subscribe error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
