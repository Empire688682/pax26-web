// File: /app/api/auth/meta/callback/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

// Replace these with your real backend env variables
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = process.env.META_REDIRECT_URI;

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // 1️⃣ Exchange code for short-lived access token
    const tokenRes = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          client_id: META_APP_ID,
          redirect_uri: REDIRECT_URI,
          client_secret: META_APP_SECRET,
          code,
        },
      }
    );

    const { access_token: shortLivedToken } = tokenRes.data;

    // 2️⃣ Exchange short-lived token for long-lived token
    const longTokenRes = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: META_APP_ID,
          client_secret: META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    const { access_token: longLivedToken, expires_in } = longTokenRes.data;

    // 3️⃣ Fetch Business Manager / WhatsApp Business Account (WABA)
    const wabaRes = await axios.get(
      `https://graph.facebook.com/v19.0/me?fields=owned_businesses{owned_whatsapp_business_accounts}`,
      {
        headers: { Authorization: `Bearer ${longLivedToken}` },
      }
    );

    const wabas =
      wabaRes.data?.owned_businesses?.data[0]?.owned_whatsapp_business_accounts?.data;

    if (!wabas || wabas.length === 0) {
      return NextResponse.json(
        { error: "No WhatsApp Business Account found" },
        { status: 400 }
      );
    }

    const wabaId = wabas[0].id;

    // 4️⃣ Fetch phone numbers linked to WABA
    const phoneRes = await axios.get(
      `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
      {
        headers: { Authorization: `Bearer ${longLivedToken}` },
      }
    );

    const phoneData = phoneRes.data?.data?.[0];

    if (!phoneData) {
      return NextResponse.json(
        { error: "No phone number linked to WABA" },
        { status: 400 }
      );
    }

    const phoneNumberId = phoneData.id;
    const displayPhoneNumber = phoneData.display_phone_number;

    // 5️⃣ TODO: Save to your database (encrypt token!)
    // Example pseudo-code:
    // await db.whatsappConnections.upsert({
    //   userId: currentUserId,
    //   wabaId,
    //   phoneNumberId,
    //   displayPhoneNumber,
    //   accessToken: encrypt(longLivedToken),
    //   status: "connected",
    //   expiresAt: Date.now() + expires_in * 1000
    // });

    // 6️⃣ Redirect to Pax26 dashboard (or success page)
    return NextResponse.redirect(`${process.env.FRONTEND_URL}/ai-whatsapp-dashboard`);
  } catch (err) {
    console.error("Meta callback error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Failed to connect WhatsApp", details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
