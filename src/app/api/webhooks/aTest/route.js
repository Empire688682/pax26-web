// src/app/api/webhooks/aTest/route.js

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { handleIncomingWhatsApp } from "@/app/lib/aiService/handleIncomingWhatsapp";

export async function POST(req) {
  try {
    await connectDb();
    const payload = await req.json().catch(() => ({}));
    const result = await handleIncomingWhatsApp(payload);
    return NextResponse.json(result);
  } catch (error) {
    console.log("Webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: true, message: "Webhook is live" }, { status: 200 });
}