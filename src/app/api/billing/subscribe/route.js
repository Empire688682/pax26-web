import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import TransactionModel from "@/app/ults/models/TransactionModel";

/* ── Plan catalogue (single source of truth) ─────────────────── */
export const PLAN_CATALOGUE = {
  starter: {
    label: "Starter Plan",
    price: 5000,
    maxMonthlyMessages: 500,
    billingCycle: "monthly",
  },
  business: {
    label: "Business Plan",
    price: 25000,
    maxMonthlyMessages: 3000,
    billingCycle: "monthly",
  },
  enterprise: {
    label: "Enterprise Plan",
    price: 75000,
    maxMonthlyMessages: 20000,
    billingCycle: "monthly",
  },
};

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

    const { plan } = await req.json();
    console.log("plan: ", plan);

    const planMeta = PLAN_CATALOGUE[plan];
    if (!planMeta) {
      return NextResponse.json(
        { success: false, message: "Invalid plan selected" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    /* ── Wallet check ─────────────────────────────────────────── */
    const balanceBefore = user.walletBalance;
    if (balanceBefore < planMeta.price) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient wallet balance. You need ₦${planMeta.price.toLocaleString()} but have ₦${balanceBefore.toLocaleString()}.`,
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const balanceAfter = balanceBefore - planMeta.price;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    /* ── Deduct wallet + upgrade plan atomically ──────────────── */
    user.walletBalance = balanceAfter;
    user.paxAI.plan = plan;
    user.paxAI.maxMonthlyMessages = planMeta.maxMonthlyMessages;
    user.paxAI.messagesUsedThisMonth = 0;       // reset monthly counter
    user.paxAI.planStartedAt = now;              // start new billing cycle
    user.paxAI.lastUpdated = now;
    await user.save();

    /* ── Record transaction ───────────────────────────────────── */
    const reference = `PAX-SUB-${plan.toUpperCase()}-${Date.now()}`;
    await TransactionModel.create({
      userId,
      type: "ai-automation-subscription",
      amount: planMeta.price,
      currency: "NGN",
      status: "success",
      reference,
      meta: {
        subscription: {
          plan: planMeta.label,
          billingCycle: planMeta.billingCycle,
          featureTag: "ai-automation",
          expiresAt,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `You are now on the ${planMeta.label}! 🎉`,
        plan,
        balanceAfter,
        expiresAt,
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
