import BusinessProfile from "@/models/BusinessProfile";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function PUT(req) {
  try {
    await connectDb();

    // Get user ID from token
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Verify user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Parse request body
    const data = await req.json();

    // Update or create BusinessProfile
    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      {
        ...data,
        aiTrained: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, profile },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error in POST /ai-train:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
