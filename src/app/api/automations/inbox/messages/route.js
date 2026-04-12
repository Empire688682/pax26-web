// src/app/api/inbox/messages/route.js
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import AIMessageModel from "@/app/ults/models/AIMessageModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();
    const userId = await verifyToken(req);
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const messages = await AIMessageModel.find({
      userId,
      $or: [{ from: phone }, { to: phone }],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark inbound messages as read
    await AIMessageModel.updateMany(
      { userId, from: phone, direction: "inbound", status: "received" },
      { status: "read" }
    );

    return NextResponse.json(
      { success: true, data: messages },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.log("InboxMessagesErr:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500, headers: corsHeaders() }
    );
  }
}