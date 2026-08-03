// src/app/api/cron/lead-followup/route.js
//
// Called every hour by Upstash QStash (POST request with signature).
// Also accepts a manual GET request with a Bearer CRON_SECRET for testing.
//
// Finds conversations where:
//   • user has paxAI.trained = true + whatsapp connected
//   • business profile has followUpEnabled = true
//   • last message was outbound (AI spoke last, customer went quiet)
//   • silence duration exceeds followUpDelayMinutes (default 30 min)
//   • followUp.sent = false for this silence window

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";
import { callGroqAI } from "@/app/lib/aiService/grok";
import { callGeminiAI } from "@/app/lib/aiService/gemini";
import { callMistralAI } from "@/app/lib/aiService/mistral";

// ── Auth: QStash signature OR manual Bearer token ─────────────
// Receiver is imported dynamically to avoid webpack bundling Node-only crypto APIs
async function isAuthorized(req, rawBody) {
  const signature = req.headers.get("upstash-signature");
  if (signature && process.env.QSTASH_CURRENT_SIGNING_KEY) {
    try {
      const { Receiver } = await import("@upstash/qstash");
      const receiver = new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
      });
      const isValid = await receiver.verify({ signature, body: rawBody });
      if (isValid) return true;
    } catch { /* fall through to Bearer check */ }
  }
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader === `Bearer ${secret}`) return true;
  return false;
}

// ── Load business profile (seller or service) ─────────────────
async function loadBusinessProfile(userId, businessType) {
  if (businessType === "seller") {
    return SellerProfileModel.findOne({ userId, isActive: true }).lean();
  }
  if (businessType === "service") {
    return ServiceProfileModel.findOne({ userId, aiTrained: true }).lean();
  }
  return null;
}

// ── Build AI follow-up message ────────────────────────────────
async function buildFollowUpMessage(businessProfile, lastAiMessage) {
  const businessName = businessProfile?.businessName || "our team";
  const tone = businessProfile?.tone || "friendly";

  const systemPrompt = `You are a ${tone} follow-up assistant for "${businessName}". 
Send a short, warm WhatsApp follow-up to a customer who went quiet.
Keep it brief (1–2 sentences), human, non-pushy. End with an open question or gentle nudge.
Use plain text only — no markdown, no asterisks, no emojis.`;

  const messages = [{
    role: "user",
    content: `Last AI message to customer: "${lastAiMessage}". Write a short follow-up to re-engage them.`,
  }];

  try {
    const r = await callGroqAI({ systemPrompt, messages });
    if (r?.text) return r.text;
  } catch (err) { if (err?.status !== 429) console.error("Groq follow-up error:", err?.message); }

  try {
    const r = await callGeminiAI({ systemPrompt, messages });
    if (r?.text) return r.text;
  } catch (err) { if (err?.status !== 429) console.error("Gemini follow-up error:", err?.message); }

  try {
    const r = await callMistralAI({ systemPrompt, messages });
    if (r?.text) return r.text;
  } catch (err) { if (err?.status !== 429) console.error("Mistral follow-up error:", err?.message); }

  return `Hey! Just checking in — we'd love to help if you have any questions. Feel free to reply anytime.`;
}

// ── Main runner ───────────────────────────────────────────────
async function runFollowUp() {
  await connectDb();

  let totalSent = 0;
  let totalChecked = 0;
  const errors = [];

  try {
    // Find all trained, connected users
    const users = await UserModel.find({
      "paxAI.trained": true,
      "paxAI.enabled": true,
      "whatsapp.connected": true,
      "whatsapp.phoneNumberId": { $exists: true, $ne: "" },
    }).select("_id paxAI whatsapp").lean();

    if (!users.length) {
      return NextResponse.json({ success: true, message: "No eligible users", sent: 0 });
    }

    console.log(`[lead-followup] Checking ${users.length} trained user(s)`);

    for (const user of users) {
      try {
        const businessProfile = await loadBusinessProfile(user._id, user.paxAI?.businessType);
        if (!businessProfile) continue;
        if (businessProfile.followUpEnabled === false) continue;

        // Respect per-seller delay setting
        const delayMs = (businessProfile.followUpDelayMinutes || 30) * 60 * 1000;
        const cutoff = new Date(Date.now() - delayMs);

        const sessions = await SessionModel.find({
          userId: user._id,
          status: { $in: ["active", "waiting"] },
          lastMessageAt: { $lt: cutoff },
          "followUp.sent": { $ne: true },
        }).lean();

        totalChecked += sessions.length;

        for (const session of sessions) {
          try {
            const lastMsg = await AIMessageModel.findOne({ sessionId: session.sessionId })
              .sort({ createdAt: -1 })
              .lean();

            // Only follow up if AI spoke last (customer went quiet)
            if (!lastMsg || lastMsg.direction !== "outbound") continue;

            const followUpText = await buildFollowUpMessage(businessProfile, lastMsg.text);

            const response = await sendWhatsAppAutomationReply({
              phoneNumberId: user.whatsapp.phoneNumberId,
              to: session.visitorPhone,
              text: followUpText,
            });

            const msgStatus = response?.success ? "sent" : "failed";

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
              automation: { isAutoReply: true, workflowId: "lead_followup" },
            });

            await SessionModel.updateOne(
              { _id: session._id },
              {
                $set: { "followUp.sent": true, "followUp.sentAt": new Date() },
                $inc: { "followUp.totalSent": 1 },
              }
            );

            if (response?.success) {
              totalSent++;
              await UserModel.updateOne(
                { _id: session.userId },
                { $inc: { "paxAI.messagesUsedThisMonth": 1, "planAnalytics.aiMessagesUsed": 1, "planAnalytics.metaCost": 5 } }
              );
              console.log(`[lead-followup] ✅ Sent to ${session.visitorPhone} after ${businessProfile.followUpDelayMinutes}min`);
            } else {
              console.warn(`[lead-followup] ⚠️ Delivery failed for ${session.visitorPhone}`);
            }
          } catch (sessionErr) {
            console.error(`[lead-followup] ❌ Session ${session.sessionId}:`, sessionErr?.message);
            errors.push({ sessionId: session.sessionId, error: sessionErr?.message });
          }
        }
      } catch (userErr) {
        console.error(`[lead-followup] ❌ User ${user._id}:`, userErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      checked: totalChecked,
      sent: totalSent,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error("[lead-followup] Fatal error:", err);
    return NextResponse.json({ success: false, message: "Internal server error", error: err.message }, { status: 500 });
  }
}

// ── POST — called by Upstash QStash ──────────────────────────
export async function POST(req) {
  const rawBody = await req.text();
  const authorized = await isAuthorized(req, rawBody);
  if (!authorized) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return runFollowUp();
}

// ── GET — manual trigger for testing ─────────────────────────
export async function GET(req) {
  const authorized = await isAuthorized(req, "");
  if (!authorized) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return runFollowUp();
}
