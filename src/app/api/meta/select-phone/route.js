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

        // ── Confirm activation via Graph API ─────────────────────
        // Verify the number actually flipped to VERIFIED / CONNECTED
        // before marking it active in our DB.
        let confirmedStatus = phone.verificationStatus || "UNKNOWN";
        try {
            const statusRes = await fetch(
                `https://graph.facebook.com/v22.0/${phone.id}?fields=code_verification_status,status&access_token=${session.accessToken}`
            );
            const statusData = await statusRes.json();
            if (statusData.error) {
                console.error(`❌ Status confirmation failed for ${phone.id}:`, JSON.stringify(statusData.error));
            } else {
                confirmedStatus = statusData.code_verification_status || confirmedStatus;
                console.log(`✅ Phone ${phone.id} status confirmed: code_verification_status=${confirmedStatus}, status=${statusData.status}`);
            }
        } catch (err) {
            console.error(`❌ Status confirmation exception for ${phone.id}:`, err.message);
        }

        // 💾 Save to user — additive fields only, no existing field renamed or removed
        await UserModel.findByIdAndUpdate(
            session.userId,
            {
                $set: {
                    "whatsapp.connected": true,
                    "whatsapp.accessToken": session.accessToken,
                    "whatsapp.wabaId": phone.wabaId,
                    "whatsapp.phoneNumberId": phone.id,
                    "whatsapp.displayPhone": phone.display,
                    "whatsapp.connectedAt": new Date(),
                    "whatsapp.permissions": {
                        messaging: true,
                        management: true,
                    },
                    // NEW additive fields — safe to add
                    "whatsapp.codeVerificationStatus": confirmedStatus,
                    ...(phone.registrationPin && { "whatsapp.registrationPin": phone.registrationPin }),
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