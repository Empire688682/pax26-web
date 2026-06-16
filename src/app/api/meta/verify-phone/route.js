/**
 * POST /api/meta/verify-phone
 *
 * Two-action endpoint for phone number OTP verification via Meta Cloud API.
 *
 * Action "request":
 *   Body: { sessionId, phoneId, method }   method = "SMS" | "VOICE"
 *   → Calls Meta's /{phoneId}/request_code to send an OTP to the phone number.
 *
 * Action "verify":
 *   Body: { sessionId, phoneId, code }
 *   → Calls Meta's /{phoneId}/verify_code to confirm the OTP.
 *   → On success returns { success: true } so the frontend can proceed to select-phone.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
    try {
        await connectDb();

        const body = await req.json();
        const { action, sessionId, phoneId } = body;

        if (!action || !sessionId || !phoneId) {
            return NextResponse.json(
                { success: false, message: "Missing action, sessionId, or phoneId" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Load session to get the access token (never trust the client with it)
        const session = await TempSessionModel.findOne({ sessionId });
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Session expired. Please reconnect WhatsApp." },
                { status: 401, headers: corsHeaders() }
            );
        }

        const accessToken = session.accessToken;

        // ── ACTION: request OTP ───────────────────────────────────
        if (action === "request") {
            const method = body.method || "SMS"; // "SMS" | "VOICE"

            const res = await fetch(
                `https://graph.facebook.com/v22.0/${phoneId}/request_code`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code_method: method, language: "en_US" }),
                }
            );

            const data = await res.json();
            console.log("📲 request_code response:", data);

            if (data.error) {
                // Code 63016 = already verified — treat as success so user can proceed
                if (data.error.code === 63016) {
                    return NextResponse.json(
                        { success: true, alreadyVerified: true, message: "Number is already verified." },
                        { status: 200, headers: corsHeaders() }
                    );
                }

                return NextResponse.json(
                    { success: false, message: data.error.message || "Failed to send OTP." },
                    { status: 400, headers: corsHeaders() }
                );
            }

            return NextResponse.json(
                { success: true, message: "OTP sent. Check your phone." },
                { status: 200, headers: corsHeaders() }
            );
        }

        // ── ACTION: verify OTP ────────────────────────────────────
        if (action === "verify") {
            const { code } = body;

            if (!code || code.trim().length < 4) {
                return NextResponse.json(
                    { success: false, message: "Please enter a valid verification code." },
                    { status: 400, headers: corsHeaders() }
                );
            }

            const res = await fetch(
                `https://graph.facebook.com/v22.0/${phoneId}/verify_code`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code: code.trim() }),
                }
            );

            const data = await res.json();
            console.log("✅ verify_code response:", data);

            if (data.error) {
                // Code 63012 = wrong code
                const msg = data.error.code === 63012
                    ? "Incorrect code. Please try again."
                    : data.error.message || "Verification failed.";

                return NextResponse.json(
                    { success: false, message: msg },
                    { status: 400, headers: corsHeaders() }
                );
            }

            return NextResponse.json(
                { success: true, message: "Phone number verified successfully." },
                { status: 200, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            { success: false, message: `Unknown action: ${action}` },
            { status: 400, headers: corsHeaders() }
        );

    } catch (error) {
        console.error("verify-phone error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error. Please try again." },
            { status: 500, headers: corsHeaders() }
        );
    }
}
