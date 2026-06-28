import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import SessionModel from "@/app/ults/models/SessionModel";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";


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

        // ── Run all cleanup in parallel ───────────────────────────
        await Promise.all([

            // 1. Reset WhatsApp connection fields + clear contact list
            //    Plan features (paxAI.*) and training data are intentionally preserved
            UserModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        "whatsapp.connected": false,
                        "whatsapp.accessToken": "",
                        "whatsapp.wabaId": "",
                        "whatsapp.phoneNumberId": "",
                        "whatsapp.displayPhone": "",
                        "whatsapp.connectedAt": new Date(),
                        "whatsapp.permissions": {
                            messaging: false,
                            management: false,
                        },
                        // Clear the contact list — tied to the old number
                        "whatsapp.contacts.list": [],
                    }
                },
                { new: true }
            ),

            // 2. Delete all customer conversation sessions for this user
            SessionModel.deleteMany({ userId }),

            // 3. Delete all AI message history for this user
            AIMessageModel.deleteMany({ userId }),

        ]);

        console.log(`✅ Disconnect cleanup complete for user ${userId}: sessions + messages + contacts cleared`);

        return NextResponse.json(
            { success: true, message: "WhatsApp number disconnected and customer data cleared." },
            { status: 200, headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Error in POST /disconnect-whatsapp:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred", error: error.message },
            { status: 500, headers: corsHeaders() }
        );
    }
}
