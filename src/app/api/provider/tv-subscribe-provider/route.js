import crypto from "crypto";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "../../helper/VerifyToken";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import TransactionModel from "@/app/ults/models/TransactionModel";
import ProviderModel from "@/app/ults/models/ProviderModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
  await connectDb();
  const body = await req.json();
  const { provider, smartcardNumber, amount, tvPackage, phone, pin } = body;

  const savedAmount = Number(amount);
  if (isNaN(savedAmount)) {
    return NextResponse.json({ success: false, message: "Invalid package amount" }, { status: 400, headers:corsHeaders() });
  }

  try {
    if (!provider || !smartcardNumber || !amount || !phone || !tvPackage || !pin) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400, headers:corsHeaders() });
    }


    const userId = await verifyToken(req);
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers:corsHeaders() });
    }

    const isPinMatch = await bcrypt.compare(pin, user.pin);
    if (!isPinMatch) {
      return NextResponse.json({ success: false, message: "Pin not correct" }, { status: 401, headers:corsHeaders() });
    }

    if (user.walletBalance < savedAmount) {
      return NextResponse.json({ success: false, message: "Insufficient funds" }, { status: 400, headers:corsHeaders() });
    }

    const requestId = crypto.randomUUID();

    const TvUrl = `https://www.nellobytesystems.com/APICableTVV1.asp?UserID=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&CableTV=${provider.toLowerCase()}&Package=${tvPackage}&SmartCardNo=${smartcardNumber}&PhoneNo=${phone}`

    const response = await fetch(TvUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    const result = await response.json();

    console.log("Response:", result);

    if (result?.status !== "ORDER_RECEIVED") {
      return NextResponse.json({ success: false, message: "Order failed", data: result }, { status: 400, headers:corsHeaders() });
    }

    // ✅ Update Provider balance
    await ProviderModel.findOneAndUpdate(
      { name: "ClubConnect" },
      {
        lastUser: userId,
        lastAction: "debit",
        note: `Debited for Tv`,
        amount: result.walletbalance
      },
      { new: true, upsert: true }
    );


    await UserModel.findByIdAndUpdate(
      userId,
      { walletBalance: user.walletBalance - savedAmount },
      { new: true }
    );

    await TransactionModel.create({
      userId,
      type: "tv",
      amount: savedAmount,
      status: "success",
      reference: requestId,
      metadata: {
        network: provider,
        number: smartcardNumber,
      },
    });

    return NextResponse.json({ success: true, message: "Order successful", data: result }, { status: 200, headers:corsHeaders() });
  } catch (error) {
    console.error("Tv-ERROR:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500, headers:corsHeaders() });
  }
}
