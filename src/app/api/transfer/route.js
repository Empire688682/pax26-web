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
    const { accountNumber, amount, pin, recipientName } = await req.json();

    if (!accountNumber || !amount || !pin || !recipientName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400, headers: corsHeaders() });
    }

    if (Number(amount) < 50) {
      return NextResponse.json({ message: "Invalid transfer amount" }, { status: 400, headers: corsHeaders() });
    }

    const userId = await verifyToken(req);

    const sender = await UserModel.findById(userId);
    if (!sender) return NextResponse.json({ message: "Sender not found" }, { status: 404, headers: corsHeaders() });

    const pinMatch = await bcrypt.compare(pin, sender.pin);
    if (!pinMatch) return NextResponse.json({ message: "Invalid transaction PIN" }, { status: 401, headers: corsHeaders() });

    if (sender.walletBalance < amount) {
      return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400, headers: corsHeaders() });
    }

    const number = "0" + accountNumber.trim();
    const recipient = await UserModel.findOne({ number });
    if (!recipient) return NextResponse.json({ message: "Recipient not found on Pax26" }, { status: 404, headers: corsHeaders() });

    if (sender.number === number) {
      return NextResponse.json({ message: "You cannot transfer to yourself" }, { status: 400, headers: corsHeaders() });
    }

    // 🔥 Transfer logic
    sender.walletBalance -= Number(amount);
    recipient.walletBalance += Number(amount);

    const last10Sender = sender.number.slice(-10);
    const last10Recipient = recipient.number.slice(-10);
    const reference = `TRF-${Date.now()}-${sender._id}`;

    // Debit transaction (sender)
    const debitTx = await TransactionModel.create({
      userId: sender._id,
      type: "transfer",
      direction: "debit",
      amount,
      status: "success",
      reference,
      counterparty: { name: recipient.name, number: last10Recipient },
      balanceAfter: sender.walletBalance,
    });

    // Credit transaction (recipient)
    await TransactionModel.create({
      userId: recipient._id,
      type: "transfer",
      direction: "credit",
      amount,
      status: "success",
      reference,
      counterparty: { name: sender.name, number: last10Sender },
      balanceAfter: recipient.walletBalance,
    });

    await sender.save();
    await recipient.save();

    return NextResponse.json({
      message: "Transfer successful",
      data: {
        recipientName: recipient.name,
        amount,
        senderBalance: sender.walletBalance,
        transactionId: debitTx._id,
        reference,
      },
    }, { status: 200, headers: corsHeaders() });

  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}
