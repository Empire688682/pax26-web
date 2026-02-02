import { connectDb } from "@/app/ults/db/ConnectDb";
import { UserModel } from "@/app/ults/models/UserModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { generateOTP } from "../../helper/generateOTP";
import bycrypt from "bcryptjs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
};

export async function POST(req) {
    await connectDb();
    try {
        const reqBody = await req.json();
        const {phoneNumber} = reqBody;
        if (!phoneNumber) {
          return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400, headers: corsHeaders() });
        }
        const userId = await verifyToken(req);
        if (!userId) {
          return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }
        const user = await UserModel.findById(userId);

        if (!user) {
          return NextResponse.json({ success: false, message: "User not found" }, { status: 400, headers: corsHeaders() });
        }

        if (user.phoneVerified) {
          return NextResponse.json({ success: false, message: "Phone number already verified" }, { status: 200, headers: corsHeaders() });
        }

        if(user.otpRequestimes >= 5){
          return NextResponse.json({ success: false, message: "Maximum OTP requests reached. Please try again later." }, { status: 429, headers: corsHeaders() });
        }

        const otp = generateOTP(6);
        const hashedOtp = await bycrypt.hash(otp, 10); 
        user.phoneVerifyToken = hashedOtp;
        user.otpRequestimes = (user.requestimes || 0) + 1;
        user.phoneVerifyTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Here you would integrate with an SMS service to send the OTP to the user's phone number.
        console.log(`Sending OTP ${otp} to phone number ${phoneNumber}`);
    } catch (error) {
        console.error("Initiate Verify Number Error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Initiate verify number failed",
          },
          { status: 500, headers: corsHeaders() }
        );
    }
}