import { NextResponse } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(req) {
  const path = req.nextUrl.pathname  
  const token = req.cookies.get("UserToken")?.value || "";
  const protectedPaths = [
    "/blog",
    "/buy-data",
    "/dashboard",
    "/dashboard/buy-data",
    "/dashboard/buy-airtime",
    "/dashboard/buy-electricity",
    "/dashboard/betting",
    "/dashboard/gift-card/buy",
    "/dashboard/gift-card/sell",
    "/dashboard/gift-card",
    "/dashboard/crypto/buy",
    "/dashboard/crypto/sell",
    "/dashboard/transfer",
    "/dashboard/crypto",
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/verify-user",
    "/ai-automations",
    "/ai-automations/settings",
    "/ai-automations/dashboard",
    "/ai-automations/home",
    "/ai-automations/new",
    "/ai-automations/profile",
    "/ai-automations/whatsapp-rules",
    "/ai-automations/whatsapp",
    "/ai-automations/whatsapp-connect-info",
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
    "/dashboard/buy-data",
    "/dashboard/buy-airtime",
    "/dashboard/buy-electricity",
    "/dashboard/betting",
    "/dashboard/gift-card/buy",
    "/dashboard/gift-card/sell",
    "/dashboard/gift-card",
    "/dashboard/crypto/buy",
    "/dashboard/crypto/sell",
    "/dashboard/crypto",
    "/dashboard/transfer",
    "/fund-wallet",
    "/api-docs",
    "/profile",
    "/notifications",
    "/payment-success",
    "/survey",
    "/reset-password",
    "/verify-user",
    "/terms",
    "/ai-automations",
    "/ai-automations/settings",
    "/ai-automations/dashboard",
    "/ai-automations/home",
    "/ai-automations/new",
    "/ai-automations/profile",
    "/ai-automations/whatsapp-rules",
    "/ai-automations/whatsapp",
    "/ai-automations/whatsapp-connect-info",
    "/privacy",
    "/verify-number",
  ],
}