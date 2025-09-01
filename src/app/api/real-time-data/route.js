import UserModel from "@/app/ults/models/UserModel";
import TransactionModel from "@/app/ults/models/TransactionModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../helper/VerifyToken";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";


export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function GET(req) {
    const {searchParams} = new URL(req.url);
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers:corsHeaders() });
        }
        const user = await UserModel.findById({_id:userId});
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404, headers:corsHeaders() });
        }
        const transactions = await TransactionModel.find({ userId });
        const walletBalance = user.walletBalance || 0;
        const commisionBalance = user.commisionBalance || 0;
        return NextResponse.json({ success: true, message: "Transaction history", data:{walletBalance, transactions, commisionBalance} }, { status: 200, headers:corsHeaders() });
    } catch (error) {
        console.log("ERROR:", error);
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500, headers:corsHeaders() });
    }
}