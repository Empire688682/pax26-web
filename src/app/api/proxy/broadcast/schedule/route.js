import { NextResponse } from "next/server";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const userId = await verifyToken(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const body = await req.json();

    if (!ADMIN_URL) {
      return NextResponse.json(
        { success: false, message: "Admin backend URL not configured." },
        { status: 500, headers: corsHeaders() }
      );
    }

    const res = await fetch(`${ADMIN_URL}/broadcast/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: corsHeaders() });

  } catch (error) {
    console.error("Proxy /broadcast/schedule error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to schedule broadcast." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
