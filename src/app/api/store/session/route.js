/**
 * /api/store/session
 *
 * POST — create a new storefront session token
 *   Body: { sellerId, storeSlug, customerPhone, businessPhone, referredProductId? }
 *   Auth: internal only — called by the AI response pipeline, not by the browser
 *   Returns: { success: true, token, expiresAt, storeUrl }
 *
 * GET  — validate an existing token from the storefront URL
 *   Query: ?token=<token>
 *   Public — no auth required (the storefront page calls this)
 *   Returns: { success: true, valid: bool, payload? }
 *
 * Security notes:
 * - POST is guarded by INTERNAL_API_SECRET so only server-side callers can create tokens
 * - GET reveals only whether the token is valid + the safe payload (no secrets)
 * - Expired or tampered tokens return valid:false — no 401, to avoid leaking info
 */

import { connectDb } from "@/app/ults/db/ConnectDb";
import StorefrontSessionModel from "@/app/ults/models/StorefrontSessionModel";
import { createSessionToken, verifySessionToken, sessionExpiresAt } from "@/app/lib/store/signSession";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pax26.com";

/* ── shared headers ───────────────────────────────────────── */
function headers() {
  return {
    ...corsHeaders(),
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: headers() });
}

/* ── POST — create session ───────────────────────────────── */
export async function POST(req) {
  try {
    // Guard: only server-side callers may create sessions
    const internalSecret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;
    const authHeader = req.headers.get("x-internal-secret");
    if (!authHeader || authHeader !== internalSecret) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403, headers: headers() }
      );
    }

    const body = await req.json();
    const { sellerId, storeSlug, customerPhone, businessPhone, referredProductId } = body;

    if (!sellerId || !storeSlug || !customerPhone || !businessPhone) {
      return NextResponse.json(
        { success: false, message: "sellerId, storeSlug, customerPhone, and businessPhone are required" },
        { status: 400, headers: headers() }
      );
    }

    // Create the signed token
    const payload = { sellerId, storeSlug, customerPhone, businessPhone, referredProductId: referredProductId || null };
    const token = createSessionToken(payload);
    const expiresAt = sessionExpiresAt();

    // Persist to DB (for audit trail + future one-time-use enforcement)
    await connectDb();
    await StorefrontSessionModel.create({
      token,
      sellerId,
      storeSlug,
      customerPhone,
      businessPhone,
      referredProductId: referredProductId || null,
      expiresAt,
    });

    const storeUrl = `${BASE_URL}/store/${storeSlug}?session=${encodeURIComponent(token)}`;

    return NextResponse.json(
      { success: true, token, expiresAt, storeUrl },
      { status: 201, headers: headers() }
    );
  } catch (error) {
    console.error("POST /api/store/session error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: headers() }
    );
  }
}

/* ── GET — validate session ──────────────────────────────── */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: true, valid: false, reason: "No token provided" },
        { status: 200, headers: headers() }
      );
    }

    // Step 1: verify signature + expiry in-memory (fast, no DB hit)
    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: true, valid: false, reason: "Invalid or expired token" },
        { status: 200, headers: headers() }
      );
    }

    // Step 2: check DB record exists and hasn't been marked used
    await connectDb();
    const record = await StorefrontSessionModel.findOne({ token }).lean();

    if (!record) {
      // Token passed crypto check but isn't in DB — could be from before we started persisting
      // Treat as valid if crypto check passed (don't break old links)
      return NextResponse.json(
        {
          success: true,
          valid: true,
          payload: {
            storeSlug: payload.storeSlug,
            businessPhone: payload.businessPhone,
            referredProductId: payload.referredProductId || null,
          },
        },
        { status: 200, headers: headers() }
      );
    }

    if (record.used) {
      return NextResponse.json(
        { success: true, valid: false, reason: "Session already used" },
        { status: 200, headers: headers() }
      );
    }

    // Return safe subset of payload — never return customerPhone to the browser
    return NextResponse.json(
      {
        success: true,
        valid: true,
        payload: {
          storeSlug: payload.storeSlug,
          businessPhone: payload.businessPhone,
          referredProductId: payload.referredProductId || null,
        },
      },
      { status: 200, headers: headers() }
    );
  } catch (error) {
    console.error("GET /api/store/session error:", error);
    return NextResponse.json(
      { success: true, valid: false, reason: "Server error" },
      { status: 200, headers: headers() } // 200 intentional — storefront gracefully degrades
    );
  }
}
