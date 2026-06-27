import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SessionModel from "@/app/ults/models/SessionModel";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import UserModel from "@/app/ults/models/UserModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    await connectDb();
    const userId = await verifyToken(req);
    const { action, phone, message } = await req.json();

    if (!phone || !action) {
      return NextResponse.json(
        { success: false, message: "phone and action are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const session = await SessionModel.findOne({
      visitorPhone: phone,
      userId,
      status: { $in: ["active", "waiting"] },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "No active session found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // ── Takeover — AI stops, human takes over ──────────────
    if (action === "takeover") {
      await SessionModel.findByIdAndUpdate(session._id, {
        "handoff.isHandedOff": true,
        "handoff.handedOffAt": new Date(),
        "handoff.reason": "manual_takeover",
      });

      return NextResponse.json(
        { success: true, message: "You have taken over this conversation" },
        { status: 200, headers: corsHeaders() }
      );
    }

    // ── Hand back — AI resumes ─────────────────────────────
    if (action === "handback") {
      await SessionModel.findByIdAndUpdate(session._id, {
        "handoff.isHandedOff": false,
        "handoff.handedOffAt": null,
        "handoff.reason": null,
      });

      return NextResponse.json(
        { success: true, message: "AI has resumed this conversation" },
        { status: 200, headers: corsHeaders() }
      );
    }

    // ── Manual reply — admin sends a message ───────────────
    if (action === "reply") {
      if (!message?.trim()) {
        return NextResponse.json(
          { success: false, message: "Message is required" },
          { status: 400, headers: corsHeaders() }
        );
      }

      const user = await UserModel.findById(userId).lean();
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404, headers: corsHeaders() }
        );
      }

      // Send via WhatsApp
      await sendWhatsAppAutomationReply({
        phoneNumberId: user.whatsapp.phoneNumberId,
        to: phone,
        text: message.trim(),
      });

      // Save to DB — senderType "human" so the inbox shows "You" tag
      await AIMessageModel.create({
        messageId: `manual_${Date.now()}`,
        userId,
        sessionId: session.sessionId,
        platform: "whatsapp",
        phoneNumberId: user.whatsapp.phoneNumberId,
        from: user.whatsapp.displayPhone,
        to: phone,
        text: message.trim(),
        direction: "outbound",
        senderType: "human",
        status: "sent",
        automation: { isAutoReply: false },
      });

      // Update session context so the AI has knowledge of this message
      // when the conversation is handed back. The AI reads AIMessageModel
      // directly (recent messages by sessionId) so no extra summary field
      // is needed — but we update the session counters so the AI knows the
      // conversation continued while it was paused.
      await SessionModel.updateOne(
        { _id: session._id },
        {
          $inc: {
            "context.messageCount": 1,
            "context.outboundCount": 1,
          },
          $set: {
            lastMessageAt: new Date(),
          },
        }
      );

      return NextResponse.json(
        { success: true, message: "Message sent" },
        { status: 200, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("InboxHandoffErr:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process action" },
      { status: 500, headers: corsHeaders() }
    );
  }
}