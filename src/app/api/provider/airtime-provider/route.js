import mongoose from "mongoose";
import TransactionModel from "@/app/ults/models/TransactionModel";
import UserModel from "@/app/ults/models/UserModel";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import ProviderModel from "@/app/ults/models/ProviderModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();
  const reqBody = await req.json();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { network, amount, number, pin, usedCashBack } = reqBody;

    if (!network || !amount || !number || !pin) {
      await session.abortTransaction(); session.endSession();
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const userId = await verifyToken(req);
    const verifyUser = await UserModel.findById(userId).session(session);

    if (!verifyUser) {
      await session.abortTransaction(); session.endSession();
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (Number(pin) === 1234) {
      await session.abortTransaction(); session.endSession();
      return NextResponse.json(
        { success: false, message: "1234 is not allowed" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const isPinCorrect = await bcrypt.compare(pin, verifyUser.pin);
    if (!isPinCorrect) {
      await session.abortTransaction(); session.endSession();
      return NextResponse.json(
        { success: false, message: "Incorrect PIN provided!" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ✅ Cashback + Wallet Deduction Logic
    let cashbackToUse = 0;
    let walletToUse = Number(amount);

    if (usedCashBack) {
      cashbackToUse = Math.min(verifyUser.cashBackBalance, Number(amount));
      walletToUse = Number(amount) - cashbackToUse;
    }

    // Check wallet sufficiency
    if (verifyUser.walletBalance < walletToUse) {
      await session.abortTransaction(); session.endSession();
      return NextResponse.json(
        { success: false, message: "Insufficient wallet balance" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Deduct balances
    if (cashbackToUse > 0) {
      verifyUser.cashBackBalance -= cashbackToUse;
    }
    verifyUser.walletBalance -= walletToUse;
    await verifyUser.save({ session });

    // 👉 Call external API
    const res = await fetch(
      `https://www.nellobytesystems.com/APIAirtimeV1.asp?UserID=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&MobileNetwork=${network}&Amount=${amount}&MobileNumber=${number}`,
      { method: "GET" }
    );

    const result = await res.json();
    console.log("API Result:", result);

    if (result.status !== "ORDER_RECEIVED") {
      await session.abortTransaction(); session.endSession();
      return NextResponse.json(
        { success: false, message: result.status || "Api transaction failed", details: result },
        { status: 500, headers: corsHeaders() }
      );
    }

    // ✅ Update Provider balance
    await ProviderModel.findOneAndUpdate(
      { name: "ClubConnect" },
      {
        lastUser: userId,
        lastAction: "debit",
        note: `Debited for Airtime`,
        amount: result.walletbalance
      },
      { new: true, upsert: true }
    );

    // ✅ Log transaction
    const newTransaction = await TransactionModel.create(
      [{
        userId,
        type: "airtime",
        amount,
        status: "success",
        transactionId: result.orderid,
        reference: result.orderid,
        metadata: {
          network,
          number,
          cashbackUsed: cashbackToUse,
          walletUsed: walletToUse,
        }
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        success: true,
        message: "Airtime Purchase Successful",
        transaction: newTransaction[0]
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("Transaction error:", error);
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      { success: false, message: "Something went wrong", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}