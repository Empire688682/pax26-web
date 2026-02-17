import jwt from "jsonwebtoken";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
  try {
    const userId = await verifyToken(req);
  if (!userId) {
    return NextResponse.json({ success: false }, { status: 401, headers:corsHeaders() });
  }

  const state = jwt.sign(
    {
      userId,
      purpose: "meta_whatsapp_connect",
    },
    process.env.OAUTH_STATE_SECRET,
    { expiresIn: "10m" }
  );

  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${
    process.env.META_APP_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.META_REDIRECT_URI
  )}&scope=whatsapp_business_management,whatsapp_business_messaging,business_management&state=${state}`;

  return NextResponse.json({ success: true, url, }, { status: 200, headers:corsHeaders() });
  } catch (error) {
    console.log("oauthErr: ", error);

  }
}
