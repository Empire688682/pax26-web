import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
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


        await UserModel.findByIdAndUpdate(
            userId,
            {
                whatsapp: {
                    connected: false,
                    accessToken:"",
                    wabaId: "",
                    phoneNumberId: "",
                    displayPhone: "",
                    connectedAt: new Date(),
                    permissions: {
                        messaging: false,
                        management: false,
                    },
                },

                whatsappConnected: false, // optional backward compatibility
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
