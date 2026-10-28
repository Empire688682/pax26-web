import { NextResponse } from "next/server";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  // Broadcast temporarily disabled — coming soon
  return NextResponse.json(
    { success: false, message: "Broadcast is coming soon. Stay tuned!" },
    { status: 503, headers: corsHeaders() }
  );
}
