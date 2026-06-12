/**
 * GET /api/proxy/broadcast/campaigns
 *
 * Server-side proxy to the admin backend's /api/broadcast/campaigns endpoint.
 * This route runs on the server where the httpOnly UserToken cookie IS accessible,
 * solving the client-side getCookie("UserToken") = "" problem.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  try {
    if (!ADMIN_URL) {
      return NextResponse.json(
        { success: false, message: "Admin backend URL not configured." },
        { status: 500 }
      );
    }

    // Read the httpOnly cookie server-side — this works here unlike the browser
    const cookieStore = await cookies();
    const token = cookieStore.get("UserToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    // Forward the request to the admin backend with the token
    const res = await fetch(`${ADMIN_URL}/broadcast/campaigns`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("Proxy /broadcast/campaigns error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch campaigns." },
      { status: 500 }
    );
  }
}
