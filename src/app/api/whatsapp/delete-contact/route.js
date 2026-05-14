import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const completePhone = phone.startsWith("+") ? phone : "+234" + phone.trim().slice(-10);

    await UserModel.findByIdAndUpdate(userId, {
      $pull: { "whatsapp.contacts.list": { phone: completePhone } }
    });

    return NextResponse.json(
      { success: true, message: "Contact deleted successfully" },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("DeleteContactErr:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
