import { NextResponse } from "next/server";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { nanoid } from "nanoid";
import { getAIResponse } from "../../helper/PaxAI";
import { sendWhatsAppReply } from "../../helper/ReplyWhatsappMessage";

export async function POST(req) {
  try {
    await connectDb();

    const entry = await req.json();
    const change = entry.entry?.[0]?.changes?.[0];
    const value = change?.value;

    if (!value?.messages) {
      return NextResponse.json({ status: "ignored" });
    }

    const phoneNumberId = value.metadata.phone_number_id;
    const phoneNumber = value.contacts[0].wa_id;;
    const from = value.messages[0].from;
    const userText = value.messages[0].text?.body;

    if (!userText) {
      return NextResponse.json({ status: "no_text" });
    }

    const paxUser = await UserModel.findOne({ whatsappNumber: phoneNumber });
    
    if (!paxUser) {
      return NextResponse.json({ status: "user_not_found" });
    }

   const inboundMessageId = `msg_${nanoid()}`;

    // 1️⃣ Save inbound message
    await AIMessageModel.create({
      messageId: inboundMessageId,
      userId: paxUser._id,
      platform: "whatsapp",
      phoneNumberId,
      from,
      to: phoneNumberId,
      text: userText,
      direction: "inbound",
      senderType: "user",
      status: "received"
    });

    // 2️⃣ Generate AI reply
    const replyText = await getAIResponse(userText);

    // 3️⃣ Send WhatsApp reply
    const response = await sendWhatsAppReply({
      phoneNumberId,
      to: from,
      text: replyText
    });

    // 4️⃣ Save outbound message
    await AIMessageModel.create({
      messageId: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: paxUser._id,
      platform: "whatsapp",
      phoneNumber,
      to: from,
      from:phoneNumberId,
      text: replyText,
      direction: "outbound",
      senderType: "ai",
      status: response ? "sent" : "failed",
      automation: {
        isAutoReply: true
      }
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
