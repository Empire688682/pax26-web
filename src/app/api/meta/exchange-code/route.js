import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import UserModel from "@/app/ults/models/UserModel";
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
  const key = crypto.scryptSync(process.env.SECRET_KEY || "pax26", "pax26salt", 32);
  const iv = crypto.randomBytes(16);
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
    const res = await fetch(`https://graph.facebook.com/v22.0/${wabaId}/subscribed_apps`, {
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
 *
 * PIN persistence order (safe against network blips):
 *   1. Generate PIN + encrypted form
 *   2. Return both to caller BEFORE the API call result is evaluated
 *   3. Caller stores encrypted PIN in TempSession first
 *   4. Then calls this function — if the network blips after register
 *      succeeds but before DB write, the PIN is already in TempSession
 *
 * Returns { success, pin, encryptedPin, error?, conflictPin? }
 */
async function registerPhoneNumber(phoneNumberId, accessToken, existingEncryptedPin) {
  // If we already have a PIN for this number (retry scenario), reuse it
  // so we don't generate a new PIN that conflicts with what Meta already has.
  let pin, stored;
  if (existingEncryptedPin) {
    // Decrypt to get the original PIN
    try {
      const key = crypto.scryptSync(process.env.SECRET_KEY || "pax26", "pax26salt", 32);
      const [ivHex, encHex] = existingEncryptedPin.split(":");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
      pin = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
      stored = existingEncryptedPin;
    } catch {
      // If decrypt fails, generate fresh
      ({ pin, stored } = generateAndEncryptPin());
    }
  } else {
    ({ pin, stored } = generateAndEncryptPin());
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", pin }),
    });
    const data = await res.json();

    if (data.error) {
      // Error 80007 / subcode 2494055 = number already registered with a different PIN
      // (previous BSP set a PIN we don't know). Surface this clearly — do NOT silently skip.
      const isPinConflict =
        data.error.code === 80007 ||
        (data.error.error_subcode && [2494055, 2494010].includes(data.error.error_subcode));

      console.error(`❌ register failed for phone ${phoneNumberId}:`, JSON.stringify(data.error));

      return {
        success: false,
        encryptedPin: stored, // still return so caller can persist it for retry
        error: data.error,
        isPinConflict,
        userMessage: isPinConflict
          ? "This number was previously registered with another WhatsApp service provider. Please remove it from that provider first, then reconnect."
          : `Registration failed: ${data.error.message}`,
      };
    }

    console.log(`✅ register success for phone ${phoneNumberId}`);
    return { success: true, pin, encryptedPin: stored };

  } catch (err) {
    console.error(`❌ register exception for phone ${phoneNumberId}:`, err.message);
    return {
      success: false, encryptedPin: stored, error: err.message, isPinConflict: false,
      userMessage: "Registration failed due to a network error. Please try again."
    };
  }
}

/**
 * Share our Meta Business Manager credit line to a client WABA.
 * Required for the Tech Provider model — clients cannot use their own credit line.
 * Call once per new WABA after registration succeeds.
 *
 * Requires META_CREDIT_LINE_ID in .env — get this from:
 *   GET https://graph.facebook.com/v22.0/{business_id}/extendedcredits
 * with your System User token.
 */
async function shareCreditLine(wabaId, accessToken) {
  const creditLineId = process.env.META_CREDIT_LINE_ID;
  if (!creditLineId) {
    console.warn("⚠️  META_CREDIT_LINE_ID not set in .env — credit line sharing skipped. " +
      "Sending may fail with billing errors on some accounts.");
    return { success: false, skipped: true };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${creditLineId}/whatsapp_credit_sharing_and_attach`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ waba_id: wabaId, waba_currency: "USD" }),
    });
    const data = await res.json();
    if (data.error) {
      console.error(`❌ credit line sharing failed for WABA ${wabaId}:`, JSON.stringify(data.error));
      return { success: false, error: data.error };
    }
    console.log(`✅ credit line shared to WABA ${wabaId}:`, JSON.stringify(data));
    return { success: true };
  } catch (err) {
    console.error(`❌ credit line sharing exception for WABA ${wabaId}:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    await connectDb();

    console.log("📥 [Meta API exchange-code] Received exchange-code request");
    console.log("ℹ️ [Meta API exchange-code] ENV Check - META_APP_ID:", process.env.META_APP_ID ? "Set" : "MISSING ❌", "META_APP_SECRET:", process.env.META_APP_SECRET ? "Set" : "MISSING ❌", "META_CREDIT_LINE_ID:", process.env.META_CREDIT_LINE_ID ? "Set" : "MISSING ⚠️");

    // ── Step 1: Verify logged-in user ─────────────────────────
    const userId = await verifyToken(req);
    if (!userId) {
      console.warn("⚠️ [Meta API exchange-code] Unauthorized request (invalid or missing token)");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }
    console.log(`👤 [Meta API exchange-code] Verified user ID: ${userId}`);

    // ── Step 2: Get code + optional session info from body ────
    // wabaId + phoneNumberId come from Meta's postMessage (sessionInfoVersion: 3)
    const { code, wabaId: hintWabaId, phoneNumberId: hintPhoneId } = await req.json();
    console.log("📦 [Meta API exchange-code] Request Body:", {
      code: code ? `${code.substring(0, 8)}...` : null,
      hintWabaId,
      hintPhoneId,
    });

    if (!code) {
      console.error("❌ [Meta API exchange-code] No code provided in request body");
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

    console.log("🔄 [Meta API exchange-code] Exchanging code for access token via Graph API...");
    const tokenRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?${params}`
    );
    const tokenData = await tokenRes.json();

    console.log("🔄 [Meta API exchange-code] tokenData response status:", tokenRes.status);

    if (tokenData.error) {
      console.error("❌ [Meta API exchange-code] Token exchange error:", JSON.stringify(tokenData.error));
      return NextResponse.json(
        { success: false, message: tokenData.error.message },
        { status: 400, headers: corsHeaders() }
      );
    }

    const accessToken = tokenData.access_token;
    console.log("✅ [Meta API exchange-code] Access token received successfully (length:", accessToken?.length, ")");

    // ── Step 4: Build phone list ───────────────────────────────
    // PATH A: Use WABA + phone IDs from Meta's postMessage (fastest, most reliable)
    // PATH B: Discover via Graph API (fallback)
    const qualityMap = { GREEN: "GREEN", YELLOW: "YELLOW", RED: "RED" };
    const phones = [];

    if (hintWabaId && hintPhoneId) {
      // ✅ PATH A — session info from postMessage
      console.log("📨 [Meta API exchange-code] PATH A — using session info from postMessage:", { hintWabaId, hintPhoneId });

      const phoneRes = await fetch(
        `https://graph.facebook.com/v22.0/${hintPhoneId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${accessToken}`
      );
      const phoneData = await phoneRes.json();

      if (phoneData.error) {
        console.error("❌ [Meta API exchange-code] Phone fetch error (PATH A):", JSON.stringify(phoneData.error));
        return NextResponse.json(
          { success: false, message: `Phone lookup failed: ${phoneData.error.message}` },
          { status: 400, headers: corsHeaders() }
        );
      }

      console.log("📞 [Meta API exchange-code] Phone details fetched (PATH A):", phoneData);

      // Get WABA name for display
      const wabaRes = await fetch(
        `https://graph.facebook.com/v22.0/${hintWabaId}?fields=id,name&access_token=${accessToken}`
      );
      const wabaData = await wabaRes.json();

      console.log("📦 [Meta API exchange-code] WABA details fetched (PATH A):", wabaData);

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
      console.log("🔍 [Meta API exchange-code] PATH B — No postMessage hints; falling back to business discovery");

      const bizRes = await fetch(
        `https://graph.facebook.com/v22.0/me/businesses?access_token=${accessToken}`
      );
      const bizData = await bizRes.json();

      console.log("🏢 [Meta API exchange-code] Businesses response:", JSON.stringify(bizData));

      if (bizData.error) {
        console.error("❌ [Meta API exchange-code] Businesses fetch error:", JSON.stringify(bizData.error));
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
        console.warn("⚠️ [Meta API exchange-code] No business portfolios found on Meta account");
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

        console.log(`📦 [Meta API exchange-code] WABAs for business ${biz.id}:`, JSON.stringify(wabaData));

        if (wabaData.error) {
          console.error(`❌ [Meta API exchange-code] WABA list error for business ${biz.id}:`, wabaData.error);
          continue;
        }

        for (const waba of wabaData?.data || []) {
          const phoneRes = await fetch(
            `https://graph.facebook.com/v22.0/${waba.id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${accessToken}`
          );
          const phoneData = await phoneRes.json();

          console.log(`📞 [Meta API exchange-code] Phones for WABA ${waba.id}:`, JSON.stringify(phoneData));

          if (phoneData.error) {
            console.error(`❌ [Meta API exchange-code] Phone list error for WABA ${waba.id}:`, phoneData.error);
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
      console.error("❌ [Meta API exchange-code] No WhatsApp phone numbers found on account");
      return NextResponse.json(
        { success: false, message: "No WhatsApp phone numbers found on this account." },
        { status: 404, headers: corsHeaders() }
      );
    }

    console.log(`✅ [Meta API exchange-code] Found ${phones.length} phone(s):`, phones.map(p => ({ id: p.id, display: p.display })));

    // ── Step 4.5: Duplicate check — block before showing select-phone UI ─
    for (const phone of phones) {
      const existingOwner = await UserModel.findOne({
        "whatsapp.phoneNumberId": phone.id,
        "whatsapp.connected": true,
        _id: { $ne: userId },
      }).select("_id").lean();

      if (existingOwner) {
        console.warn(`🚫 [Meta API exchange-code] Duplicate number blocked: ${phone.id} (${phone.display}) already connected to another user (${existingOwner._id})`);
        return NextResponse.json(
          {
            success: false,
            message: `The number ${phone.display} is already connected to another Pax26 account. To use it here, the other account must disconnect it first at Dashboard → WhatsApp → Disconnect.`,
          },
          { status: 409, headers: corsHeaders() }
        );
      }
    }

    // ── Step 4.6: WhatsApp numbers limit check ─────────────────
    const currentUser = await UserModel.findById(userId).select("paxAI whatsapp").lean();
    const userPlan = currentUser?.paxAI?.plan || "free";

    const whatsappLimits = { free: 1, starter: 1, business: 3, enterprise: 10 };
    const whatsappNumbersLimit = whatsappLimits[userPlan] ?? 1;

    const alreadyConnected = currentUser?.whatsapp?.connected ? 1 : 0;
    const newNumbers = phones.filter(p => p.id !== currentUser?.whatsapp?.phoneNumberId).length;

    console.log(`📊 [Meta API exchange-code] Plan limit check: user plan="${userPlan}", limit=${whatsappNumbersLimit}, alreadyConnected=${alreadyConnected}, newNumbers=${newNumbers}`);

    if (alreadyConnected + newNumbers > whatsappNumbersLimit) {
      console.warn(`🚫 [Meta API exchange-code] Plan limit exceeded for user ${userId}`);
      return NextResponse.json(
        {
          success: false,
          message: `Your current plan (${userPlan}) allows up to ${whatsappNumbersLimit} WhatsApp number${whatsappNumbersLimit > 1 ? "s" : ""}. You already have ${alreadyConnected} connected. Upgrade to Business or Enterprise to connect more numbers.`,
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    // ── Step 5: Subscribe to WABA webhooks + register each phone ─
    const subscribedWabas = new Set();
    for (const phone of phones) {
      if (!subscribedWabas.has(phone.wabaId)) {
        console.log(`⚡ [Meta API exchange-code] Subscribing WABA ${phone.wabaId}...`);
        await subscribeToWaba(phone.wabaId, accessToken);
        console.log(`⚡ [Meta API exchange-code] Sharing credit line to WABA ${phone.wabaId}...`);
        await shareCreditLine(phone.wabaId, accessToken);
        subscribedWabas.add(phone.wabaId);
      }

      if (phone.verificationStatus !== "VERIFIED") {
        const { pin: prePin, stored: preStored } = generateAndEncryptPin();
        phone.registrationPin = preStored;

        console.log(`📲 [Meta API exchange-code] Registering phone ${phone.id} (${phone.display})...`);
        const regResult = await registerPhoneNumber(phone.id, accessToken, preStored);

        if (regResult.success) {
          console.log(`✅ [Meta API exchange-code] Phone ${phone.id} registered successfully`);
          phone.verificationStatus = "REGISTERED";
        } else if (regResult.isPinConflict) {
          console.error(`🚫 [Meta API exchange-code] PIN conflict for phone ${phone.id}`);
          return NextResponse.json(
            { success: false, message: regResult.userMessage },
            { status: 409, headers: corsHeaders() }
          );
        } else {
          console.warn(`⚠️ [Meta API exchange-code] Register did not succeed for ${phone.id}: ${JSON.stringify(regResult.error)} — proceeding`);
        }
      } else {
        console.log(`ℹ️ [Meta API exchange-code] Phone ${phone.id} already VERIFIED — skipping register`);
        phone.registrationPin = null;
      }
    }

    // ── Step 6: Save to TempSession (expires in 10 mins) ──────
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await TempSessionModel.create({
      sessionId,
      userId,
      accessToken,
      phones,
      expiresAt,
    });

    console.log(`💾 [Meta API exchange-code] TempSession created: ${sessionId} (expires at: ${expiresAt.toISOString()})`);

    // ── Step 7: Return sessionId + phones to frontend ─────────
    return NextResponse.json(
      { success: true, sessionId, phones },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("❌ [Meta API exchange-code] Unhandled exception:", error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500, headers: corsHeaders() }
    );
  }
}
