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
        JSON.stringify({ success: false, message: "Automation ID is required" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const automationDoc = await UserAutomationModel.findOne({ userId });

    if (!automationDoc) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "No automations found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    const automation = automationDoc.aiAutomations.id(automationId);

    if (!automation) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Automation not found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    return new NextResponse(
      JSON.stringify({ success: true, automation }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Fetch single automation error:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}
