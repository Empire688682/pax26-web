import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

/**
 * POST /api/meta/select-phone
 * Body: { sessionId, phoneId }
 */
export async function POST(req) {
    try {
        await connectDb();

        const { sessionId, phoneId } = await req.json();

        if (!sessionId || !phoneId) {
            return NextResponse.json(
                { success: false, message: "Missing sessionId or phoneId" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 🔍 Look up session — must exist (expiry is handled by MongoDB TTL index)
        const session = await TempSessionModel.findOne({ sessionId });


        if (!session) {
            return NextResponse.json(
                { success: false, message: "Session expired. Please reconnect WhatsApp." },
                { status: 401, headers: corsHeaders() }
            );
        }

        // 📱 Find the selected phone
        const phone = session.phones.find((p) => p.id === phoneId);

        if (!phone) {
            return NextResponse.json(
                { success: false, message: "Invalid phone selection." },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 💾 Save to user using $set and dot notation to prevent overwriting other fields (like contacts and custom paxAI prompt/plan)
        await UserModel.findByIdAndUpdate(
            session.userId,
            {
                $set: {
                    "whatsapp.connected": true,
                    "whatsapp.accessToken": session.accessToken, // ✅ retrieved from server, never from browser
                    "whatsapp.wabaId": phone.wabaId,
                    "whatsapp.phoneNumberId": phone.id,
                    "whatsapp.displayPhone": phone.display,
                    "whatsapp.connectedAt": new Date(),
                    "whatsapp.permissions": {
                        messaging: true,
                        management: true,
                    },
                    "paxAI.enabled": true,
                }
            },
            { new: true }
        );

        // 🗑️ Delete session after use (one-time use)
        await TempSessionModel.deleteOne({ sessionId });

        return NextResponse.json(
            { success: true, message: "WhatsApp connected successfully." },
            { status: 200, headers: corsHeaders() }
        );

    } catch (error) {
        console.error("select-phone error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error. Please try again." },
            { status: 500, headers: corsHeaders() }
        );
    }
}