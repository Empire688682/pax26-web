import { NextResponse } from "next/server";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    const userId = await verifyToken(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Attempt to fetch from Admin backend if configured
    if (ADMIN_URL) {
      try {
        const res = await fetch(`${ADMIN_URL}/broadcast/campaigns`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status, headers: corsHeaders() });
        }
      } catch (_) {
        // Fall back to local MongoDB
      }
    }

    // Fallback: Read directly from local MongoDB Broadcast model
    await connectDb();
    const { default: mongoose } = await import("mongoose");
    const BroadcastModel =
      mongoose.models.Broadcast ||
      mongoose.model(
        "Broadcast",
        new mongoose.Schema(
          {
            title: String,
            message: String,
            channel: { type: String, default: "whatsapp" },
            status: { type: String, default: "completed" },
            stats: { total: Number, success: Number, failed: Number },
            createdBy: mongoose.Schema.Types.ObjectId,
          },
          { timestamps: true }
        )
      );

    const campaigns = await BroadcastModel.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: campaigns },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Proxy /broadcast/campaigns error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch campaigns." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
