// app/api/webhooks/whatsapp/route.js

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { handleIncomingWhatsApp } from "@/app/lib/aiService/handleIncomingWhatsapp";

// ✅ META WEBHOOK VERIFICATION
export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("✅ Webhook verified by Meta");
        return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
}

export async function POST(req) {
    try {
        await connectDb();
        const entry = await req.json();

        const value = entry?.entry?.[0]?.changes?.[0]?.value;
        if (!value?.messages) {
            return NextResponse.json({ status: "ignored" });
        }

        const message = value.messages?.[0];
        if (!message || !message.text?.body) {
            return NextResponse.json({ status: "unsupported_message" });
        }

        if (message.type !== "text") {
            console.log("Unsupported type:", message.type);
            return NextResponse.json({ status: "ignored_type" });
        }

        // ✅ Prevent duplicates
        const exists = await AIMessageModel.findOne({ messageId: message.id });
        if (exists) {
            return NextResponse.json({ status: "duplicate" });
        }

        // ✅ Process inbound (this should return session + user)
        const result = await handleIncomingWhatsApp(entry);

        if (!result?.session || !result?.user) {
            return NextResponse.json({ status: "no_session" });
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}