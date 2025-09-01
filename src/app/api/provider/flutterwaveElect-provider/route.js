import crypto from "crypto";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "../../helper/VerifyToken";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import TransactionModel from "@/app/ults/models/TransactionModel";
import ProviderModel from "@/app/ults/models/ProviderModel";
import { verifyCustomer } from "../../helper/FlutterWaveBillerVerification";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
  await connectDb();
  const body = await req.json();
  const { disco, meterNumber, meterType, amount, phone, pin, mobileUserId } = body;

  try {
    if (!disco || !meterNumber || !meterType || !amount || !phone || !pin) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400, headers:corsHeaders() });
    }

    const userId = mobileUserId || await verifyToken(req);
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers:corsHeaders() });
    }

    const isPinMatch = await bcrypt.compare(pin, user.pin);
    if (!isPinMatch) {
      return NextResponse.json({ success: false, message: "Pin not correct" }, { status: 401, headers:corsHeaders() });
    }

    const saveAmount = Number(amount);
    if (user.walletBalance < saveAmount) {
      return NextResponse.json({ success: false, message: "Insufficient funds" }, { status: 400, headers:corsHeaders() });
    }

    //const customerData = await verifyCustomer(meterNumber);

    const billerConfig = {
       EKO_ELECTRIC: {
        BillerCode: "BIL111",
        Prepaid: "UB136",
        Postpaid: "UB136"
      },
        ABUJA_ELECTRIC: {
        BillerCode: "BIL204",
        Prepaid: "UB136",
        Postpaid: "UB585"
      },
       KADUNA_ELECTRIC: {
        BillerCode: "BIL112",
        Prepaid: "UB157",
        Postpaid: "UB158"
      },
      IKEJA_ELECTRIC: {
        BillerCode: "BIL113",
        Prepaid: "UB159",
        Postpaid: "UB160"
      },
       PORTHACOURT_ELECTRIC: {
        BillerCode: "BIL114",
        Prepaid: "UB162",
        Postpaid: "UB161"
      },
      KANO_ELECTRIC: {
        BillerCode: "BIL115",
        Prepaid: "UB163",
        Postpaid: "UB164"
      },
      IBADAN_ELECTRIC: {
        BillerCode: "BIL116",
        Postpaid: "UB593"
      },
      ENUGU_ELECTRIC: {
        BillerCode: "BIL117",
        Prepaid: "UB166",
        Postpaid: "UB167"
      },
      BENIN_ELECTRIC: {
        BillerCode: "BIL118",
        Prepaid: "UB160",
        Postpaid: "UB161"
      },
   };

    const selectedBiller = billerConfig[disco];
    if (!selectedBiller) {
    return NextResponse.json({ success: false, message: "Invalid disco provider" }, { status: 400, headers:corsHeaders() });
    }

    const billerCode = selectedBiller.BillerCode;
    const productCode = selectedBiller[meterType];

    const requestId = crypto.randomUUID() + "-Monetrax";

    // Updated API call using the correct endpoint structure
    const flutterwaveUrl = `https://api.flutterwave.com/v3/billers/${billerCode}/items/${productCode}/payment`;

    const flutterwaveRes = await fetch(flutterwaveUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount:"1000",
        country: "NG",
        biller_code: billerCode,
        customer_id: meterNumber,
        reference:requestId
      })
    });

    const result = await flutterwaveRes.json();
    console.log("🧾 Flutterwave Response:", result);

    if (result.status !== "success") {
      return NextResponse.json({ success: false, message: "Transaction failed", data: result }, { status: 400, headers:corsHeaders() });
    }

    await ProviderModel.findOneAndUpdate(
      { name: "Flutterwave" },
      {
        lastUser: userId,
        lastAction: "debit",
        note: "Electricity payment",
        amount: saveAmount
      },
      { new: true, upsert: true }
    );

    await UserModel.findByIdAndUpdate(
      userId,
      { walletBalance: user.walletBalance - saveAmount },
      { new: true }
    );

    await TransactionModel.create({
      userId,
      type: "electricity",
      amount: saveAmount,
      status: "success",
      transactionId: result?.orderid,
      reference: requestId,
      metadata: {
        disco,
        meterType,
        meterNumber,
        token: result.data?.token || "",
        units: result.data?.unit || ""
      }
    });

    return NextResponse.json({ success: true, message: "Payment successful", data: result.data }, { status: 200, headers:corsHeaders() });

  } catch (error) {
    console.error("💥 Electricity-FLW-ERROR:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500, headers:corsHeaders() });
  }
}