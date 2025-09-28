import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import axios from "axios";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { verifyToken } from "../helper/VerifyToken";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() })
}

export async function POST(req) {
    try {
        await connectDb();
        const bvnNin = await req.json();
        console.log("Received BVN/NIN:", bvnNin);
        // Verify user token and get user ID
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders() });
        }
        if (user.virtualAccount && user.virtualAccount !== "") {
            return NextResponse.json({ success: true, message: "Virtual account already exists", virtualAccount: user.virtualAccount }, { status: 200, headers: corsHeaders() });
        }
        // Call external API to generate virtual account
        const response = await axios.post(
            "https://api.flutterwave.com/v3/virtual-account-numbers",
            {
                email: user.email,
                bvn: user.bvn, // make sure your user model has BVN
                is_permanent: true,
                tx_ref: `VA-${Date.now()}`,
                phonenumber: user.phone,
                firstname: user.firstName,
                lastname: user.lastName,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY2}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Flutterwave response:", response.data);
        if (response.data.status === 'success') {
            const virtualAccount = response.data.data.account_number;
            user.virtualAccount = virtualAccount;
            await user.save();
            return NextResponse.json({ success: true, message: "Virtual account generated successfully", virtualAccount }, { status: 200, headers: corsHeaders() });
        } else {
            return NextResponse.json({ success: false, message: "Failed to generate virtual account" }, { status: 500, headers: corsHeaders() });
        }
    } catch (error) {
        console.error("Error generating virtual account:", error);
        console.error("Error generating virtual account:", error?.response?.data || error.message);

        return NextResponse.json(
            {
                success: false,
                message: error?.response?.data?.message || "Internal server error",
                details: error?.response?.data, // <-- include full Flutterwave error
            },
            { status: error?.response?.status || 500, headers: corsHeaders() }
        );
    }
}

