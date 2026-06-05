/**
 * POST /api/connection/qr/risk-ack
 *
 * Records that the authenticated user has acknowledged the QR connection
 * risk disclaimer. Stored on the user record so the backend is the source
 * of truth (not just a localStorage flag).
 *
 * Body: {}  (no payload needed — the act of calling is the acknowledgement)
 *
 * Response: { success: true }
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";

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

    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        "whatsapp.qr.riskAcknowledgedAt": new Date(),
      },
    });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[qr/risk-ack] POST error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
