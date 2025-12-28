import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import bcrypt from "bcrypt";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, { headers: corsHeaders(), status: 200 });
}

export async function POST(req) {
    await connectDb();
    try {
        const reqBody = await req.json();
        const { email, code } = reqBody;

        if (!email || !code) {
            return NextResponse.json({ success: false, message: "Code and email required" }, { status: 400, headers: corsHeaders() });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 400, headers: corsHeaders() });
        }

        if (user.userVerify) {
            return NextResponse.json({ success: false, message: "User already verified" }, { status: 200, headers: corsHeaders() });
        }

        const isCodeMatch = await bcrypt.compare(code, user.verifyToken);
        if (!isCodeMatch) {
            return NextResponse.json({ success: false, message: "Invalid code" }, { status: 400, headers: corsHeaders() });
        }

        // Check expiry
        if (user.verifyTokenExpires < new Date()) {
            return NextResponse.json({ success: false, message: "Code expired" }, { status: 400, headers: corsHeaders() });
        }

        user.userVerify = true;
        user.verifyToken = ""; // optional: clear token after use
        user.verifyTokenExpires = null; // optional: clear expiry
        await user.save();

        return NextResponse.json({ success: true, message: "User activated" }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.log("User-verify-Error: ", error);
        return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500, headers: corsHeaders() });
    }
}
