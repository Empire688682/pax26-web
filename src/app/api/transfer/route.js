import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../helper/VerifyToken";
import bcrypt from "bcryptjs";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import TransactionModel from "@/app/ults/models/TransactionModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();

  try {
    const { accountNumber, amount, pin } = await req.json();

    if (!accountNumber || !amount || !pin) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (Number(amount) < 50) {
      return NextResponse.json(
        { message: "Minimum transfer amount is ₦50" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const sender = await UserModel.findById(userId);
    if (!sender) {
      return NextResponse.json(
        { message: "Sender not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const pinMatch = await bcrypt.compare(pin, sender.pin);
    if (!pinMatch) {
      return NextResponse.json(
        { message: "Invalid transaction PIN" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const number = "0" + accountNumber.trim();

    if (sender.number === number) {
      return NextResponse.json(
        { message: "You cannot transfer to yourself" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const recipient = await UserModel.findOne({ number });
    if (!recipient) {
      return NextResponse.json(
        { message: "Recipient not found on Pax26" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (sender.walletBalance < Number(amount)) {
      return NextResponse.json(
        { message: "Insufficient wallet balance" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ✅ Capture balances BEFORE mutation
    const senderBefore = sender.walletBalance;
    const recipientBefore = recipient.walletBalance;
    const senderAfter = senderBefore - Number(amount);
    const recipientAfter = recipientBefore + Number(amount);

    sender.walletBalance = senderAfter;
    recipient.walletBalance = recipientAfter;

    const last10Sender = sender.number.slice(-10);
    const last10Recipient = recipient.number.slice(-10);
    const reference = `TRF-${Date.now()}-${sender._id}`;

    // ✅ Atomic session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await sender.save({ session });
      await recipient.save({ session });

      await TransactionModel.create([{
        userId: sender._id,
        type: "transfer",
        amount: Number(amount),
        status: "success",
        reference: "Se_" + reference,
        meta: {
          transfer: {
            direction: "debit",
            senderName: sender.name,
            senderNumber: last10Sender,
            recipientName: recipient.name,
            recipientNumber: last10Recipient,
            balanceBefore: senderBefore,
            balanceAfter: senderAfter,
          }
        },
      }], { session });

      await TransactionModel.create([{
        userId: recipient._id,
        type: "transfer",
        amount: Number(amount),
        status: "success",
        reference: "Re_" + reference,
        meta: {
          transfer: {
            direction: "credit",
            senderName: sender.name,
            senderNumber: last10Sender,
            recipientName: recipient.name,
            recipientNumber: last10Recipient,
            balanceBefore: recipientBefore,
            balanceAfter: recipientAfter,
          }
        },
      }], { session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      // ✅ Return specific message for known errors
      if (err.code === 11000) {
        return NextResponse.json(
          { message: "Duplicate transaction reference" },
          { status: 400, headers: corsHeaders() }
        );
      }
      throw err;
    } finally {
      session.endSession();
    }

    return NextResponse.json({
      message: "Transfer successful",
      data: {
        recipientName: recipient.name,
        amount: Number(amount),
        senderBalance: senderAfter,
        transactionId: debitTx._id,
        reference,
      },
    }, { status: 200, headers: corsHeaders() });

  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
