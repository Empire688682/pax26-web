import { connectDb } from "@/app/ults/db/ConnectDb";
import { handleIncomingWhatsApp } from "@/app/lib/aiService/handleIncomingWhatsapp";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDb();

        // 1. Verify authorization header
        const authHeader = req.headers.get("authorization");
        const token = authHeader && authHeader.split(" ")[1];
        const secret = process.env.QR_SERVICE_SECRET || "pax26_qr_service_secret_688682";

        if (!token || token !== secret) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();

        // 2. Delegate processing to the main incoming WhatsApp handler
        const result = await handleIncomingWhatsApp(payload);

        return NextResponse.json({ ok: true, result });
    } catch (error) {
        console.error("Error in POST /api/webhooks/qr:", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}
