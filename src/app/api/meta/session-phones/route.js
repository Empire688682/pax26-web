// ============================================================
// GET /api/meta/session-phones?session=XXXX
// Called by SelectPhone frontend to load phone list
// ============================================================
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    try {
        await connectDb();

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session");

        if (!sessionId) {
            return NextResponse.json(
                { success: false, message: "Missing session ID" },
                { status: 400, headers: corsHeaders() }
            );
        }

        const session = await TempSessionModel.findOne({
            sessionId,
            expiresAt: { $gt: new Date() },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Session expired. Please reconnect WhatsApp." },
                { status: 401, headers: corsHeaders() }
            );
        }

        // ✅ Only return phone list — never return accessToken
        return NextResponse.json(
            { success: true, phones: session.phones },
            { status: 200, headers: corsHeaders() }
        );

    } catch (error) {
        console.error("session-phones error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error." },
            { status: 500, headers: corsHeaders() }
        );
    }
}