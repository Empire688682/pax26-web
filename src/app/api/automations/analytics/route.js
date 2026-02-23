import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import AutomationExecutionModel from "@/app/ults/models/AutomationExecutionModel";

export async function GET(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await AutomationExecutionModel.aggregate([
      {
        $match: { userId: userId.toString() }
      },

      {
        $facet: {

          totalRuns: [
            { $count: "count" }
          ],

          todayRuns: [
            { $match: { executedAt: { $gte: today } } },
            { $count: "count" }
          ],

          successRate: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],

          avgResponseTime: [
            {
              $group: {
                _id: null,
                avg: { $avg: "$responseTime" }
              }
            }
          ],

          topAutomation: [
            {
              $group: {
                _id: "$automationId",
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
          ],

          recentExecutions: [
            { $sort: { executedAt: -1 } },
            { $limit: 10 }
          ]

        }
      }
    ]);

    const data = stats[0];

    const totalRuns = data.totalRuns[0]?.count || 0;
    const todayRuns = data.todayRuns[0]?.count || 0;
    const avgResponseTime = Math.round(data.avgResponseTime[0]?.avg || 0);

    const successCount =
      data.successRate.find(s => s._id === "success")?.count || 0;

    const successRate = totalRuns
      ? ((successCount / totalRuns) * 100).toFixed(1)
      : 0;

    const topAutomation = data.topAutomation[0]?._id || null;

    return NextResponse.json({
      success: true,
      analytics: {
        totalRuns,
        todayRuns,
        successRate,
        avgResponseTime,
        topAutomation,
        recentExecutions: data.recentExecutions
      }
    });

  } catch (error) {
    console.error("Automation analytics error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}