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
import { nanoid } from "nanoid";

dotenv.config();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();
  const body = await req.json();
  const { disco, meterNumber, meterType, customerAddress, customerName, amount, phone, pin } = body;
  try {
    // Validate request
    if (!disco || !meterNumber || !meterType || !amount || !phone || !pin || !customerName || !customerAddress) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400, headers: corsHeaders() });
    }

    // Disco codes
    const availableDiscos = {
      "EKO_ELECTRIC": "01",
      "IKEJA_ELECTRIC": "02",
      "ABUJA_ELECTRIC": "03",
      "KANO_ELECTRIC": "04",
      "PORTHACOURT_ELECTRIC": "05",
      "JOS_ELECTRIC": "06",
      "IBADAN_ELECTRIC": "07",
      "KADUNA_ELECTRIC": "08",
      "ENUGU_ELECTRIC": "09",
      "BENIN_ELECTRIC": "10",
      "YOLA_ELECTRIC": "11",
      "ABA_ELECTRIC": "12",
    };

    const allmeterType = {
      "Prepaid": "01",
      "Postpaid": "02"
    }

    // Validate disco
    if (!availableDiscos[disco]) {
      return NextResponse.json({ success: false, message: "Invalid disco" }, { status: 400, headers: corsHeaders() });
    }

    // Validate meter type
    if (!allmeterType[meterType]) {
      return NextResponse.json({ success: false, message: "Invalid meter type" }, { status: 400, headers: corsHeaders() });
    }

    // Auth and funds check
    const userId = await verifyToken(req);
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers: corsHeaders() });
    }

    const isPinMatch = await bcrypt.compare(pin, user.transactionPin);
    if (!isPinMatch) {
      return NextResponse.json({ success: false, message: "Pin not correct" }, { status: 401, headers: corsHeaders() });
    }

    const saveAmount = Number(amount);
    if (user.walletBalance < saveAmount) {
      return NextResponse.json({ success: false, message: "Insufficient funds" }, { status: 400, headers: corsHeaders() });
    }

    // Generate request ID
    const requestId = crypto.randomUUID();

    // Construct URL
    const electricityUrl = `https://www.nellobytesystems.com/APIElectricityV1.asp?UserID=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&ElectricCompany=${availableDiscos[disco]}&MeterType=${allmeterType[meterType]}&MeterNo=${meterNumber}&Amount=${saveAmount}&PhoneNo=${phone}&RequestID=${requestId}`;

    // Fetch with GET method
    const response = await fetch(electricityUrl, {
      method: "GET"
    });
    const result = await response.json();

    console.log("Response:", result);

    if (result?.status === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ success: false, message: "Internal Error", data: result }, { status: 400, headers: corsHeaders() });
    };

    if (!result?.transactionstatus?.includes("ORDER_RECEIVED")) {
      return NextResponse.json({ success: false, message: "We are sorry Electricity currently not available", data: result }, { status: 400, headers: corsHeaders() });
    };

    // ✅ Update Provider balance
    await ProviderModel.findOneAndUpdate(
      { name: "ClubConnect" },
      {
        lastUser: userId,
        lastAction: "debit",
        note: `Debited for Electricity`,
        amount: result.walletbalance
      },
      { new: true, upsert: true }
    );

    // Deduct wallet balance
    await UserModel.findByIdAndUpdate(
      userId,
      { walletBalance: user.walletBalance - saveAmount },
      { new: true }
    );


    const fee = saveAmount - Number(result?.amount || 0);
    let token = null;

    const rawToken = result?.metertoken;

    if (typeof rawToken === "string") {
      const match = rawToken.match(/\d+/);
      token = match ? match[0] : null;
    }

    console.log("Final Token:", token);

    const transaction = await TransactionModel.create({
      userId,
      type: "electricity",
      amount: saveAmount,
      status: "success",
      reference: requestId,
      fee,
      meta: {
        utility: {
          provider: disco,
          accountNumber: result?.meterno,
          customerName,
          meterType,
          address: customerAddress,
          tokenGenerated: token,
        }
      },
    });

    return NextResponse.json({ success: true, message: "Order successful", data: transaction, result }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error("Electricity-ERROR:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}
