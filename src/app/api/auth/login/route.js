import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "@/app/ults/models/UserModel";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { buildFullUserProfile } from "../../helper/buildFullUserProfile";

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

    if (existUser.isBlocked || existUser.isSuspended) {
      return NextResponse.json(
        {
          success: false,
          message: existUser.suspensionReason
            ? `Account suspended: ${existUser.suspensionReason}. Please contact support at info@pax26.com.`
            : "Your account has been suspended by an administrator. Please contact support at info@pax26.com.",
        },
        { status: 403, headers: corsHeaders() }
      );
    }

   const passwordMatch = await bcrypt.compare(password, existUser.password);
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, message: "Incorrect password" },
            { status: 400, headers: corsHeaders() }
          );
        } 

// Prepare safe user object and timestamp for user maxage
    const userObj = (await buildFullUserProfile(existUser._id)) || existUser.toObject();

    const isMobile = req.headers.get("x-client-type") === "mobile";
    // JWT — mobile app sessions last 1 year (365d), web cookie sessions last 1 day
    const token = jwt.sign(
      { userId: existUser._id },
      process.env.SECRET_KEY,
      { expiresIn: isMobile ? "365d" : "1d" }
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

    return response;
  } catch (error) {
    console.log("Login-error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
