import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../helper/VerifyToken";
import bcrypt from "bcryptjs";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import TransactionModel from "@/app/ults/models/TransactionModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
}


export async function POST(req) {
  await connectDb();
  try {
    const body = await req.json();
    const { accountNumber, amount, pin, recipientName } = body;

    // 1️⃣ Basic validation
    if (!accountNumber || !amount || !pin || !recipientName) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (amount < 50) {
      return NextResponse.json(
        { message: `Invalid transfer amount: ${amount}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    const userId = await verifyToken(req);

    // 2️⃣ Find sender
    const sender = await UserModel.findById(userId);
    if (!sender) {
      return NextResponse.json(
        { message: "Sender not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 3️⃣ Verify PIN
    const pinMatch = await bcrypt.compare(pin, sender.pin);
    if (!pinMatch) {
      return NextResponse.json(
        { message: "Invalid transaction PIN" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // 4️⃣ Check walletBalance balance
    if (sender.walletBalance < amount) {
      return NextResponse.json(
        { message: "Insufficient walletBalance balance" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 5️⃣ Find recipient
    const number = "0" + accountNumber.trim();
    const recipient = await UserModel.findOne({ number})

    if (!recipient) {
      return NextResponse.json(
        { message: "Recipient not found on Pax26" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 6️⃣ Prevent self-transfer
    if (sender.number === number) {
      return NextResponse.json(
        { message: "You cannot transfer to yourself" },
        { status: 400, headers: corsHeaders() }
      );
    }

  // 7️⃣ Perform transfer
sender.walletBalance -= amount;
recipient.walletBalance += amount;

// Number converter
    const last10SenderNumber = sender.number.slice(-10);
    const last10RecipientNumber = recipient.number.slice(-10);

const transaction = await TransactionModel.create({
  userId: sender._id,
  type: "transfer",
  amount,
  status: "success",
  transactionId: sender._id + Date.now().toLocaleString(),
  reference: Date.now().toLocaleString() + amount,
  metadata: {
    platform: "Pax26",
    number: sender?.number,
    recipientName: recipientName,
    recipientNumber: last10RecipientNumber,
    senderName: sender.name,
    senderNumber: last10SenderNumber,
  }
});

await sender.save();
await recipient.save();


    // 8️⃣ Success response
    return NextResponse.json(
      {
        message: "Transfer successful",
        data: {
          recipientName: recipient.name,
          amount,
          senderBalance: sender.walletBalance,
          transactionId: transaction._id,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
