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

    const COOLDOWN_MS = 60 * 1000; // 60-second per-request cooldown
    const MAX_REQUESTS = 5;
    const WINDOW_MS = 60 * 60 * 1000; // 1 hour rolling window
    const now = new Date();

    // ── 60-second cooldown check (primary guard) ──────────────────────
    if (user.emailVerification?.lastSentAt) {
      const elapsed = now - new Date(user.emailVerification.lastSentAt);
      if (elapsed < COOLDOWN_MS) {
        const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${waitSeconds} second${waitSeconds !== 1 ? "s" : ""} before requesting another verification email.`
          },
          { status: 429, headers: corsHeaders() }
        );
      }
    }

    // ── Hourly rate-limit (secondary guard) ──────────────────────────
    if (!user.emailVerification?.firstRequestAt) {
      user.emailVerification.firstRequestAt = now;
      user.emailVerification.requestCount = 0;
    }

    const timeDiff = now - new Date(user.emailVerification.firstRequestAt);
    if (timeDiff > WINDOW_MS) {
      user.emailVerification.firstRequestAt = now;
      user.emailVerification.requestCount = 0;
    }

    if ((user.emailVerification.requestCount || 0) >= MAX_REQUESTS) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again in 1 hour." },
        { status: 429, headers: corsHeaders() }
      );
    }

    // ── Generate & send code ──────────────────────────────────────────
    const numericAlphabet = "0123456789";
    const generateCode = customAlphabet(numericAlphabet, 6);
    const code = generateCode();
    const hashCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const sent = await sendVerification(user.email, code);
    if (!sent) {
      return NextResponse.json(
        { success: false, message: "Unable to send verification email. Please try again." },
        { status: 500, headers: corsHeaders() }
      );
    }

    // ── Persist after confirmed send ──────────────────────────────────
    user.emailVerification.token = hashCode;
    user.emailVerification.expiresAt = expiresAt;
    user.emailVerification.lastSentAt = now;
    user.emailVerification.requestCount = (user.emailVerification.requestCount || 0) + 1;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Verification email sent. Please check your inbox." },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("send-email-verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Verification sending failed. Please try again.",
        debugError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}