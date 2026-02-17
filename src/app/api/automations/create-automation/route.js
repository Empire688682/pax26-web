import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";

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

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (!user.paxAI?.enabled) {
      return NextResponse.json(
        { success: false, message: "AI features are disabled" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { name, trigger, action, type } = await req.json();

    if (!name || !trigger || !action || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Find user's PaxAI brain
    let automationDoc = await UserAutomationModel.findOne({ userId });

    // Prevent duplicate automation
    if (
      automationDoc?.aiAutomations?.some(
        (a) =>
          a.name === name &&
          a.trigger === trigger &&
          a.action === action &&
          a.type === type
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Automation already exists" },
        { status: 409, headers: corsHeaders() }
      );
    }

    if (!automationDoc) {
      // First automation = create brain
      automationDoc = await UserAutomationModel.create({
        userId,
        aiAutomations: [{ name, trigger, action, type }],
      });
    } else {
      // Append to existing brain
      automationDoc.aiAutomations.push({ name, trigger, action, type});
      await automationDoc.save();
    }

    return NextResponse.json(
      { success: true, message: "Automation added to PaxAI brain" },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Automation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
