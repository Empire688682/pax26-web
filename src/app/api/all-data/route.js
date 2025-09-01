import UserModel from "@/app/ults/models/UserModel";
import TransactionModel from "@/app/ults/models/TransactionModel";
import { verifyToken } from "../helper/VerifyToken";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import PaymentModel from "@/app/ults/models/PaymentModel";
import ReferralModel from "@/app/ults/models/ReferralModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";


export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function GET(req) {
    await connectDb();
    const userId = await verifyToken(req);
    if (!userId || typeof userId !== "string") {
        return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401, headers:corsHeaders() });
    }

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401, headers:corsHeaders()  });
        }

        const refRewardedSum = await ReferralModel.aggregate([
         { $match: { rewardGiven: true } },
         { $group: { _id: null, total: { $sum: "$rewardAmount" } } }
         ]);

        const totalReward = refRewardedSum[0]?.total || 0;

       const successfulFunding = await PaymentModel.aggregate([
        {$match: {status: "PAID"}},
        {$group: {_id: null, total:{$sum: "$amount"}}}
       ]);

       const walletsTotal = successfulFunding[0]?.total || 0

        const [users, allTransactions, airtime, data, tv, electricity] = await Promise.all([
            UserModel.countDocuments(),
            TransactionModel.countDocuments(),
            TransactionModel.countDocuments({ type: "airtime" }),
            TransactionModel.countDocuments({ type: "data" }),
            TransactionModel.countDocuments({ type: "tv" }),
            TransactionModel.countDocuments({ type: "electricity" }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                users,
                allTransactions,
                airtime,
                data,
                tv,
                electricity,
                walletsTotal,
                totalReward
            },
            message: "All data fetched"
        }, { status: 200, headers:corsHeaders() });

    } catch (error) {
        console.log("AlldataError:", error);
        return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500, headers:corsHeaders() });
    }
}
