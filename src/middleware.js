import { NextResponse } from "next/server";

/** Routes that require UserToken cookie */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/fund-wallet",
  "/api-docs",
  "/profile",
  "/notifications",
  "/payment-success",
  "/survey",
  "/verify-user",
  "/verify-number",
  "/transaction-receipt",
  "/transactions",
];

/** Logged-in users are redirected away from these */
const GUEST_ONLY_PATHS = ["/", "/reset-password"];

function matchesPrefix(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("UserToken")?.value || "";

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    matchesPrefix(path, prefix)
  );

  const isGuestOnly = GUEST_ONLY_PATHS.includes(path);

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && isGuestOnly) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/reset-password",
    "/dashboard",
    "/dashboard/:path*",
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/verify-user",
    "/verify-number",
    "/transaction-receipt",
    "/transactions",
    "/transactions/:path*",
  ],
};
