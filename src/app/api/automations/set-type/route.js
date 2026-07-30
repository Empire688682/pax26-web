import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    await connectDb();

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

    const { newType } = await req.json();

    if (!newType || !["seller", "service"].includes(newType)) {
      return NextResponse.json(
        { success: false, message: "newType must be 'seller' or 'service'" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Set the business type (no deletion — this is first-time selection)
    user.paxAI.businessType = newType;
    user.paxAI.lastUpdated = new Date();
    await user.save();

    return NextResponse.json(
      { success: true, message: `Business type set to ${newType}` },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error in POST /automations/set-type:", error);
    return NextResponse.json(
      { success: false, message: "Failed to set business type. Please try again." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
