import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
    await connectDb();
  const { MobileUserId, profileImage } = await req.json();
  const userId = verifyToken(req) || MobileUserId;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success:false, message: "User not found" }, { status: 404, headers:corsHeaders() });
    }

    user.profileImage = profileImage;
    await user.save();

    return NextResponse.json({ success:true,  message: "Profile image updated successfully" });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json({ success:false, message: "Error updating profile image" }, { status: 500, headers:corsHeaders() });
  }
}