import { connectDb } from "@/app/ults/db/ConnectDb";
import EmailSubscriber from "@/app/ults/models/EmailSubscriber";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { sendPasswordResettingEmail } from "../helper/sendPasswordResetting";

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400, headers:corsHeaders() });
    }

    await connectDb();

    const existing = await EmailSubscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "You're already subscribed!" }, { status: 200, headers:corsHeaders() });
    }

    const newSubscriber = new EmailSubscriber({ email });
    await newSubscriber.save();

     const sendingStatus = await sendPasswordResettingEmail(email, "", "EmailSubscriber");
        if (sendingStatus.status === 500) {
          return NextResponse.json(
            { success: false, message: "An error occured" },
            { status: 400, headers:corsHeaders() },
          );
        }

    return NextResponse.json({ message: "Successfully subscribed!" }, { status: 201, headers:corsHeaders() });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ message: "Server error. Please try again later." }, { status: 500, headers:corsHeaders() });
  }
}