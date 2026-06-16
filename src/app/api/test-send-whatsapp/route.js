/**
 * TEST ENDPOINT — Send a WhatsApp message on behalf of a connected user.
 *
 * POST /api/test-send-whatsapp
 * Body: {
 *   "phoneNumberId": "the user's whatsapp.phoneNumberId from DB",
 *   "to": "+2348012345678",   // recipient phone in international format
 *   "message": "Hello, this is a test!"
 * }
 *
 * ⚠️  REMOVE THIS FILE BEFORE GOING TO PRODUCTION.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

export async function POST(req) {
    try {
        await connectDb();

        const { phoneNumberId, to, message } = await req.json();

        if (!phoneNumberId || !to || !message) {
            return NextResponse.json(
                { success: false, error: "phoneNumberId, to, and message are required" },
                { status: 400 }
            );
        }

        // Look up the user to confirm they exist and are connected
        const user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId })
            .select("name email whatsapp.connected whatsapp.phoneNumberId whatsapp.accessToken whatsapp.displayPhone");

        if (!user) {
            return NextResponse.json(
                { success: false, error: `No user found with phoneNumberId: ${phoneNumberId}` },
                { status: 404 }
            );
        }

        if (!user.whatsapp?.connected) {
            return NextResponse.json(
                { success: false, error: `User ${user.email} has WhatsApp disconnected` },
                { status: 400 }
            );
        }

        // Send the message using the user's own access token (looked up inside the helper)
        const result = await sendWhatsAppAutomationReply({
            phoneNumberId,
            to,
            text: message,
        });

        return NextResponse.json({
            success: result.success,
            sentAs: {
                user: user.email,
                displayPhone: user.whatsapp.displayPhone,
                phoneNumberId,
            },
            to,
            messageId: result.messageId,
            error: result.error ?? null,
        });

    } catch (err) {
        console.error("Test send error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
