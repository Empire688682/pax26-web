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
    const body = await req.json();
    const { contactNumber, status } = body;

    if (!contactNumber || !status) {
      return NextResponse.json(
        { success: false, message: "Contact number and status are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const phone = contactNumber.trim();

    const userId = await verifyToken(req);

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // 🔥 1. Try updating existing contact
    const updateResult = await UserModel.updateOne(
      { _id: userId, "whatsapp.contacts.list.phone": phone },
      {
        $set: {
          "whatsapp.contacts.list.$.status": status,
          "whatsapp.contacts.list.$.updatedAt": new Date()
        }
      }
    );

    // 🔥 2. If contact does NOT exist → create it
    if (updateResult.matchedCount === 0) {
      await UserModel.updateOne(
        { _id: userId },
        {
          $push: {
            "whatsapp.contacts.list": {
              phone,
              status,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }
      );
    }

    return NextResponse.json(
      { success: true, message: "Contact updated successfully" },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("WhatsAppContactsPolicyErr:", error);

    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}