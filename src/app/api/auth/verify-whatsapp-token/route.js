import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { headers } from "next/headers";
import { verifyToken } from "../../helper/VerifyToken";

export async function OPTIONS(params) {
    return new NextResponse.json(null, {status:200, headers:corsHeaders()})
}

export async function POST(req) {
    await connectDb();
    try {
        const reqBody = await req.json();
        const {otp} = reqBody;
        if(!otp){
             return NextResponse.json({success:false, message:"All field required", status:400, headers:corsHeaders()});
        }
        const userId =  await verifyToken(req);
        if(!userId){
             return NextResponse.json({success:false, message:"Invalid Id", status:400, headers:corsHeaders()});
        }

        const user =  await UserModel.findById(userId);
        if(!user){
             return NextResponse.json({success:false, message:"User not authorized", status:400, headers:corsHeaders()});
        }

        user.number = user.phoneVerification.incomingNumber;
        user.phoneVerification.token = "";
        user.phoneVerification.requestCount = 0
        user.phoneVerification.firstRequestAt = null;
        user.phoneVerification.isVerified = true;
        user.phoneVerification.incomingNumber = null;

        await user.save();

         return NextResponse.json({success:true, message:"Number verified", status:200, headers:corsHeaders()});

    } catch (error) {
        console.log("CodeVerError:", error);
        return NextResponse.json({success:false, status:500, headers:corsHeaders()});
    }
}