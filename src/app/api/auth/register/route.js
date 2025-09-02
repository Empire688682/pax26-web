import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import ReferralModel from "@/app/ults/models/ReferralModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
};



const registerUser = async (req) => {
  const reBody = await req.json();

  const userAgent = req.headers.get('user-agent') || "";
  const isMobile = userAgent.includes('Expo') ||
    userAgent.includes('ReactNative') ||
    req.headers.get('x-client-type') === 'mobile' ||
    userAgent.includes('okhttp');

  try {
    await connectDb();

    const {
      name,
      email,
      number,
      password,
      refId,
      provider = "credentials",
    } = reBody;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (provider === "credentials" && (!password || !number)) {
      return NextResponse.json(
        { success: false, message: "Password and number are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (provider === "credentials") {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email has been taken" },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    let hashedPassword = undefined;
    let defaultPin = undefined;

    if (provider === "credentials") {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 8 characters" },
          { status: 400, headers: corsHeaders() }
        );
      }

      hashedPassword = await bcrypt.hash(password, 10);
      defaultPin = "1234";
    }

    const newUser = await UserModel.create({
      name,
      email,
      number,
      password: hashedPassword,
      pin: defaultPin,
      referralHost: refId,
      provider,
    });


    // Handle referral if provided
    if (refId) {
      const refHost = await UserModel.findById(refId);
      if (refHost) {
        await ReferralModel.create({
          referrer: refHost._id,
          referredUser: newUser._id,
        });
      }
    }

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.pin;
    delete userObj.isAdmin;
    delete userObj.provider;
    delete userObj.referralHost;
    delete userObj.walletBalance;
    delete userObj.__v;
    delete userObj.commissionBalance;
    delete userObj.forgottenPasswordToken;
    const finalUserData = userObj;

    const userId = newUser._id;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    if (isMobile) {
      return NextResponse.json(
        { success: true, message: "User created", finalUserData, token },
        { status: 200, headers: corsHeaders() }
      );
    } else {
      const res = NextResponse.json(
        { success: true, message: "User created", finalUserData },
        { status: 200, headers: corsHeaders() }
      );

      res.cookies.set("UserToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: "lax",
        path: "/",
      });

      return res;
    }
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Register Error occurred",
        debugError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500, headers: corsHeaders() }
    );
  }
};

export async function POST(req) {
  return registerUser(req);
}
