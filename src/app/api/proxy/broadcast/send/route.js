/**
 * POST /api/proxy/broadcast/send
 * Server-side proxy to admin backend /api/broadcast/send
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("UserToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(`${ADMIN_URL}/broadcast/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("Proxy /broadcast/send error:", error);
    return NextResponse.json({ success: false, message: "Failed to send broadcast." }, { status: 500 });
  }
}
