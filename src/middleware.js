import { NextResponse } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(req) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get("UserToken")?.value || "";
  const protectedPaths = [
    "/dashboard",
    "/dashboard/services/buy-data",
    "/dashboard/services/buy-airtime",
    "/dashboard/services/buy-electricity",
    "/dashboard/services/buy-tv",
    "/dashboard/services/betting",
    "/dashboard/services/gift-card/buy",
    "/dashboard/services/gift-card/sell",
    "/dashboard/services/gift-card",
    "/dashboard/services/crypto/buy",
    "/dashboard/services/crypto/sell",
    "/dashboard/services/transfer",
    "/dashboard/services/crypto",
    "/dashboard/automations",
    "/dashboard/billing",
    "/dashboard/automations/pax",
    "/dashboard/automations/market-place",
    "/dashboard/automations/home",
    "/dashboard/automations/new",
    "/dashboard/automations/profile",
    "/dashboard/automations/whatsapp-rules",
    "/dashboard/automations/whatsapp",
    "/dashboard/automations/whatsapp-connect-info",
    "/dashboard/automations/whatsapp-contacts",
    "/dashboard/automations/whatsapp-inbox",
    "/dashboard/automations/ai-business-dashboard",
    "/transaction-receipt",
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/verify-user",
    "/verify-number",
  ];
  const isProtected = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath));

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (token && (path === "/" || path === "" || path === "/reset-password")) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();

}

export const config = {
  matcher: [
    "/",
    "/blog",
    "/buy-data",
    "/contact",
    "/dashboard",
    "/dashboard/services/buy-data",
    "/dashboard/services/buy-tv",
    "/dashboard/services/buy-airtime",
    "/dashboard/services/buy-electricity",
    "/dashboard/services/betting",
    "/dashboard/services/gift-card/buy",
    "/dashboard/services/gift-card/sell",
    "/dashboard/services/gift-card",
    "/dashboard/services/crypto/buy",
    "/dashboard/services/crypto/sell",
    "/dashboard/services/crypto",
    "/dashboard/services/transfer",
    "/dashboard/automations",
    "/dashboard/dashboard/billing",
    "/dashboard/automations/pax",
    "/dashboard/automations/market-place",
    "/dashboard/automations/home",
    "/dashboard/automations/new",
    "/dashboard/automations/profile",
    "/dashboard/automations/whatsapp-rules",
    "/dashboard/automations/whatsapp",
    "/dashboard/automations/whatsapp-contacts",
    "/dashboard/automations/whatsapp-inbox",
    "/dashboard/automations/whatsapp-connect-info",
    "/dashboard/automations/ai-business-dashboard",
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/reset-password",
    "/verify-user",
    "/terms",
    "/privacy",
    "/verify-number",
  ],
}