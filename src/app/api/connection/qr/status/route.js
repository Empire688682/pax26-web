import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "../../../helper/VerifyToken";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    try {
        await connectDb();

        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        // 1. If connected via Meta, return connected status
        if (user.whatsapp?.connected && user.whatsapp?.connectionType === "meta") {
            return NextResponse.json(
                { success: true, status: "CONNECTED", type: "meta" },
                { status: 200, headers: corsHeaders() }
            );
        }

        // 2. Query the QR service status
        const qrUrl = process.env.QR_SERVICE_URL || "http://localhost:3001";
        const qrSecret = process.env.QR_SERVICE_SECRET || "pax26_qr_service_secret_688682";

        try {
            const statusRes = await axios.get(`${qrUrl}/api/session/status?userId=${userId}`, {
                headers: { "Authorization": `Bearer ${qrSecret}` }
            });

            let { status, qr } = statusRes.data;

            // 3. If disconnected, start a new session automatically
            if (status === "DISCONNECTED") {
                const startRes = await axios.post(`${qrUrl}/api/session/start`, { userId }, {
                    headers: { "Authorization": `Bearer ${qrSecret}` }
                });
                status = startRes.data.status;
                qr = startRes.data.qr;
            }

            return NextResponse.json(
                { success: true, status, qr, type: "qr" },
                { status: 200, headers: corsHeaders() }
            );
        } catch (qrErr) {
            console.error("Error communicating with QR Service:", qrErr.message);
            
            // Fallback: read from database in case QR service is unreachable
            return NextResponse.json(
                {
                    success: true,
                    status: user.whatsapp?.connected ? "CONNECTED" : "DISCONNECTED",
                    qr: user.whatsapp?.qr?.qrCode,
                    type: "qr",
                    error: "QR service connection issue"
                },
                { status: 200, headers: corsHeaders() }
            );
        }
    } catch (error) {
        console.error("Error in GET /api/connection/qr/status:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred", error: error.message },
            { status: 500, headers: corsHeaders() }
        );
    }
}
