import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
    try {
        await connectDb();

        // Get user ID from token
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Verify user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        // Stop active QR session if connection is QR
        if (user.whatsapp?.connectionType === "qr") {
            try {
                const qrUrl = process.env.QR_SERVICE_URL || "http://localhost:3001";
                const qrSecret = process.env.QR_SERVICE_SECRET || "pax26_qr_service_secret_688682";

                await axios.post(`${qrUrl}/api/session/stop`, { userId: user._id.toString() }, {
                    headers: { "Authorization": `Bearer ${qrSecret}` }
                });
            } catch (err) {
                console.error("Failed to stop QR session on disconnect:", err.message);
            }
        }

        await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "whatsapp.connected": false,
                    "whatsapp.connectionType": "meta",
                    "whatsapp.accessToken": "",
                    "whatsapp.wabaId": "",
                    "whatsapp.phoneNumberId": "",
                    "whatsapp.displayPhone": "",
                    "whatsapp.connectedAt": new Date(),
                    "whatsapp.permissions": {
                        messaging: false,
                        management: false,
                    },
                    "whatsapp.qr.sessionId": null,
                    "whatsapp.qr.qrCode": null,
                    "whatsapp.qr.qrExpiresAt": null,
                }
            },
            { new: true }
        );

        return NextResponse.json(
            { success: true, message:"Whatsapp number removed" },
            { status: 200, headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Error in POST /ai-train:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred", error: error.message },
            { status: 500, headers: corsHeaders() }
        );
    }
}
