import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
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
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // ── Step 2: Get code from request body ────────────────────
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json(
        { success: false, message: "No code provided" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ── Step 3: Exchange code for access token ────────────────
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.META_REDIRECT_URI,
      code,
    });

    const tokenRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?${params}`
    );
    const tokenData = await tokenRes.json();

    console.log("🔄 tokenData: ", tokenData);

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return NextResponse.json(
        { success: false, message: tokenData.error.message },
        { status: 400, headers: corsHeaders() }
      );
    }

    const accessToken = tokenData.access_token;
    console.log("✅ Access token received");

    // ── Step 4: Fetch WABAs linked to this user ───────────────
    const wabaRes = await fetch(
      `https://graph.facebook.com/v22.0/me?fields=whatsapp_business_accounts&access_token=${accessToken}`
    );
    const wabaData = await wabaRes.json();

    if (wabaData.error) {
      console.error("WABA fetch error:", wabaData.error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch WhatsApp accounts" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ── Step 5: Fetch phone numbers for each WABA ─────────────
    const phones = [];
    for (const waba of wabaData?.whatsapp_business_accounts?.data || []) {
      const phoneRes = await fetch(
        `https://graph.facebook.com/v22.0/${waba.id}/phone_numbers?access_token=${accessToken}`
      );
      const phoneData = await phoneRes.json();

      for (const phone of phoneData?.data || []) {
        phones.push({
          id: phone.id,
          display: phone.display_phone_number,
          wabaId: waba.id,
          verifiedName: phone.verified_name,
          qualityRating: phone.quality_rating,
        });
      }
    }

    if (phones.length === 0) {
      return NextResponse.json(
        { success: false, message: "No WhatsApp phone numbers found on this account." },
        { status: 404, headers: corsHeaders() }
      );
    }

    console.log(`✅ Found ${phones.length} phone(s)`);

    // ── Step 6: Save to TempSession (expires in 10 mins) ──────
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await TempSessionModel.create({
      sessionId,
      userId,
      accessToken,  // stored server-side only — never sent to browser
      phones,
      expiresAt,
    });

    console.log(`✅ TempSession created: ${sessionId}`);

    // ── Step 7: Return sessionId + phones to frontend ─────────
    // accessToken is NOT returned to the browser
    return NextResponse.json(
      { success: true, sessionId, phones },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("exchange-code error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
