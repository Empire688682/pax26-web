/**
 * GET /api/store/check-slug?slug=jaystore
 *
 * Authenticated. Checks whether a given slug is available.
 * Returns { available: true/false }.
 *
 * If the slug already belongs to the requesting user's profile,
 * it is considered "available" (they can keep their own slug).
 */

import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import { generateSlug } from "@/app/lib/store/generateSlug";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("slug") || "";
    const slug = generateSlug(raw);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // A slug is available if no profile has it, OR if the only profile with it
    // is the requesting user's own profile
    const existing = await SellerProfileModel.findOne({ slug }).lean();

    const available =
      !existing || existing.userId.toString() === userId.toString();

    return NextResponse.json(
      { success: true, slug, available },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("GET /api/store/check-slug error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
