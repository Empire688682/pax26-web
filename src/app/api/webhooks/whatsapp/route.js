// app/api/webhooks/whatsapp/route.js
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import UserModel from "@/app/ults/models/UserModel";
import WhatsAppVisitorsModel from "@/app/ults/models/WhatsAppVisitorsModel";
import { nanoid } from "nanoid";
import { getAIResponse } from "../../helper/PaxAI";
import { sendWhatsAppReply } from "../../helper/ReplyWhatsappMessage";
import { mockVisitorReply } from "../../helper/mockVisitorReply";

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export async function POST(req) {
  try {
    await connectDb();
    const entry = await req.json();

    const value = entry?.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages) {
      return NextResponse.json({ status: "ignored" });
    }

    console.log("Webhook value: ", value);

    const phoneNumberId = value.metadata.phone_number_id;
    const from = value.messages[0].from;
    const userText = value.messages[0].text?.body;
    const userName = value.contacts?.[0]?.profile?.name || "";

    if (!userText) {
      return NextResponse.json({ status: "no_text" });
    }

    // 🔹 Check if registered user
    const paxUser = await UserModel.findOne({ whatsappNumber: from });

    const messageId = `msg_${nanoid()}`;

    // 🔹 Save inbound message
    await AIMessageModel.create({
      messageId:`system_${messageId}`,
      platform: "whatsapp",
      from,
      to: phoneNumberId,
      text: userText,
      direction: "inbound",
      senderType: paxUser ? "user" : "visitor",
      status: "received",
    });

    // =========================
    // ✅ REGISTERED USER FLOW
    // =========================
    if (paxUser) {
      const replyText = await getAIResponse(userText);

      const response = await sendWhatsAppReply({
        phoneNumberId,
        to: from,
        text: replyText,
      });

      await AIMessageModel.create({
        messageId: `user_${messageId}`,
        userId: paxUser._id,
        platform: "whatsapp",
        from: phoneNumberId,
        to: from,
        text: replyText,
        direction: "outbound",
        senderType: "ai",
        status: response ? "sent" : "failed",
      });

      return NextResponse.json({ status: "ok_user" });
    }

    // =========================
    // 🚶 VISITOR FLOW
    // =========================
    let visitor = await WhatsAppVisitorsModel.findOne({ number: from });
    const now = Date.now();

    if (!visitor) {
      visitor = await WhatsAppVisitorsModel.create({
        number: from,
        lastTimeMessage: new Date(),
      });
    }

    const last = visitor.lastTimeMessage
      ? new Date(visitor.lastTimeMessage).getTime()
      : 0;

    if (
      visitor.messagesSent >= 1 &&
      last &&
      now - last < TWENTY_FOUR_HOURS
    ) {
      return NextResponse.json({ status: "visitor_rate_limited" });
    }

    // 🔓 Reset after 24 hours
    if (last && now - last >= TWENTY_FOUR_HOURS) {
      visitor.messagesSent = 0;
    }


    // 🔹 Send mock reply
    const replyText = mockVisitorReply(userText, userName);

    const response = await sendWhatsAppReply({
      phoneNumberId,
      to: from,
      text: replyText,
    });

    await AIMessageModel.create({
      messageId: `visitor_${messageId}`,
      platform: "whatsapp",
      from: phoneNumberId,
      to: from,
      text: replyText,
      direction: "outbound",
      senderType: "system",
      status: response ? "sent" : "failed",
    });

    visitor.lastTimeMessage = new Date();
    visitor.messagesSent += 1;
    await visitor.save();


    return NextResponse.json({ status: "ok_visitor" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
