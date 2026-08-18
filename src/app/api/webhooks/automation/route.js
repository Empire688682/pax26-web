// app/api/webhooks/whatsapp/route.js

import { NextResponse, after } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { handleIncomingWhatsApp } from "@/app/lib/aiService/handleIncomingWhatsapp";

export const maxDuration = 60; // Allow up to 60s for background execution on Vercel Pro/serverless

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

        // ── Message delivery / read status updates from Meta ───────────
        // Meta sends these when our outbound message reaches the customer's
        // device ("delivered") or is opened ("read") or fails ("failed").
        // We only update the status field — the AI / inbound flow is untouched.
        if (value?.statuses?.length) {
            const statusEvent = value.statuses[0];
            const { id: wamid, status } = statusEvent;

            // Only track statuses we care about for the inbox UI
            const trackable = ["sent", "delivered", "read", "failed"];
            if (wamid && trackable.includes(status)) {
                await AIMessageModel.updateOne(
                    { messageId: wamid },
                    { $set: { status } }
                );
                console.log(`📬 Message ${wamid} → ${status}`);
            }

            return NextResponse.json({ ok: true, event: "status_update" });
        }

        // ── Inbound customer message ────────────────────────────────────
        if (!value?.messages) {
            return NextResponse.json({ status: "ignored" });
        }

        const message = value.messages?.[0];

        // console.log("Incoming whatsapp message: ", message);

        if (!message) {
            return NextResponse.json({ status: "unsupported_message" });
        }

        if (message.type !== "text" && message.type !== "image") {
            console.log("Unsupported type:", message.type);
            return NextResponse.json({ status: "ignored_type" });
        }

        // ✅ Ack Meta immediately — process AI in background to avoid 5s timeout / retries
        console.log("handleIncomingWhatsApp (triggering background execution)");
        after(async () => {
            try {
                await handleIncomingWhatsApp(entry);
            } catch (err) {
                console.error("❌ Background handleIncomingWhatsApp error:", err);
            }
        });

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}