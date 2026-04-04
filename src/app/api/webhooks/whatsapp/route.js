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
import AutomationExecutionModel from "@/app/ults/models/AutomationExecutionModel";

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

// ✅ META WEBHOOK VERIFICATION
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req) {
  const start = Date.now(); // 🟢 define start
  try {
    await connectDb();
    const entry = await req.json();
    console.log("Webhook entry:", JSON.stringify(entry, null, 2));

    const value = entry?.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages) return NextResponse.json({ status: "ignored" });

    const phoneNumberId = value.metadata.phone_number_id;
    const from = value.messages[0].from;
    const userName = value.contacts?.[0]?.profile?.name || "";
    const message = value.messages?.[0];
    if (!message || !message.text?.body) {
      return NextResponse.json({ status: "unsupported_message" });
    }
    const userText = message.text.body;

    if (!userText) return NextResponse.json({ status: "no_text" });

    const paxUser = await UserModel.findOne({ whatsappNumber: from });
    const messageId = `msg_${nanoid()}`;

    await AIMessageModel.create({
      messageId: `system_${messageId}`,
      platform: "whatsapp",
      from,
      to: phoneNumberId,
      text: userText,
      direction: "inbound",
      senderType: paxUser ? "user" : "visitor",
      status: "received",
    });

    if (paxUser) {
      const replyText = await getAIResponse(userText); // could be async-heavy
      const response = await sendWhatsAppReply({
        phoneNumberId,
        to: from,
        text: replyText,
      });

      const responseTime = Date.now() - start; // 🟢 now works

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

      await AutomationExecutionModel.create({
        userId: paxUser._id,
        automationId: "69969159028b1378fbf27fb6",
        channel: "whatsapp",
        input: userText,
        output: replyText,
        status: response ? "success" : "failed",
        responseTime,
      });

      return NextResponse.json({ message: "ok_user" },{status: 200});
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

      console.log("Visitor messages sent in last 24h:", last);

    if (
      visitor.messagesSent >= 1 &&
      last &&
      now - last < TWENTY_FOUR_HOURS
    ) {
      return NextResponse.json({ success:false, message:"visitor_rate_limited" }, { status: 429 });
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

    if(!response) {
      console.error("Failed to send WhatsApp reply to visitor");
      return NextResponse.json({ success:false, message:"failed_to_send_reply" }, { status: 500 });
    }

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


    return NextResponse.json({ message: "ok_visitor" }, {status:200});
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}