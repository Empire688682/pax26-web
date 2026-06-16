/**
 * DEV-ONLY — Send a WhatsApp message using manually supplied credentials.
 *
 * POST /api/dev/whatsapp-send
 * Body: { phoneNumberId, accessToken, to, message }
 *
 * - Does NOT touch the database at all.
 * - Does NOT go through handleIncomingWhatsapp or any automation logic.
 * - Sends directly to Meta Cloud API using the credentials you provide.
 *
 * ⚠️  REMOVE THIS FILE BEFORE GOING TO PRODUCTION.
 */

import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
    try {
        const { phoneNumberId, accessToken, to, message } = await req.json();

        // Basic validation
        const missing = [];
        if (!phoneNumberId) missing.push("phoneNumberId");
        if (!accessToken)   missing.push("accessToken");
        if (!to)            missing.push("to");
        if (!message)       missing.push("message");

        if (missing.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missing.join(", ")}` },
                { status: 400 }
            );
        }

        // Normalise recipient — ensure it starts with + and has no spaces
        const recipient = to.trim().replace(/\s/g, "");

        const url = `https://graph.facebook.com/v19.0/${phoneNumberId.trim()}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: recipient,
            type: "text",
            text: { body: message.trim() },
        };

        const headers = {
            Authorization: `Bearer ${accessToken.trim()}`,
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, payload, { headers });

        const messageId = response.data?.messages?.[0]?.id ?? null;

        return NextResponse.json({
            success: true,
            messageId,
            to: recipient,
            raw: response.data,
        });

    } catch (err) {
        const metaError = err.response?.data?.error;
        console.error("[dev/whatsapp-send] Error:", metaError || err.message);

        return NextResponse.json(
            {
                success: false,
                error: metaError
                    ? `Meta API error ${metaError.code}: ${metaError.message}`
                    : err.message,
                details: metaError ?? null,
            },
            { status: err.response?.status || 500 }
        );
    }
}
