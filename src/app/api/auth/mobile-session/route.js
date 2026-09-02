/**
 * POST /api/auth/mobile-session
 *
 * Called by the React Native WebView before loading a protected page.
 * Accepts the mobile Bearer token, verifies it, and sets the UserToken
 * httpOnly cookie so all subsequent page loads in the WebView are authenticated.
 *
 * Usage (from mobile WebView):
 *   POST /api/auth/mobile-session
 *   Body: { token: "<bearer token>" }
 *
 * On success: returns { success: true } — the WebView then navigates to the
 * protected page and the cookie is sent automatically.
 */
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Verify it's a valid JWT — if it's expired or forged, reject it
    try {
      jwt.verify(token, process.env.SECRET_KEY);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Set the same cookie the web login sets — WebView will carry it on
    // all subsequent requests to this origin automatically
    const response = NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    );

    response.cookies.set("UserToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("mobile-session error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
