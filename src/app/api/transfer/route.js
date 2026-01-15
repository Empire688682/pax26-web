import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../helper/VerifyToken";

/**
 * Dummy Pax26 users (simulate DB)
 */
const users = [
  {
    id: "user_123",
    name: "Juwon Asehinde",
    accountNumber: "9999999999",
    wallet: 25000,
    pin: "1234",
  },
  {
    id: "user_456",
    name: "John Doe",
    accountNumber: "1111111111",
    wallet: 10000,
    pin: "4321",
  },
];

export async function POST(req) {
    await connectDb();
  try {
    const body = await req.json();
    const { senderId, recipientAccountNumber, amount, pin } = body;

    // 1️⃣ Basic validation
    if (!senderId || !recipientAccountNumber || !amount || !pin) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: "Invalid transfer amount" },
        { status: 400 }
      );
    }

     const userId = await verifyToken(req);

     if(!sender){
        
      return NextResponse.json(
        { message: "Sender not found" },
        { status: 404 }
      );
     }

    // 2️⃣ Find sender
    const sender = await UserModel.findById(userId);
    if (!sender) {
      return NextResponse.json(
        { message: "Sender not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Verify PIN
    if (sender.pin !== pin) {
      return NextResponse.json(
        { message: "Invalid transaction PIN" },
        { status: 401 }
      );
    }

    // 4️⃣ Check wallet balance
    if (sender.wallet < amount) {
      return NextResponse.json(
        { message: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // 5️⃣ Find recipient
    const recipient = users.find(
      (u) => u.accountNumber === recipientAccountNumber
    );

    if (!recipient) {
      return NextResponse.json(
        { message: "Recipient not found on Pax26" },
        { status: 404 }
      );
    }

    // 6️⃣ Prevent self-transfer
    if (sender.accountNumber === recipientAccountNumber) {
      return NextResponse.json(
        { message: "You cannot transfer to yourself" },
        { status: 400 }
      );
    }

    // 7️⃣ Perform transfer
    sender.wallet -= amount;
    recipient.wallet += amount;

    // 8️⃣ Success response
    return NextResponse.json(
      {
        message: "Transfer successful",
        data: {
          recipientName: recipient.name,
          amount,
          senderBalance: sender.wallet,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
