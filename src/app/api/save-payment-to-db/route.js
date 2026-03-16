import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { verifyToken } from "../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import TransactionModel from "@/app/ults/models/TransactionModel";
import UserModel from "@/app/ults/models/UserModel";

dotenv.config();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();

  try {
    const body = await req.json();
    const { amount, email, name, tx_ref } = body;

    if (!amount || !email || !name || !tx_ref) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers: corsHeaders() });
    }

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers: corsHeaders() });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    await TransactionModel.create({
      userId,
      type: "wallet-funding",
      amount,
      currency: "NGN",
      status: "pending",
      reference: tx_ref,
      providerReference: tx_ref,
      meta: {
        wallet: {
          channel: "bank-transfer",
          providerRef: tx_ref,
          balanceBefore: user.walletBalance,
        }
      }
    });

    return NextResponse.json({ success: true, message: "Payment saved" }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.log("Saving payment error:", error?.response?.data || error.message);
    return NextResponse.json(
      { message: "Failed to save payment", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
