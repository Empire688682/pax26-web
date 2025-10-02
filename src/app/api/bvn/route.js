import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";
import { verifyToken } from "../helper/VerifyToken";

export async function POST(req) {
    const { bvn } = await req.json();
    try {
        if (!bvn) {
            return NextResponse.json(
                { success: false, message: "BVN is required" },
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

        const response = await axios.get(
            `https://api.flutterwave.com/v3/kyc/bvns/${bvn}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                },
            }
        );

        console.log("Flutterwave BVN Response:", response.data);

        return NextResponse.json(
            { success: true, data: response.data },
            { status: 200, headers: corsHeaders() }
        );

    } catch (error) {
        console.log("Error in BVN route:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data || "Internal Server Error" },
            { status: error.response?.status || 500, headers: corsHeaders() }
        );
    }
}
