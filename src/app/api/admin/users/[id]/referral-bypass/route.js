/**
 * PATCH /api/admin/users/[id]/referral-bypass
 *
 * Toggle or explicitly set the referralBypassEnabled flag on a user.
 * Admin-only. Granting bypass also ensures the user has a referral code.
 *
 * Body: { enabled: true | false }
 *
 * When enabled = true:
 *   - Sets referralBypassEnabled = true
 *   - Sets referralBypassGrantedAt = now
 *   - Generates a referral code if the user doesn't already have one
 *
 * When enabled = false:
 *   - Clears referralBypassEnabled
 *   - Clears referralBypassGrantedAt
 *   - Referral code is kept (they may have already shared it)
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import { ensureReferralCode } from "@/app/lib/referralService";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function PATCH(req, { params }) {
  await connectDb();
  try {
    const adminId = await verifyToken(req);
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Confirm caller is admin
    const admin = await UserModel.findById(adminId).select("isAdmin").lean();
    if (!admin?.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden — admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { id } = await params;
    const { enabled } = await req.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "enabled must be a boolean" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    user.referralBypassEnabled  = enabled;
    user.referralBypassGrantedAt = enabled ? new Date() : null;

    // When granting bypass, ensure the user has a referral code immediately
    if (enabled) {
      await ensureReferralCode(user); // saves user internally if code is generated
    } else {
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: enabled
          ? `Referral bypass granted to ${user.name || user.email}. They can now share their referral code.`
          : `Referral bypass revoked for ${user.name || user.email}.`,
        referralBypassEnabled: user.referralBypassEnabled,
        referralCode: user.referralCode || null,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("[referral-bypass] PATCH error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
