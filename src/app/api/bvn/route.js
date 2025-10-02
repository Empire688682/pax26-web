import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { verifyToken } from "../helper/VerifyToken";
import axios from "axios";

export async function POST(req) {
    try {
        const { bvn } = await req.json();

        if (!bvn || typeof bvn !== "string" || !/^\d{11}$/.test(bvn)) {
            return NextResponse.json(
                { success: false, message: "Invalid BVN format" },
                { status: 400, headers: corsHeaders() }
            );
        }

        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Not authorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        await connectDb();

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        user.bvn = bvn;
        user.bvnVerify = true;

        if (user.virtualAccount && user.virtualAccount !== "") {
            await user.save();
            return NextResponse.json(
                { success: true, message: "Virtual account already exists", virtualAccount: user.virtualAccount },
                { status: 200, headers: corsHeaders() }
            );
        };

        const response = await axios.post(
            "https://api.flutterwave.com/v3/virtual-account-numbers",
            {
                email: user.email,
                bvn: user.bvn,
                is_permanent: true,
                tx_ref: `VA-${Date.now()}`,
                phonenumber: user.phone,
                firstname: user.firstName,
                lastname: user.lastName,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Flutterwave response:", response.data);

        if (response.data.status !== "success") {
            return NextResponse.json(
                { success: false, message: "Failed to generate virtual account" },
                { status: 500, headers: corsHeaders() }
            );
        }

        user.virtualAccount = response.data.data.account_number;
        await user.save();

        return NextResponse.json(
            { success: true, virtualAccount: user.virtualAccount },
            { status: 200, headers: corsHeaders() }
        );

    } catch (error) {
        console.error("BVN Route Error:", error.response?.data || error.message, error.stack);
        return NextResponse.json(
            { error: error.response?.data || "Internal Server Error" },
            { status: error.response?.status || 500, headers: corsHeaders() }
        );
    }
}

