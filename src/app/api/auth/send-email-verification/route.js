import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import bcrypt from "bcryptjs";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { sendVerification } from "../../helper/sendVerification";
import { verifyToken } from "../../helper/VerifyToken";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
};

export async function POST(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 400, headers: corsHeaders() });
    }

    if (user.userVerify) {
      return NextResponse.json({ success: false, message: "User already verified" }, { status: 200, headers: corsHeaders() });
    }

    //userVerifyToken, code generator and hashing
    const numericAlphabet = "0123456789";
    const generateCode = customAlphabet(numericAlphabet, 6);
    const code = generateCode();
    const hashCode = await bcrypt.hash(code, 10);
    const expiresInMinutes = 15;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const MAX_REQUESTS = 5;
    const WINDOW_MS = 60 * 60 * 1000; // 1 hour
    const now = new Date();

    user.emailVerification.token = hashCode;
    user.emailVerification.expiresAt = expiresAt;

    // Initialize if first time
    if (!user.emailVerification.firstRequestAt) {
      user.emailVerification.firstRequestAt = now;
      user.emailVerification.requestCount = 0;
    }

    // Check if window expired
    const timeDiff = now - new Date(user.emailVerification.firstRequestAt);

    if (timeDiff > WINDOW_MS) {
      // 🔄 Reset window
      user.emailVerification.firstRequestAt = now;
      user.emailVerification.requestCount = 0;
    }

    // 🚫 Block if limit exceeded
    if (user.emailVerification.requestCount >= MAX_REQUESTS) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Try again later in 1 hour."
        },
        { status: 429, headers: corsHeaders() }
      );
    }

    const sent = await sendVerification(
      user.email,
      code
    );
    if (!sent) {
      return NextResponse.json({ success: false, message: "Unable to send verification email" }, { status: 500, headers: corsHeaders() });
    }

    user.emailVerification.requestCount = (user.emailVerification.requestCount || 0) + 1;
    await user.save();

    return NextResponse.json({ success: true, message: "Verification sent", data: sent }, { status: 200, headers: corsHeaders() });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Verification sending failed",
        debugError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}