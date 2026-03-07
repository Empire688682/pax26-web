import { NextResponse } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(req) {
  const path = req.nextUrl.pathname  
  const token = req.cookies.get("UserToken")?.value || "";
  const protectedPaths = [
    "/buy-data",
    "/dashboard",
    "/dashboard/services/buy-data",
    "/dashboard/services/buy-airtime",
    "/dashboard/services/buy-electricity",
    "/dashboard/services/betting",
    "/dashboard/services/gift-card/buy",
    "/dashboard/services/gift-card/sell",
    "/dashboard/services/gift-card",
    "/dashboard/services/crypto/buy",
    "/dashboard/services/crypto/sell",
    "/dashboard/services/transfer",
    "/dashboard/services/crypto",
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/verify-user",
    "/dashboard/ai-automations",
    "/dashboard/ai-automations/pax",
    "/dashboard/ai-automations/market-place",
    "/dashboard/ai-automations/home",
    "/dashboard/ai-automations/new",
    "/dashboard/ai-automations/profile",
    "/dashboard/ai-automations/whatsapp-rules",
    "/dashboard/ai-automations/whatsapp",
    "/dashboard/ai-automations/whatsapp-connect-info",
    "/verify-number",
  ];
  const isProtected = protectedPaths.some((protectedPath)=>
   path.startsWith(protectedPath));

  if(!token && isProtected){
    return NextResponse.redirect(new URL('/', req.url));
  }

  if(token && (path === "/" || path === "" || path === "/reset-password")){
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
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/reset-password",
    "/verify-user",
    "/terms",
    "/dashboard/ai-automations",
    "/dashboard/ai-automations/pax",
    "/dashboard/ai-automations/market-place",
    "/dashboard/ai-automations/home",
    "/dashboard/ai-automations/new",
    "/dashboard/ai-automations/profile",
    "/dashboard/ai-automations/whatsapp-rules",
    "/dashboard/ai-automations/whatsapp",
    "/dashboard/ai-automations/whatsapp-connect-info",
    "/privacy",
    "/verify-number",
  ],
}