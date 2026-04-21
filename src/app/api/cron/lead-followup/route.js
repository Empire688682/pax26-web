// src/app/api/cron/lead-followup/route.js
//
// Called every hour by Vercel Cron (or any external scheduler).
// Finds conversations that:
//   • belong to a user with "follow_up" automation enabled
//   • had the last message > 24 hours ago
//   • the last message was outbound (AI spoke last, lead went silent)
//   • a follow-up has NOT already been sent in this silence window
// Then sends an AI-generated follow-up WhatsApp message.

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import SessionModel from "@/app/ults/models/SessionModel";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import UserModel from "@/app/ults/models/UserModel";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import BusinessProfileModel from "@/app/ults/models/BusinessProfileModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";
import { callGroqAI } from "@/app/lib/aiService/grok";
import { callGeminiAI } from "@/app/lib/aiService/gemini";
import { callMistralAI } from "@/app/lib/aiService/mistral";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // ms

// ── Security check ─────────────────────────────────────────────
function isAuthorized(req) {
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // env var must be set
  return authHeader === `Bearer ${secret}`;
}

// ── Build a warm AI follow-up message ─────────────────────────
async function buildFollowUpMessage(businessProfile, lastAiMessage) {
  const businessName = businessProfile?.businessName || "our team";
  const tone = businessProfile?.tone || "friendly";

  const systemPrompt = `You are a ${tone} follow-up assistant for "${businessName}". 
Your job is to send a short, warm follow-up WhatsApp message to a potential customer who hasn't replied in over 24 hours.
Keep it brief (1–2 sentences), human, and non-pushy. Don't repeat the previous message verbatim. 
End with an open question or a gentle nudge. Use plain text — no markdown.`;

  const messages = [
    {
      role: "user",
      content: `The last thing our AI said to this customer was: "${lastAiMessage}". 
Write a short follow-up message to re-engage them since they haven't replied.`,
    },
  ];

  // Try AI providers in order (same cascade as triggerAIResponse)
  try {
    const result = await callGroqAI({ systemPrompt, messages });
    if (result?.text) return result.text;
  } catch (err) {
    if (err?.status !== 429) console.error("Groq error in follow-up:", err?.message);
  }

  try {
    const result = await callGeminiAI({ systemPrompt, messages });
    if (result?.text) return result.text;
  } catch (err) {
    if (err?.status !== 429) console.error("Gemini error in follow-up:", err?.message);
  }

  try {
    const result = await callMistralAI({ systemPrompt, messages });
    if (result?.text) return result.text;
  } catch (err) {
    if (err?.status !== 429) console.error("Mistral error in follow-up:", err?.message);
  }

  // Fallback template if all AI providers fail
  return `Hey! 👋 Just checking in — we'd love to help if you have any questions. Feel free to reply anytime 😊`;
}

// ── Main handler ───────────────────────────────────────────────
export async function GET(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDb();

  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS);
  let totalSent = 0;
  let totalChecked = 0;
  const errors = [];

  try {
    // Step 1 — Find all users who have "follow_up" automation enabled
    const userAutomations = await UserAutomationModel.find({
      "automations": {
        $elemMatch: {
          type: "follow_up",
          enabled: true,
        },
      },
    }).lean();

    if (!userAutomations.length) {
      return NextResponse.json({
        success: true,
        message: "No users have follow_up automation enabled",
        sent: 0,
      });
    }

    const userIds = userAutomations.map((ua) => ua.userId);

    // Step 2 — Find eligible sessions across all those users
    // Conditions: active/waiting, lastMessageAt > 24h ago, followUp.sent = false
    const sessions = await SessionModel.find({
      userId: { $in: userIds },
      status: { $in: ["active", "waiting"] },
      lastMessageAt: { $lt: cutoff },
      "followUp.sent": { $ne: true },
    }).lean();

    totalChecked = sessions.length;
    console.log(`[lead-followup] Found ${sessions.length} eligible session(s)`);

    // Step 3 — Process each session
    for (const session of sessions) {
      try {
        // 3a. Check the very last message in this session — must be outbound (AI spoke last)
        const lastMsg = await AIMessageModel.findOne({ sessionId: session.sessionId })
          .sort({ createdAt: -1 })
          .lean();

        if (!lastMsg) continue;
        if (lastMsg.direction !== "outbound") {
          // Visitor spoke last — not eligible for follow-up (they're waiting for our reply)
          continue;
        }

        // 3b. Load user and their business profile
        const user = await UserModel.findById(session.userId).lean();
        if (!user) continue;
        if (!user.whatsapp?.connected || !user.whatsapp?.phoneNumberId) continue;

        const businessProfile = await BusinessProfileModel.findOne({
          userId: session.userId,
          whatsappEnabled: true,
          aiTrained: true,
        }).lean();

        if (!businessProfile) continue; // AI not trained — skip

        // 3c. Generate follow-up message
        const followUpText = await buildFollowUpMessage(businessProfile, lastMsg.text);

        // 3d. Send via WhatsApp
        const response = await sendWhatsAppAutomationReply({
          phoneNumberId: user.whatsapp.phoneNumberId,
          to: session.visitorPhone,
          text: followUpText,
        });

        const msgStatus = response?.success ? "sent" : "failed";

        // 3e. Save the outbound follow-up message
        await AIMessageModel.create({
          messageId: response?.messageId || `followup_${Date.now()}_${session.sessionId}`,
          userId: session.userId,
          sessionId: session.sessionId,
          platform: "whatsapp",
          phoneNumberId: user.whatsapp.phoneNumberId,
          from: user.whatsapp.displayPhone || user.whatsapp.phoneNumberId,
          to: session.visitorPhone,
          text: followUpText,
          direction: "outbound",
          senderType: "ai",
          status: msgStatus,
          automation: {
            isAutoReply: true,
            workflowId: "lead_followup",
          },
        });

        // 3f. Mark session — follow-up sent, increment counter
        await SessionModel.updateOne(
          { _id: session._id },
          {
            $set: {
              "followUp.sent": true,
              "followUp.sentAt": new Date(),
            },
            $inc: { "followUp.totalSent": 1 },
          }
        );

        if (response?.success) {
          totalSent++;
          console.log(`[lead-followup] ✅ Sent follow-up to ${session.visitorPhone} (session: ${session.sessionId})`);
        } else {
          console.warn(`[lead-followup] ⚠️ WhatsApp delivery failed for ${session.visitorPhone}`);
        }
      } catch (sessionErr) {
        console.error(`[lead-followup] ❌ Error processing session ${session.sessionId}:`, sessionErr?.message);
        errors.push({ sessionId: session.sessionId, error: sessionErr?.message });
      }
    }

    return NextResponse.json({
      success: true,
      checked: totalChecked,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[lead-followup] Fatal error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
