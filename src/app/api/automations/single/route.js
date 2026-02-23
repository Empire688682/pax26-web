import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import AutomationExecutionModel from "@/app/ults/models/AutomationExecutionModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";
import AdminAutomationModel from "@/app/ults/models/AdminAutomationModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    const { searchParams } = new URL(req.url);
    const automationId = searchParams.get("id");

    if (!automationId) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Automation ID required" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    /* ----------------------------
       1️⃣ Check user owns automation
    ----------------------------- */

    const automationDoc = await UserAutomationModel.findOne({ userId });

    if (!automationDoc) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "User automations not found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    const adminAutomation = await AdminAutomationModel.findById(automationId);
    if (!adminAutomation) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Automation not found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    let automation = automationDoc.automations.find(
      (a) => a.automationId === automationId
    );

    if (!automation) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Automation not found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    /* ----------------------------
       2️⃣ Automation Analytics
    ----------------------------- */

    const executions = await AutomationExecutionModel.find({
      userId: userId.toString(),
      automationId
    })
      .sort({ executedAt: -1 })
      .limit(20);

    const totalRuns = await AutomationExecutionModel.countDocuments({
      userId: userId.toString(),
      automationId
    });

    const successRuns = await AutomationExecutionModel.countDocuments({
      userId: userId.toString(),
      automationId,
      status: "success"
    });

    const avgResponse = await AutomationExecutionModel.aggregate([
      {
        $match: {
          userId: userId.toString(),
          automationId
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$responseTime" }
        }
      }
    ]);

    const avgResponseTime = Math.round(avgResponse[0]?.avg || 0);

    const successRate = totalRuns
      ? ((successRuns / totalRuns) * 100).toFixed(1)
      : 0;

    const mergedAutomation = {
      ...automation.toObject(),      // user automation fields
      name: adminAutomation.name,
      description: adminAutomation.description,
      trigger: adminAutomation.trigger,
      action: adminAutomation.action,
    };

    return new NextResponse(
      JSON.stringify({
        success: true,
        automation: mergedAutomation,
        analytics: {
          totalRuns,
          successRuns,
          successRate,
          avgResponseTime,
          recentExecutions: executions
        }
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Fetch automation analytics error:", error);

    return new NextResponse(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}