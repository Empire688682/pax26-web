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

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ success: false, message: "No access token" }, { status: 400 });
    }

    // 🔥 Step 1: Get Businesses
    const bizRes = await fetch(
      `https://graph.facebook.com/v22.0/me/businesses?access_token=${accessToken}`
    );
    const bizData = await bizRes.json();

    console.log("🏢 Businesses:", bizData);

    if (!bizData?.data?.length) {
      return NextResponse.json({
        success: false,
        message: "No business found",
      });
    }

    const allPhones = [];

    // 🔥 Step 2: Loop businesses → get WABAs
    for (const biz of bizData.data) {
      const wabaRes = await fetch(
        `https://graph.facebook.com/v22.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
      );
      const wabaData = await wabaRes.json();

      console.log(`📦 WABAs for business ${biz.id}:`, wabaData);

      for (const waba of wabaData?.data || []) {
        // 🔥 Step 3: Get phone numbers
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
      return NextResponse.json({
        success: false,
        message: "No phone numbers found",
      });
    }

    // ✅ SINGLE PHONE → AUTO CONNECT
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

      return NextResponse.json({
        success: true,
        type: "single",
      });
    }

    // 📲 MULTIPLE PHONES → CREATE SESSION
    const sessionId = crypto.randomUUID();

    await TempSessionModel.create({
      sessionId,
      userId,
      accessToken,
      phones: allPhones,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return NextResponse.json({
      success: true,
      type: "multiple",
      sessionId,
    });

  } catch (error) {
    console.log("use-tokenErr:", error);
    console.log("use-token error:", error.message);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}