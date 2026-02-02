import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../helper/VerifyToken";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, { headers: corsHeaders(), status: 200 });
}

export async function POST(req) {
    await connectDb();
    try {
        const reqBody = await req.json();
        const { code } = reqBody;

        if (!code) {
            return NextResponse.json({ success: false, message: "Code required" }, { status: 400, headers: corsHeaders() });
        }

        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 400, headers: corsHeaders() });
        }

        if (user.userVerify) {
            return NextResponse.json({ success: false, message: "User already verified" }, { status: 200, headers: corsHeaders() });
        }

        const isCodeMatch = await bcrypt.compare(code, user.emailVerification.token);
        if (!isCodeMatch) {
            return NextResponse.json({ success: false, message: "Invalid code" }, { status: 400, headers: corsHeaders() });
        }

        // Check expiry
        if (user.emailVerification.expiresAt < new Date()) {
            return NextResponse.json({ success: false, message: "Code expired" }, { status: 400, headers: corsHeaders() });
        }

        user.userVerify = true;
        user.emailVerification.expiresAt = null; 
        user.emailVerification.token = ""; 
        user.emailVerification.isVerified = true; 
        await user.save();

        return NextResponse.json({ success: true, message: "User verified" }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.log("User-verify-Error: ", error);
        return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500, headers: corsHeaders() });
    }
}
