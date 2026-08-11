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
        console.log("📥 [Meta API session-phones] GET request for sessionId:", sessionId);

        if (!sessionId) {
            console.error("❌ [Meta API session-phones] Missing session ID parameter");
            return NextResponse.json(
                { success: false, message: "Missing session ID" },
                { status: 400, headers: corsHeaders() }
            );
        }

        const session = await TempSessionModel.findOne({
            sessionId,
        });

        if (!session) {
            console.error(`❌ [Meta API session-phones] Session ${sessionId} not found or expired`);
            return NextResponse.json(
                { success: false, message: "Session expired. Please reconnect WhatsApp." },
                { status: 401, headers: corsHeaders() }
            );
        }

        console.log(`✅ [Meta API session-phones] Session found! Returning ${session.phones?.length || 0} phone(s)`);

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