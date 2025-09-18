import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "@/app/ults/models/UserModel";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();


// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(request) {
  try {
    await connectDb();

    const { email, password, provider = "credentials" } = await request.json();

    const existUser = await UserModel.findOne({ email });
    if (!existUser) {
      return NextResponse.json(
        { success: false, message: "User not exist" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Provider rules
    if (existUser.provider === "credentials") {
      if (provider === "credentials") {
        // Check password
        const passwordMatch = await bcrypt.compare(password, existUser.password);
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, message: "Incorrect password" },
            { status: 400, headers: corsHeaders() }
          );
        }
      } 
      // ⚡ If they used Google login but account was credentials-based → allow
      else if (provider === "google") {
        // Optional: you can update their account to link google as well
        await UserModel.updateOne({ email }, { provider: "credentials" });
      }
    } 
    
    else if (existUser.provider === "google") {
      if (provider !== "google") {
        return NextResponse.json(
          { success: false, message: "Please login with Google" },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // Prepare safe user object
    const userObj = existUser.toObject();
    delete userObj.password;
    delete userObj.pin;
    delete userObj.isAdmin;
    delete userObj.provider;
    delete userObj.referralHost;
    delete userObj.walletBalance;
    delete userObj.__v;
    delete userObj.commissionBalance;
    delete userObj.referralHostId;
    delete userObj.forgottenPasswordToken;

    // Mask email
    if (userObj.email) {
      const [localPart, domain] = userObj.email.split("@");
      if (localPart.length > 2) {
        const maskedLocal =
          localPart[0] + localPart[1] + "*".repeat(localPart.length - 2);
        userObj.email = maskedLocal + "@" + domain;
      }
    }

    // Mask phone
    if (userObj.number) {
      const phone = userObj.number;
      if (phone.length > 4) {
        userObj.number =
          phone.substring(0, 3) +
          "*".repeat(phone.length - 6) +
          phone.substring(phone.length - 3);
      }
    }

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

    return response;
  } catch (error) {
    console.log("Login-error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
