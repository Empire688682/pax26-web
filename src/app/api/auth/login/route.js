import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "@/app/ults/models/UserModel";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { sendUserVerification } from "../services/sendVerificationService";

dotenv.config();


// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(req) {
  try {
    await connectDb();

    const { email, password} = await req.json();

    const existUser = await UserModel.findOne({ email });
    if (!existUser) {
      return NextResponse.json(
        { success: false, message: "User not exist" },
        { status: 400, headers: corsHeaders() }
      );
    }

   const passwordMatch = await bcrypt.compare(password, existUser.password);
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, message: "Incorrect password" },
            { status: 400, headers: corsHeaders() }
          );
        } 

    // Prepare safe user object
    const userObj = existUser.toObject();
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
    delete userObj.paxAI;
    delete userObj._id;

    // JWT
    const token = jwt.sign(
      { userId: existUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "User logged in successfully",
        finalUserData: userObj,
        token
      },
      { status: 200, headers: corsHeaders() }
    );

    response.cookies.set("UserToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/"
    });

    if(!userObj.userVerify){
       await sendUserVerification(userObj);
    }

    return response;
  } catch (error) {
    console.log("Login-error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
