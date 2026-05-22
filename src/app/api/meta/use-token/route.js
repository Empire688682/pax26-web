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

    // ── Step 2: Get code from request body ────────────────────
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, message: "No code provided" }, { status: 400, headers: corsHeaders() });
    }

    // ── Step 3: Exchange code for access token ────────────────
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      code,
    });

    const tokenRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?${params}`
    );
    const tokenData = await tokenRes.json();

    console.log("🔄 tokenData:", tokenData);

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return NextResponse.json({ success: false, message: tokenData.error.message }, { status: 400, headers: corsHeaders() });
    }

    const accessToken = tokenData.access_token;
    console.log("✅ Access token received");

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
            quality: p.quality_rating,
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
        whatsapp: {
          connected: true,
          accessToken,
          wabaId: phone.wabaId,
          phoneNumberId: phone.id,
          displayPhone: phone.display,
          connectedAt: new Date(),
          permissions: { messaging: true, management: true },
        },
        whatsappConnected: true,
        paxAI: { enabled: true },
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