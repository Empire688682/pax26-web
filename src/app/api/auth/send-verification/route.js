import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { sendVerifyUserMessage } from "../../helper/sendVerifyUserMessage";
import { verifyToken } from "../../helper/VerifyToken";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
};

export async function POST(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if(!userId){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }
    const user = await UserModel.findById({ userId });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 400, headers: corsHeaders() });
    }

    if (user.userVerify) {
      return NextResponse.json({ success: false, message: "User already verified" }, { status: 200, headers: corsHeaders() });
    }

    //userVerifyToken, code generator and hashing
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const userNanoid = customAlphabet(alphabet, 6);
    const code = userNanoid();
    const hashCode = await bcrypt.hash(code, 10);
    const expiresInMinutes = 15;
    const verifyTokenExpires = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    user.verifyToken = hashCode;
    user.verifyTokenExpires = verifyTokenExpires;
    await user.save();

    const link = `${process.env.BASE_URL}/user-verification?${hashCode}`
    await sendVerifyUserMessage(email, hashCode, link );

    return NextResponse.json({ success: true, message: "Verification sent" }, { status: 200, headers: corsHeaders() });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Verification Error occurred",
        debugError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}