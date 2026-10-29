/**
 * POST /api/billing/buy-messages
 *
 * Purchase an extra message top-up pack.
 * Option A: messages are added directly to paxAI.maxMonthlyMessages.
 * They reset to 0 at the next billing cycle (plan renewal or new subscription).
 *
 * Body: { packId: "small" | "medium" | "large" | "xl" }
 *
 * Pack definitions are sourced from MESSAGE_PACKS below.
 * The price-per-message (extraMessagePrice) from PlanModel is used as the
 * per-message cost multiplier if set; packs have their own fixed prices.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import TransactionModel from "@/app/ults/models/TransactionModel";
import { getMessagePacks } from "@/app/ults/models/MessagePackModel";

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

    const { packId } = await req.json();

    // Load packs from DB — admin controls prices, not code
    const packs = await getMessagePacks();
    const pack  = packs.find(p => p.id === packId);

    if (!pack) {
      const validIds = packs.map(p => p.id).join(", ");
      return NextResponse.json(
        { success: false, message: `Invalid pack. Available packs: ${validIds || "none configured"}` },
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

    // Free users cannot purchase top-ups (they have no active AI plan to top up)
    const plan = user.paxAI?.plan || "free";
    if (plan === "free") {
      return NextResponse.json(
        {
          success: false,
          message: "Extra message packs are only available on paid plans. Subscribe to a paid plan first.",
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Check wallet balance
    const balance = user.walletBalance || 0;
    if (balance < pack.price) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient wallet balance. You need ₦${pack.price.toLocaleString()} but have ₦${balance.toLocaleString()}.`,
          required: pack.price,
          available: balance,
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Deduct wallet and add messages to quota (Option A)
    const balanceBefore  = balance;
    const balanceAfter   = balance - pack.price;
    const quotaBefore    = user.paxAI.maxMonthlyMessages || 0;
    const quotaAfter     = quotaBefore + pack.messages;

    user.walletBalance               = balanceAfter;
    user.paxAI.maxMonthlyMessages    = quotaAfter;
    user.paxAI.extraMessagesPurchased = (user.paxAI.extraMessagesPurchased || 0) + pack.messages;
    user.paxAI.lastUpdated           = new Date();

    await user.save();

    // Record transaction
    const reference = `PAX-MSG-${packId.toUpperCase()}-${Date.now()}`;
    await TransactionModel.create({
      userId,
      type: "ai-message-purchase",
      description: `${pack.label} — +${pack.messages.toLocaleString()} AI messages`,
      amount: pack.price,
      currency: "NGN",
      status: "success",
      reference,
      meta: {
        subscription: {
          plan: `message-topup-${packId}`,
          billingCycle: "one-time",
          featureTag: "ai-message-topup",
          expiresAt: user.paxAI.planExpiresAt, // expires with the current plan cycle
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `✅ +${pack.messages.toLocaleString()} messages added to your plan! New quota: ${quotaAfter.toLocaleString()} messages.`,
        newQuota:     quotaAfter,
        balanceAfter,
        pack: {
          id:       packId,
          label:    pack.label,
          messages: pack.messages,
          price:    pack.price,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("buy-messages error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
