import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "../../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function POST() {
    return new NextResponse(null, ({status:200, headers:corsHeaders()}))
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if(!userId){
            return NextResponse.json({success:false, message:"No Id found"}, {status:404, headers:corsHeaders()})
        }

        const user = await UserModel.findById(userId);
        if(!user){
            return NextResponse.json({success:false, message:"Not authorized"}, {status:404, headers:corsHeaders()})
        }

        // Prepare safe user object
    const userObj = user.toObject();
    delete userObj.password;
    if(userObj.pin){
      userObj.pin = true;
    }else{
      userObj.pin = null;
    }
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
    delete userObj.whatsapp;

    return NextResponse.json({success:true, profile:userObj}, {status:200, headers:corsHeaders()})

    } catch (error) {
        console.log("FtechingUserErr: ", error.message);
        return NextResponse.json({success:false, message:"An error occured"}, {status:500, headers:corsHeaders()})
    }
}