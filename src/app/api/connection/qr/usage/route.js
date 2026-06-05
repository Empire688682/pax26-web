/**
 * GET  /api/connection/qr/usage
 *
 * Returns the current week's QR usage stats for the authenticated user.
 * Frontend uses this to decide whether to show the ban-risk banner.
 *
 * Response:
 * {
 *   success: true,
 *   weeklyCount: 312,
 *   dailyCount: 45,
 *   dailyLimit: 200,
 *   banRiskThreshold: 500,
 *   isBanRisk: false,
 *   isDailyLimitReached: false,
 *   weekStart: "2025-06-02T00:00:00.000Z"
 * }
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import QRUsageModel from "@/app/ults/models/QRUsageModel";
import UserModel from "@/app/ults/models/UserModel";
import PlanModel from "@/app/ults/models/PlanModel";
import { getWeekStart, getTodayStr } from "@/app/ults/utils/dateUtils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Only relevant for QR-connected users
    if (user.whatsapp?.connectionType !== "qr") {
      return NextResponse.json(
        { success: true, weeklyCount: 0, dailyCount: 0, isBanRisk: false, isDailyLimitReached: false },
        { status: 200, headers: corsHeaders() }
      );
    }

    // Fetch plan config for limits
    const planKey = user.paxAI?.plan || "free";
    const plan = await PlanModel.findOne({ key: planKey }).lean();
    const dailyLimit = plan?.dailyMessageLimit ?? 200;
    const banRiskThreshold = plan?.banRiskThreshold ?? 500;

    const weekStart = getWeekStart();
    const todayStr = getTodayStr();

    const usage = await QRUsageModel.findOne({ userId, weekStart }).lean();

    const weeklyCount = usage?.weeklyCount ?? 0;
    const dailyCount = usage?.dailyDate === todayStr ? (usage?.dailyCount ?? 0) : 0;

    return NextResponse.json(
      {
        success: true,
        weeklyCount,
        dailyCount,
        dailyLimit,
        banRiskThreshold,
        isBanRisk: weeklyCount >= banRiskThreshold,
        isDailyLimitReached: dailyLimit > 0 && dailyCount >= dailyLimit,
        weekStart: weekStart.toISOString(),
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[qr/usage] GET error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
