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

    const reqBody = await request.json();
    const { email, password } = reqBody;

    const existUser = await UserModel.findOne({ email });
    if (!existUser) {
      return NextResponse.json(
        { success: false, message: "User not exist" },
        {
          status: 400,
          headers: corsHeaders()
        }
      );
    }

    if (existUser.provider === "google") {
      if (existUser.password === "not set") {
        return NextResponse.json(
          {
            success: false,
            message: "User password not set, continue with google and set up your password"
          },
          {
            status: 400,
            headers: corsHeaders()
          }
        );
      }
    }

    const passwordMatch = await bcrypt.compare(password, existUser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        {
          status: 400,
          headers: corsHeaders()
        }
      );
    }

    // Remove sensitive data from user object
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
    // Mask email: replace characters 3 to second-to-last with *
    if (userObj.email) {
      const email = userObj.email;
      const [localPart, domain] = email.split('@');

      if (localPart.length > 2) {
        const maskedLocal = localPart[0] + localPart[1] + '*'.repeat(localPart.length - 2);
        userObj.email = maskedLocal + '@' + domain;
      }
    }
    // Mask phone number
    if (userObj.number) {
      const phone = userObj.number;
      if (phone.length > 4) {
        // Show first 3 and last 3 digits
        const masked = phone.substring(0, 3) + '*'.repeat(phone.length - 6) + phone.substring(phone.length - 3);
        userObj.number = masked;
      }
    }
    const finalUserData = userObj;

    // Generate JWT token
    const userId = existUser._id;
    const token = jwt.sign(
      { userId },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Create response with CORS headers
    const response = NextResponse.json(
      {
        success: true,
        message: "User logged in successfully",
        finalUserData,
        token // Include token in response for mobile app
      },
      {
        status: 200,
        headers: corsHeaders()
      }
    );

    // Set cookie (mainly for web usage)
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
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}