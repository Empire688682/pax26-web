import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { policy } = await req.json();

    if (!policy || !["allow", "block", "ask"].includes(policy)) {
      return NextResponse.json(
        { success: false, message: "Invalid policy" },
        { status: 400, headers: corsHeaders() }
      );
    }

    await UserModel.findByIdAndUpdate(userId, {
      $set: { "whatsapp.contacts.unknownContactPolicy": policy }
    });

    return NextResponse.json(
      { success: true, message: "Policy updated successfully" },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("UpdatePolicyErr:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
