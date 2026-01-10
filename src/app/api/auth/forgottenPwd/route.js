import dotenv from "dotenv";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { sendPasswordResettingEmail } from "../../helper/sendPasswordResetting";
dotenv.config();


export async function OPTIONS() {
  return new NextResponse(null, {status:200, headers:corsHeaders()})
};

export async function POST(req) {
  await connectDb();
  try {
    const reqBody = await req.json();
    const { email } = reqBody;
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email required" },
        { status: 400, headers:corsHeaders() },
      );
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400, headers:corsHeaders() },
      );
    };

    const forgottenPasswordToken = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "15m", // or "1h", adjust as needed
    });
    await UserModel.findOneAndUpdate(
      { email },
      { forgottenPasswordToken },
      { new: true },
    );

    const resetingPwdLink = `${process.env.BASE_URL}/reset-password?Emailtoken=${forgottenPasswordToken}&userId=${user._id}`;
    const sendingStatus = await sendPasswordResettingEmail(email, resetingPwdLink, "PasswordReset");

    if (!sendingStatus) {
      return NextResponse.json(
        { success: false, message: "An error occured" },
        { status: 400, headers:corsHeaders() },
      );
    }

    return NextResponse.json(
      { success: true, message: "Email sent" },
      { status: 200, headers:corsHeaders() },
    );
  } catch (error) {
    console.log("ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send email" },
      { status: 500, headers:corsHeaders() },
    );
  }
}
