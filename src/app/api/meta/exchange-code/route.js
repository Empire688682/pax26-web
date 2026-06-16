import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { verifyToken } from "../../helper/VerifyToken";
import crypto from "crypto";

// ── Helpers ───────────────────────────────────────────────────

/**
 * Generate a random 6-digit PIN and return it plus its
 * AES-256-CBC encrypted form for storage in MongoDB.
 * The encryption key comes from SECRET_KEY in .env.
 */
function generateAndEncryptPin() {
  const pin = String(Math.floor(100000 + Math.random() * 900000)); // always 6 digits
  const key  = crypto.scryptSync(process.env.SECRET_KEY || "pax26", "pax26salt", 32);
  const iv   = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(pin, "utf8"), cipher.final()]);
  const stored = `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  return { pin, stored };
}

/**
 * Subscribe our app to a WABA so we receive webhooks for that client.
 * Must be called once per new WABA — safe to call again on duplicates.
 */
async function subscribeToWaba(wabaId, accessToken) {
  try {
    const res  = await fetch(`https://graph.facebook.com/v22.0/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.error) {
      console.error(`❌ subscribed_apps failed for WABA ${wabaId}:`, JSON.stringify(data.error));
      return false;
    }
    console.log(`✅ subscribed_apps success for WABA ${wabaId}:`, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`❌ subscribed_apps exception for WABA ${wabaId}:`, err.message);
    return false;
  }
}

/**
 * Register a phone number on WhatsApp Cloud API.
 * This is the step that moves the number from "Pending" to "Connected".
 * Returns { success, pin, encryptedPin } on success.
 */
async function registerPhoneNumber(phoneNumberId, accessToken) {
  const { pin, stored } = generateAndEncryptPin();
  try {
    const res  = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", pin }),
    });
    const data = await res.json();
    if (data.error) {
      console.error(`❌ register failed for phone ${phoneNumberId}:`, JSON.stringify(data.error));
      return { success: false, error: data.error };
    }
    console.log(`✅ register success for phone ${phoneNumberId}:`, JSON.stringify(data));
    return { success: true, pin, encryptedPin: stored };
  } catch (err) {
    console.error(`❌ register exception for phone ${phoneNumberId}:`, err.message);
    return { success: false, error: err.message };
  }
}

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

    // ── Step 2: Get code + optional session info from body ────
    // wabaId + phoneNumberId come from Meta's postMessage (sessionInfoVersion: 3)
    const { code, wabaId: hintWabaId, phoneNumberId: hintPhoneId } = await req.json();
    if (!code) {
      return NextResponse.json(
        { success: false, message: "No code provided" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ── Step 3: Exchange code for access token ────────────────
    // NOTE: redirect_uri intentionally omitted — FB.login() popup uses
    // Meta's internal xd_arbiter URL; including any URI causes a mismatch error.
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
      return NextResponse.json(
        { success: false, message: tokenData.error.message },
        { status: 400, headers: corsHeaders() }
      );
    }

    const accessToken = tokenData.access_token;
    console.log("✅ Access token received");

    // ── Step 4: Build phone list ───────────────────────────────
    // PATH A: Use WABA + phone IDs from Meta's postMessage (fastest, most reliable)
    // PATH B: Discover via Graph API (fallback)
    const qualityMap = { GREEN: "GREEN", YELLOW: "YELLOW", RED: "RED" };
    const phones = [];

    if (hintWabaId && hintPhoneId) {
      // ✅ PATH A — session info from postMessage
      console.log("📨 Using session info from postMessage:", { hintWabaId, hintPhoneId });

      const phoneRes = await fetch(
        `https://graph.facebook.com/v22.0/${hintPhoneId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${accessToken}`
      );
      const phoneData = await phoneRes.json();

      if (phoneData.error) {
        console.error("Phone fetch error:", phoneData.error);
        return NextResponse.json(
          { success: false, message: `Phone lookup failed: ${phoneData.error.message}` },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Get WABA name for display
      const wabaRes = await fetch(
        `https://graph.facebook.com/v22.0/${hintWabaId}?fields=id,name&access_token=${accessToken}`
      );
      const wabaData = await wabaRes.json();

      phones.push({
        id: phoneData.id,
        display: phoneData.display_phone_number,
        name: phoneData.verified_name,
        quality: qualityMap[phoneData.quality_rating] || "UNKNOWN",
        verificationStatus: phoneData.code_verification_status || "NOT_VERIFIED",
        wabaId: hintWabaId,
        wabaName: wabaData.name || "",
      });

    } else {
      // ✅ PATH B — Fallback: discover WABAs via business portfolios
      console.log("🔍 No session info — falling back to business-based WABA discovery");

      const bizRes = await fetch(
        `https://graph.facebook.com/v22.0/me/businesses?access_token=${accessToken}`
      );
      const bizData = await bizRes.json();

      console.log("🏢 Businesses response:", JSON.stringify(bizData));

      if (bizData.error) {
        console.error("Businesses fetch error:", bizData.error);
        return NextResponse.json(
          {
            success: false,
            message: `Business lookup failed: ${bizData.error.message} (code ${bizData.error.code})`,
          },
          { status: 400, headers: corsHeaders() }
        );
      }

      const businesses = bizData?.data || [];
      if (businesses.length === 0) {
        return NextResponse.json(
          { success: false, message: "No business portfolios found on this Meta account." },
          { status: 400, headers: corsHeaders() }
        );
      }

      for (const biz of businesses) {
        const wabaRes = await fetch(
          `https://graph.facebook.com/v22.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
        );
        const wabaData = await wabaRes.json();

        console.log(`📦 WABAs for business ${biz.id}:`, JSON.stringify(wabaData));

        if (wabaData.error) {
          console.error(`WABA list error for business ${biz.id}:`, wabaData.error);
          continue;
        }

        for (const waba of wabaData?.data || []) {
          const phoneRes = await fetch(
            `https://graph.facebook.com/v22.0/${waba.id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${accessToken}`
          );
          const phoneData = await phoneRes.json();

          console.log(`📞 Phones for WABA ${waba.id}:`, JSON.stringify(phoneData));

          if (phoneData.error) {
            console.error(`Phone list error for WABA ${waba.id}:`, phoneData.error);
            continue;
          }

          for (const phone of phoneData?.data || []) {
            phones.push({
              id: phone.id,
              display: phone.display_phone_number,
              name: phone.verified_name,
              quality: qualityMap[phone.quality_rating] || "UNKNOWN",
              verificationStatus: phone.code_verification_status || "NOT_VERIFIED",
              wabaId: waba.id,
              wabaName: waba.name || "",
            });
          }
        }
      }
    }

    if (phones.length === 0) {
      return NextResponse.json(
        { success: false, message: "No WhatsApp phone numbers found on this account." },
        { status: 404, headers: corsHeaders() }
      );
    }

    console.log(`✅ Found ${phones.length} phone(s)`);

    // ── Step 5: Subscribe to WABA webhooks + register each phone ─
    // Collect unique WABA IDs and subscribe once per WABA.
    const subscribedWabas = new Set();
    for (const phone of phones) {
      // 5a — Subscribe our app to this WABA (idempotent, safe to repeat)
      if (!subscribedWabas.has(phone.wabaId)) {
        await subscribeToWaba(phone.wabaId, accessToken);
        subscribedWabas.add(phone.wabaId);
      }

      // 5b — Register the phone number on Cloud API
      // This is the critical step that moves the number from Pending → Connected.
      // We skip if already VERIFIED to avoid re-registering an active number.
      if (phone.verificationStatus !== "VERIFIED") {
        const regResult = await registerPhoneNumber(phone.id, accessToken);
        if (regResult.success) {
          phone.registrationPin    = regResult.encryptedPin; // stored encrypted; passed to select-phone via TempSession
          phone.verificationStatus = "REGISTERED"; // optimistic — confirmed in select-phone
        } else {
          // Log but don't block — number may already be registered with a different pin
          console.warn(`⚠️  register did not succeed for ${phone.id} — user may still proceed`);
          phone.registrationPin = null;
        }
      } else {
        console.log(`ℹ️  Phone ${phone.id} already VERIFIED — skipping register`);
        phone.registrationPin = null;
      }
    }

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
      { success: false, message: `Server error: ${error.message}` },
      { status: 500, headers: corsHeaders() }
    );
  }
}
