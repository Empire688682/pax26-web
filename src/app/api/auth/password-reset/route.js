import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "../../helper/VerifyToken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders});
};

export async function POST(req) {
    const reqBody = await req.json();
    try {
        await connectDb();

        const { currentPwd, newPwd, mobileUserId } = reqBody;
        if (!currentPwd || !newPwd) {
            return NextResponse.json({ success: false, message: "All field required" }, { status: 400, headers:corsHeaders() })
        }

        const userId = mobileUserId || await verifyToken(req);
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not Authenticated" }, { status: 400, headers:corsHeaders() })
        }
        if (user.provider === "credentials" || user.password !== "not set") {
            const isPasswordMatch = await bcrypt.compare(currentPwd, user.password);
            if (!isPasswordMatch) {
                return NextResponse.json({ success: false, message: `Incorect current password @${user.name.split(" ")[0]} `}, { status: 400, headers:corsHeaders() })
            }
        }
        const hashedPassword = await bcrypt.hash(newPwd, 10);
        user.password = hashedPassword;
        await user.save();
        return NextResponse.json({ success: true, message: "Password changed" }, { status: 200, headers:corsHeaders()  })
    } catch (error) {
        console.log("Error:", error);
        return NextResponse.json({ success: false, message: "An error occured" }, { status: 500, headers:corsHeaders()  })
    }
}