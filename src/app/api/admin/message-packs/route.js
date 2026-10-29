/**
 * GET  /api/admin/message-packs   — returns full pack list (including inactive)
 * PUT  /api/admin/message-packs   — replaces the entire packs array
 *
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import MessagePackModel from "@/app/ults/models/MessagePackModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  await connectDb();
  try {
    const adminId = await verifyToken(req);
    if (!adminId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    const admin = await UserModel.findById(adminId).select("isAdmin").lean();
    if (!admin?.isAdmin) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers: corsHeaders() });

    const doc = await MessagePackModel.findOne({ key: "default" }).lean();
    return NextResponse.json({ success: true, packs: doc?.packs || [] }, { status: 200, headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(req) {
  await connectDb();
  try {
    const adminId = await verifyToken(req);
    if (!adminId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    const admin = await UserModel.findById(adminId).select("isAdmin").lean();
    if (!admin?.isAdmin) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers: corsHeaders() });

    const { packs } = await req.json();
    if (!Array.isArray(packs)) {
      return NextResponse.json({ success: false, message: "packs must be an array" }, { status: 400, headers: corsHeaders() });
    }

    // Validate each pack
    for (const pack of packs) {
      if (!pack.id?.trim() || !pack.label?.trim()) {
        return NextResponse.json({ success: false, message: "Each pack needs an id and label" }, { status: 400, headers: corsHeaders() });
      }
      if (typeof pack.messages !== "number" || pack.messages <= 0) {
        return NextResponse.json({ success: false, message: `Pack "${pack.id}" must have messages > 0` }, { status: 400, headers: corsHeaders() });
      }
      if (typeof pack.price !== "number" || pack.price < 0) {
        return NextResponse.json({ success: false, message: `Pack "${pack.id}" must have price >= 0` }, { status: 400, headers: corsHeaders() });
      }
    }

    const doc = await MessagePackModel.findOneAndUpdate(
      { key: "default" },
      { $set: { packs } },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json({ success: true, packs: doc.packs }, { status: 200, headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders() });
  }
}
