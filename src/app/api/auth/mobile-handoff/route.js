/**
 * GET /api/auth/mobile-handoff?token=...&redirect=/dashboard/automations/products
 *
 * Mobile deep-link bridge. The mobile app builds this URL with the user's
 * Bearer token and a destination path, then opens it in the system browser.
 *
 * This route:
 *  1. Verifies the JWT token from the query param
 *  2. Sets the UserToken httpOnly cookie (same as web login)
 *  3. Redirects the browser to the destination path
 *
 * Result: user lands on the exact page they wanted, already logged in.
 * No login screen, no copy-pasting. Seamless mobile → web handoff.
 *
 * Security:
 *  - Token is verified before the cookie is set — forged tokens are rejected
 *  - Token is only valid for 24 hours (same as login)
 *  - redirect param is validated against an allowlist to prevent open redirect
 *  - HTTPS only in production
 */
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// ── Allowlist of destination paths (prevent open redirect attacks) ──
const ALLOWED_PATHS = [
  '/dashboard',
  '/dashboard/automations',
  '/dashboard/automations/products',
  '/dashboard/automations/ai-business-dashboard',
  '/dashboard/automations/training',
  '/dashboard/automations/whatsapp',
  '/dashboard/automations/whatsapp-inbox',
  '/dashboard/billing',
  '/dashboard/referral',
  '/dashboard/my-store',
  '/dashboard/prevent-ban',
];

function isSafePath(path) {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/')) return false;
  // Check exact match or path starts with an allowed prefix
  return ALLOWED_PATHS.some(allowed =>
    path === allowed || path.startsWith(allowed + '/')
  );
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token    = searchParams.get('token');
    const redirect = searchParams.get('redirect') ?? '/dashboard';

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Verify JWT
    try {
      jwt.verify(token, process.env.SECRET_KEY);
    } catch {
      // Token invalid or expired — send to login
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Validate redirect destination (prevent open redirect)
    const safePath = isSafePath(redirect) ? redirect : '/dashboard';
    const destination = new URL(safePath, req.url);

    // Set cookie and redirect
    const response = NextResponse.redirect(destination);
    response.cookies.set("UserToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("mobile-handoff error:", error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
