/**
 * POST /api/proxy/broadcast/send
 *
 * Handles broadcast send entirely server-side in Next.js.
 * This replaces the pass-through to the admin backend because the admin
 * backend's /broadcast/send was a stub that never called Meta's API.
 *
 * Flow:
 *  1. Authenticate user via UserToken cookie
 *  2. Check plan limits
 *  3. Actually send each message via Meta WhatsApp Cloud API
 *  4. Save broadcast record with real per-contact delivery log
 *  5. Increment monthly usage counter
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import axios from "axios";

// ── Helper: send one WhatsApp text message via Meta Cloud API ──
async function sendOne({ phoneNumberId, accessToken, to, text }) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );
    return {
      success: true,
      messageId: res.data?.messages?.[0]?.id || null,
    };
  } catch (err) {
    const metaErr = err.response?.data?.error;
    return {
      success: false,
      error: metaErr
        ? `Meta error ${metaErr.code}: ${metaErr.message}`
        : err.message,
    };
  }
}

export async function POST(req) {
  // ── Broadcast temporarily disabled ───────────────────────────────────────
  // Feature is hidden from the UI while limits and billing are being finalised.
  // The code is preserved and will be re-enabled in a future release.
  return NextResponse.json(
    { success: false, message: "Broadcast is coming soon. Stay tuned!" },
    { status: 503 }
  );
}
