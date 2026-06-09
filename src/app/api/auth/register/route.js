import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import ReferralModel from "@/app/ults/models/ReferralModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { customAlphabet } from "nanoid";
import { sendUserVerification } from "../services/sendVerificationService";

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
      refHostCode,
      profileImage,
      providerId,
      provider,
      country,
    } = reBody;


    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!country) {
      return NextResponse.json(
        { success: false, message: "Country is required" },
        { status: 400, headers: corsHeaders() }
      );
    }


    if (!password || !number) {
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

    const existingUser = await UserModel.findOne({ 
      $or:[{email}, {number}]
     });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email or Phone number has been taken" },
          { status: 400, headers: corsHeaders() }
        );
      }

    if (password.length < 8) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 8 characters" },
          { status: 400, headers: corsHeaders() }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
    //Generate referralCode
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const nextUserNumber = await UserModel.countDocuments() + 1;
    const prefx = (name || "").toUpperCase().slice(0, 3);
    const nanoid = customAlphabet(chars, 4);
    const referralCode = "PAX" + prefx + nanoid() + nextUserNumber;

    //Get referral host id
    let referralHostId = undefined;
    let referredByUserId = undefined;
    if (refHostCode) {
      const refHost = await UserModel.findOne({ referralCode: refHostCode });
      if (refHost) {
        // Prevent self-referral (extra guard — can't self-refer at sign-up, but safety check)
        referralHostId   = refHost._id;
        referredByUserId = refHost._id;
      }
    }

    const authTimestamp = Date.now()

    const newUser = await UserModel.create({ 
      name,
      email,
      number,
      password: hashedPassword,
      pin: null,
      authTimestamp,
      referralHostId: referralHostId,
      referredBy: referredByUserId || null,
      provider,
      isPasswordSet: true,
      providerId: providerId || null,
      referralCode,
      profileImage,
      country: country || null,
    });



    // Handle referral if provided
    if (refHostCode && referredByUserId) {
      // Check not already referred (prevent duplicate records)
      const existingReferral = await ReferralModel.findOne({
        referrer: referredByUserId,
        referredUser: newUser._id,
      });
      if (!existingReferral) {
        await ReferralModel.create({
          referrer: referredByUserId,
          referredUser: newUser._id,
          referralCodeUsed: refHostCode,
          status: 'pending',
        });
        // Increment referrer's totalReferrals counter
        await UserModel.findByIdAndUpdate(referredByUserId, {
          $inc: { totalReferrals: 1 },
        });
      }
    }

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.transactionPin;
    delete userObj.isAdmin;
    delete userObj.provider;
    delete userObj.referralHost;
    delete userObj.walletBalance;
    delete userObj.__v;
    delete userObj.commissionBalance;
    delete userObj.forgottenPasswordToken;
    delete userObj.referralHostId;
    delete userObj.bvn;
    delete userObj.emailVerification;
    delete userObj.phoneVerification;
    delete userObj._id;
    delete userObj.whatsapp;

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

     const sendUserMsg = await sendUserVerification(newUser);

      return res;
    }
  } catch (error) {
    console.log("Register Error:", error);
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
