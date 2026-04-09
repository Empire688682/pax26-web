import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();

    const userId = await verifyToken(req);

    const user = await UserModel.findById(userId)
      .select("whatsapp.contacts")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401, headers: corsHeaders() }
      );
    };

    const contacts = user?.whatsapp?.contacts?.list ?? [];

    return NextResponse.json(
      { success: true, data: contacts },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("FetchingContactsErr:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch contacts" },
      { status: 500, headers: corsHeaders() }
    );
  }
}