import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { verifyToken } from "../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import PaymentModel from "@/app/ults/models/PaymentModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
  await connectDb();

  try {
    const body = await req.json();
    const { amount, email, name, tx_ref, mobileUserId } = body;

    if (!amount || !email || !name || !tx_ref) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers:corsHeaders() });
    }

    const userId = mobileUserId || await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers:corsHeaders() });
    }

    await PaymentModel.create({
      userId,
      amount,
      currency: "NGN",
      reference: tx_ref,
      status: "PENDING",
      paymentMethod: "FLUTTERWAVE",
    });

    return NextResponse.json({success:true, message:"Payment saved"}, { status: 200, headers:corsHeaders() });
  } catch (error) {
    console.error("Flutterwave error:", error?.response?.data || error.message);
    return NextResponse.json(
      { message: "Failed to save payment", error: error.message },
      { status: 500, headers:corsHeaders() }
    );
  }
}
