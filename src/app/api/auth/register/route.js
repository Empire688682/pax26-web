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
import { buildFullUserProfile } from "../../helper/buildFullUserProfile";
import { sendTransactionalEmail } from "@/app/ults/utils/sendpulseMail";

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

    // Normalize: lowercase email, strip leading country code from phone
    // so "Pastorfanta42@gmail.com" and "pastorfanta42@gmail.com" are treated as the same,
    // and "2348140202342" / "08140202342" are treated as the same number.
    const normalizedEmail  = email.trim().toLowerCase();
    const normalizedNumber = number
      ? number.trim().replace(/\s+/g, "").replace(/^\+?234/, "0").replace(/^234/, "0")
      : number;

    const existingUser = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { number: normalizedNumber }]
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
      email: normalizedEmail,
      number: normalizedNumber,
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

    const userId = newUser._id;
    const finalUserData = (await buildFullUserProfile(userId)) || newUser.toObject();
    const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
      expiresIn: isMobile ? "365d" : "1d",
    });

    // ── Notify admin of new signup (fire-and-forget) ──────────────
    const signupAt = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
    sendTransactionalEmail({
      toEmail:   "asehindej@gmail.com",
      toName:    "Pax26 Admin",
      subject:   `🎉 New Signup — ${name} (${normalizedEmail})`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="border-bottom:2px solid #22c55e;padding-bottom:12px;margin-bottom:20px;">
            <h2 style="color:#16a34a;margin:0;font-size:18px;">🎉 New User Signed Up</h2>
            <span style="font-size:11px;color:#6b7280;font-family:monospace;">Pax26 Platform · ${signupAt}</span>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:14px;"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 6px;font-size:14px;"><strong>Email:</strong> <a href="mailto:${normalizedEmail}" style="color:#16a34a;">${normalizedEmail}</a></p>
            <p style="margin:0 0 6px;font-size:14px;"><strong>Phone:</strong> ${normalizedNumber || "—"}</p>
            <p style="margin:0 0 6px;font-size:14px;"><strong>Country:</strong> ${country || "—"}</p>
            <p style="margin:0;font-size:14px;"><strong>Channel:</strong> ${isMobile ? "Mobile App" : "Web"}</p>
          </div>
          <a href="https://pax26-admin.vercel.app/users" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;">View in Admin Panel</a>
          <p style="font-size:11px;color:#9ca3af;margin-top:20px;">Sent automatically by Pax26 on every new registration.</p>
        </div>
      `,
      text: `New signup: ${name} (${normalizedEmail}) · ${country || ""} · ${isMobile ? "Mobile" : "Web"} · ${signupAt}`,
      fromEmail: "info@pax26.com",
      fromName:  "Pax26 Platform",
    }).catch(() => {});

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
