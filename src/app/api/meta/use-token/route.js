import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import crypto from "crypto";
import { verifyToken } from "../../helper/VerifyToken";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    await connectDb();

    // ── Step 1: Verify logged-in user ─────────────────────────
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    // ── Step 2: Get accessToken from request body ─────────────
    // Client uses FB.login() with response_type: "token" (Embedded Signup),
    // so we receive the user access token directly.
    const { accessToken: shortLivedToken } = await req.json();
    if (!shortLivedToken) {
      return NextResponse.json({ success: false, message: "No access token provided" }, { status: 400, headers: corsHeaders() });
    }

    // ── Step 3a: Validate token with Meta ────────────────────
    // Prevents accepting fake/expired tokens from malicious clients.
    const debugRes = await fetch(
      `https://graph.facebook.com/v22.0/debug_token?input_token=${shortLivedToken}&access_token=${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
    );
    const debugData = await debugRes.json();

    if (!debugData?.data?.is_valid) {
      console.error("❌ Invalid token from client:", debugData);
      return NextResponse.json({ success: false, message: "Invalid Meta access token." }, { status: 401, headers: corsHeaders() });
    }
    console.log("✅ Token validated");

    // ── Step 3b: Exchange for long-lived token (~60 days) ────
    // Short-lived tokens from FB.login() expire in ~1 hour — unusable for production.
    const exchangeRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
    );
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error || !exchangeData.access_token) {
      console.error("❌ Long-lived token exchange failed:", exchangeData.error);
      return NextResponse.json({ success: false, message: "Failed to upgrade token." }, { status: 500, headers: corsHeaders() });
    }

    const accessToken = exchangeData.access_token;
    console.log("✅ Long-lived token obtained");

    // ── Step 4: Get Businesses ────────────────────────────────
    const bizRes = await fetch(
      `https://graph.facebook.com/v22.0/me/businesses?access_token=${accessToken}`
    );
    const bizData = await bizRes.json();

    console.log("🏢 Businesses:", bizData);

    if (!bizData?.data?.length) {
      return NextResponse.json({ success: false, message: "No business found on this account." }, { status: 404, headers: corsHeaders() });
    }

    // ── Step 5: Loop businesses → WABAs → phone numbers ──────
    const allPhones = [];
    const qualityMap = { GREEN: "GREEN", YELLOW: "YELLOW", RED: "RED" };

    for (const biz of bizData.data) {
      const wabaRes = await fetch(
        `https://graph.facebook.com/v22.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
      );
      const wabaData = await wabaRes.json();

      console.log(`📦 WABAs for business ${biz.id}:`, wabaData);

      for (const waba of wabaData?.data || []) {
        const phoneRes = await fetch(
          `https://graph.facebook.com/v22.0/${waba.id}/phone_numbers?access_token=${accessToken}`
        );
        const phoneData = await phoneRes.json();

        console.log(`📞 Phones for WABA ${waba.id}:`, phoneData);

        for (const p of phoneData?.data || []) {
          allPhones.push({
            id: p.id,
            display: p.display_phone_number,
            name: p.verified_name,
            quality: qualityMap[p.quality_rating] || "UNKNOWN",
            wabaId: waba.id,
            businessId: biz.id,
          });
        }
      }
    }

    if (allPhones.length === 0) {
      return NextResponse.json({ success: false, message: "No phone numbers found on this account." }, { status: 404, headers: corsHeaders() });
    }

    console.log(`✅ Found ${allPhones.length} phone(s)`);

    // ── Step 6a: Single phone → auto connect ─────────────────
    if (allPhones.length === 1) {
      const phone = allPhones[0];

      await UserModel.findByIdAndUpdate(userId, {
        $set: {
          "whatsapp.connected": true,
          "whatsapp.accessToken": accessToken,
          "whatsapp.wabaId": phone.wabaId,
          "whatsapp.phoneNumberId": phone.id,
          "whatsapp.displayPhone": phone.display,
          "whatsapp.connectedAt": new Date(),
          "whatsapp.permissions": { messaging: true, management: true },
          "paxAI.enabled": true,
        }
      });

      console.log("✅ Single phone auto-connected");

      return NextResponse.json(
        { success: true, type: "single" },
        { status: 200, headers: corsHeaders() }
      );
    }

    // ── Step 6b: Multiple phones → create TempSession ────────
    const sessionId = crypto.randomUUID();

    await TempSessionModel.create({
      sessionId,
      userId,
      accessToken,
      phones: allPhones,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log(`✅ TempSession created: ${sessionId}`);

    return NextResponse.json(
      { success: true, type: "multiple", sessionId },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("use-token error:", error.message);
    return NextResponse.json({ success: false, message: "Server error. Please try again." }, { status: 500, headers: corsHeaders() });
  }
}