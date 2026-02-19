import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import AdminAutomationModel from "@/app/ults/models/AdminAutomationModel";
import { NextResponse } from "next/server";

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
    const automations = await AdminAutomationModel.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      count: automations.length,
      automations,
      message: "System automations retrieved successfully",
    }, {status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error("GET Admin Automations:", error);
    return NextResponse.json({
      success: false,
      message: "Server error",
    }, {status: 500, headers: corsHeaders() });
  }
};