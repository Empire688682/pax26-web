import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
    const  userId  = await verifyToken(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "No Id provided" }, { status: 401, headers:corsHeaders() })
    }
    await connectDb();
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 401, headers:corsHeaders() })
        };
        if (user.commissionBalance <= 99) {
            return NextResponse.json({ success: false, message: "Blance most be above ₦99" }, { status: 401, headers:corsHeaders() })
        }
        await UserModel.findByIdAndUpdate(userId, {
            $inc: { walletBalance: user.commissionBalance },
            $set: { commissionBalance: 0 }
        });

        return NextResponse.json({ success: true, message: "Withdraw successful" }, { status: 200, headers:corsHeaders() });
    } catch (error) {
        console.log("CommisionError:", error);
        return NextResponse.json({ success: false, message: "An error occured" }, { status: 500, headers:corsHeaders() })
    }
}