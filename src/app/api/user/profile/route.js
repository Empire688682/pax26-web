import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "../../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";

export async function POST() {
    return new NextResponse(null, ({ status: 200, headers: corsHeaders() }))
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "No Id found" }, { status: 404, headers: corsHeaders() })
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "Not authorized" }, { status: 404, headers: corsHeaders() })
        }

        const userMessageList = user.whatsapp?.contacts?.list;
        const messagesHandled = userMessageList.reduce((total, contact) => total + contact?.messageCount, 0);
        const doc = await UserAutomationModel.findOne({ userId });
        const workflows = doc.automations.filter(auto => auto.enabled).length ?? 0;

        // Prepare safe user object
        const userObj = user.toObject();
        userObj.messagesHandled = messagesHandled;
        userObj.workflows = workflows;
        userObj.contacts = user.whatsapp?.contacts?.list?.length || 0;
        delete userObj.password;
        delete userObj.transactionPin
        userObj.whatsappBusinessNo = user.whatsapp.displayPhone;
        delete userObj.isAdmin;
        delete userObj.provider;
        delete userObj.referralHost;
        delete userObj.walletBalance;
        delete userObj.__v;
        delete userObj.commissionBalance;
        delete userObj.referralHostId;
        delete userObj.forgottenPasswordToken;
        delete userObj.bvn;
        delete userObj.emailVerification;
        delete userObj.phoneVerification;
        delete userObj._id;
        delete userObj.whatsapp.accessToken;
        delete userObj.whatsapp.wabaId;
        delete userObj.whatsapp.phoneNumberId;

        return NextResponse.json({ success: true, profile: userObj }, { status: 200, headers: corsHeaders() })

    } catch (error) {
        console.log("FtechingUserErr: ", error.message);
        return NextResponse.json({ success: false, message: "An error occured" }, { status: 500, headers: corsHeaders() })
    }
}