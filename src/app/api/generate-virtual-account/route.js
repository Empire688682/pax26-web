import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import axios from "axios";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { verifyToken } from "../helper/VerifyToken";

export async function OPTIONS() {
    return new NextResponse(null, {status:2000, headers:corsHeaders()})
}

export async function POST(req) {
    try {
        await connectDb();
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers:corsHeaders() });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404, headers:corsHeaders() });
        }
        if (user.virtualAccount && user.virtualAccount !== "") {
            return NextResponse.json({ success: true, message: "Virtual account already exists", virtualAccount: user.virtualAccount }, { status: 200, headers:corsHeaders()});
        }
        // Call external API to generate virtual account
        const response = await axios.post('https://api.flutterwave.com/v3/virtual-account-numbers', {
            "email": user.email,
            "is_permanent": true,
            "tx_ref": `VA-${Date.now()}`,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.status === 'success') {
            const virtualAccount = response.data.data.account_number;
            user.virtualAccount = virtualAccount;
            await user.save();
            return NextResponse.json({ success: true, message: "Virtual account generated successfully", virtualAccount }, { status: 200, headers:corsHeaders() });
        } else {
            return NextResponse.json({ success: false, message: "Failed to generate virtual account" }, { status: 500, headers:corsHeaders() });
        }
    } catch (error) {
        console.error("Error generating virtual account:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500, headers:corsHeaders() });
    }
}

