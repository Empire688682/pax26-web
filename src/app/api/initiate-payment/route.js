import { NextResponse } from "next/server";
import axios from "axios";
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
    const { amount, email, name, mobileUserId } = body;

    if (!amount || !email || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers:corsHeaders() });
    }

    const userId = mobileUserId || await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers:corsHeaders() });
    }

    const tx_ref = `tx-${Date.now()}`;

    const flutterwavePayload = {
      tx_ref,
      amount,
      currency: "NGN",
      redirect_url: process.env.REDIRECT_URL,
      payment_options: "card,banktransfer,ussd",
      customer: { email, name },
      customizations: {
        title: "Monetrax Wallet Top-Up",
        logo: "https://Monetrax.vercel.app/favicon.ico",
      },
    };

    const response = await axios.post("https://api.flutterwave.com/v3/payments", flutterwavePayload, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const checkoutLink = response.data?.data?.link;

    await PaymentModel.create({
      userId,
      amount,
      currency: "NGN",
      reference: tx_ref,
      status: mobileUserId? "success" : "PENDING",
      paymentMethod: "FLUTTERWAVE",
      checkoutLink,
      initResponse: {
        status: response.data.status,
        message: response.data.message
      },
    });

    return NextResponse.json({success:true, link: checkoutLink }, { status: 200, headers:corsHeaders() });
  } catch (error) {
    console.error("Flutterwave error:", error?.response?.data || error.message);
    return NextResponse.json(
      { message: "Failed to initiate payment", error: error.message },
      { status: 500, headers:corsHeaders() }
    );
  }
}
