import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import PlanModel from "@/app/ults/models/PlanModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).select("paxAI").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const paxAI = user.paxAI || {};
    const planKey = paxAI.plan || "free";
    const planMeta = await PlanModel.findOne({ key: planKey }).lean();

    const isEnterprise = planKey === "enterprise";
    const isBusiness = planKey === "business";
    const isStarter = planKey === "starter";

    const messagesLimit = planMeta?.messagesLimit ?? paxAI.maxMonthlyMessages ?? 200;
    const messagesUsed = paxAI.messagesUsedThisMonth || 0;

    const rawBroadcastLimit = planMeta?.broadcastContactsLimit ?? paxAI.broadcastContactsLimit;
    const isUnlimitedBroadcast = rawBroadcastLimit === null || (isEnterprise && rawBroadcastLimit === undefined);
    const broadcastLimit = isUnlimitedBroadcast ? null : (rawBroadcastLimit ?? (isBusiness ? 500 : isStarter ? 100 : 0));
    const broadcastUsed = paxAI.broadcastContactsUsedThisMonth || 0;

    const productsLimit = planMeta?.productsLimit ?? paxAI.productsLimit ?? (isEnterprise ? 0 : isBusiness ? 100 : isStarter ? 50 : 10);

    return NextResponse.json(
      {
        success: true,
        data: {
          plan: planKey,
          planStartedAt: paxAI.planStartedAt || null,
          messages: {
            limit: messagesLimit,
            used: messagesUsed,
            remaining: Math.max(0, messagesLimit - messagesUsed),
            percentage: messagesLimit > 0 ? Math.min(100, Math.round((messagesUsed / messagesLimit) * 100)) : 0,
          },
          broadcast: {
            limit: broadcastLimit,
            used: broadcastUsed,
            isUnlimited: isUnlimitedBroadcast,
            remaining: isUnlimitedBroadcast ? null : Math.max(0, (broadcastLimit || 0) - broadcastUsed),
            percentage: isUnlimitedBroadcast || !broadcastLimit ? 0 : Math.min(100, Math.round((broadcastUsed / broadcastLimit) * 100)),
          },
          products: {
            limit: productsLimit,
            isUnlimited: productsLimit === 0,
          },
          features: {
            canBroadcast: planKey !== "free" && (isUnlimitedBroadcast || (broadcastLimit || 0) > 0),
            canSchedule: !!(planMeta?.scheduledBroadcast ?? paxAI.scheduledBroadcast),
            canSegment: !!(planMeta?.segmentation ?? paxAI.segmentation),
            canBulkSequence: !!(planMeta?.bulkSequences ?? paxAI.bulkSequences),
            salesAnalyticsEnabled: !!(planMeta?.salesAnalyticsEnabled ?? paxAI.salesAnalyticsEnabled),
            salesAnalyticsDays: planMeta?.salesAnalyticsDays ?? paxAI.salesAnalyticsDays ?? 7,
            leadFollowupEnabled: !!(planMeta?.leadFollowupEnabled ?? paxAI.leadFollowupEnabled),
            leadQualificationEnabled: !!(planMeta?.leadQualificationEnabled ?? paxAI.leadQualificationEnabled),
            productRecommendations: !!(planMeta?.productRecommendations ?? paxAI.productRecommendations),
            removeBranding: !!(planMeta?.removeBranding ?? paxAI.removeBranding),
            multiStaff: planMeta?.multiStaff ?? paxAI.multiStaff ?? 0,
            whatsappNumbersLimit: planMeta?.whatsappNumbersLimit ?? paxAI.whatsappNumbersLimit ?? 1,
          },
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("GET /api/user/plan-usage error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
