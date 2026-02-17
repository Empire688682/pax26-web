import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";

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

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 🔹 One automation document per user
    const automationDoc = await UserAutomationModel.findOne({ userId })
      .select("automations status aiEnabled usage billing");

    if (!automationDoc) {
      return NextResponse.json(
        { success: true, automations: [] },
        { status: 200, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        automations: automationDoc.automations,
        meta: {
          status: automationDoc.status,
          aiEnabled: automationDoc.aiEnabled,
          usage: automationDoc.usage,
          billing: automationDoc.billing,
        },
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Fetch automations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch automations" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
