/**
 * GET /api/billing/message-packs
 *
 * Returns the active extra message top-up packs.
 * Public — no auth required (prices are not sensitive).
 * Both web billing page and mobile upgrade screen call this on mount.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { getMessagePacks } from "@/app/ults/models/MessagePackModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  await connectDb();
  try {
    const packs = await getMessagePacks();
    return NextResponse.json(
      { success: true, packs },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("message-packs GET error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load packs" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
