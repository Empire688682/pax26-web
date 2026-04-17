import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply.js";
import AIMessageModel from "../../ults/models/AIMessageModel.js";
import { buildSystemPrompt } from "../aiBuild/buildSystemPrompt.js";
import BusinessProfileModel from "../../ults/models/BusinessProfileModel.js";
import { callGroqAI } from "./grok.js";
import { callGeminiAI } from "./gemini.js";
import { callMistralAI } from "./mistral.js";
import UserModel from "../../ults/models/UserModel.js";
import SessionModel from "../../ults/models/SessionModel.js";

import { redis } from "../../ults/redis/redis.js";
import crypto from "crypto";

/* =========================
   REDIS LOCK HELPERS
========================= */

const LOCK_TTL = 15; // seconds

async function acquireLock(sessionId) {
    const token = crypto.randomUUID();
    const key = `lock:session:${sessionId}`;

    const result = await redis.set(key, token, "NX", "EX", LOCK_TTL);

    if (!result) return null;

    return { key, token };
}

async function releaseLock(key, token) {
    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `;

    await redis.eval(script, 1, key, token);
}

/* =========================
   MAIN FUNCTION
========================= */

export const triggerAIResponse = async ({ session, user, inboundText }) => {
    let lock = null;

    try {
        /* =========================
           1. REDIS GLOBAL LOCK
        ========================= */
        lock = await acquireLock(session.sessionId);

        if (!lock) {
            console.log("⚠️ AI already processing (Redis lock active)");
            return;
        }

        /* =========================
           2. HANDOFF CHECK
        ========================= */
        if (session.handoff?.isHandedOff) {
            console.log("Session handed off to human");
            return;
        }

        /* =========================
           3. MESSAGE LIMIT CHECK
        ========================= */
        const LIMIT = 30;
        const WARNING_THRESHOLD = 29;

        if (
            session.context.inboundCount === WARNING_THRESHOLD &&
            !session.limitWarningSent
        ) {
            await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: session.visitorPhone,
                text: "⚠️ You're about to reach the conversation limit. Send your final message 😊"
            });

            await SessionModel.findByIdAndUpdate(session._id, {
                limitWarningSent: true
            });

            return;
        }

        if (session.context.inboundCount >= LIMIT) {
            await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: session.visitorPhone,
                text: "🙏 Session limit reached. Please try again later."
            });

            return;
        }

        /* =========================
           4. BUSINESS PROFILE CHECK
        ========================= */
        const businessProfile = await BusinessProfileModel.findOne({
            userId: user._id,
            whatsappEnabled: true
        }).lean();

        if (!businessProfile || !businessProfile.aiTrained) {
            console.log("AI skipped — business not trained");
            return;
        }

        const systemPrompt = await buildSystemPrompt(
            businessProfile,
            businessProfile?.businessUrl || null
        );

        if (!systemPrompt) return;

        /* =========================
           5. CHAT HISTORY
        ========================= */
        const history = await AIMessageModel.find({
            sessionId: session.sessionId
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const historyMessages = history.reverse().map(m => ({
            role: m.senderType === "visitor" ? "user" : "assistant",
            content: m.text
        }));

        const messages = [
            ...historyMessages.slice(-6),
            { role: "user", content: inboundText }
        ];

        /* =========================
           6. AI FALLBACK CHAIN
        ========================= */
        const callAI = async () => {
            try {
                const r = await callGroqAI({ systemPrompt, messages });
                if (r) return r;
            } catch (e) {
                if (e?.status !== 429) throw e;
            }

            try {
                const r = await callGeminiAI({ systemPrompt, messages });
                if (r) return r;
            } catch (e) {
                if (e?.status !== 429) throw e;
            }

            try {
                const r = await callMistralAI({ systemPrompt, messages });
                if (r) return r;
            } catch (e) {
                if (e?.status !== 429) throw e;
            }

            return null;
        };

        const aiResponse = await Promise.race([
            callAI(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("AI timeout")), 10000)
            )
        ]);

        if (!aiResponse) {
            console.log("AI returned null");
            return;
        }

        const aiReply =
            aiResponse?.text ||
            "Sorry, I’m having trouble right now. Please try again later.";

        /* =========================
           7. SEND WHATSAPP RESPONSE
        ========================= */
        await new Promise(res => setTimeout(res, 1500));

        const response = await sendWhatsAppAutomationReply({
            phoneNumberId: user.whatsapp.phoneNumberId,
            to: session.visitorPhone,
            text: aiReply
        });

        /* =========================
           8. SAVE AI MESSAGE
        ========================= */
        await AIMessageModel.create({
            messageId: response?.messageId || `ai_${Date.now()}`,
            userId: user._id,
            sessionId: session.sessionId,
            platform: "whatsapp",
            phoneNumberId: user.whatsapp.phoneNumberId,
            from: user.whatsapp.displayPhone,
            to: session.visitorPhone,
            text: aiReply,
            aiMeta: {
                model: aiResponse?.model,
                tokensUsed: aiResponse?.tokensUsed
            },
            direction: "outbound",
            senderType: "ai",
            status: response?.success ? "sent" : "failed",
            automation: { isAutoReply: true }
        });

        /* =========================
           9. UPDATE USER CONTACT STATS
        ========================= */
        const updateResult = await UserModel.updateOne(
            {
                _id: user._id,
                "whatsapp.contacts.list.phone": session.visitorPhone
            },
            {
                $inc: {
                    "whatsapp.contacts.list.$.messageCount": 1,
                    "whatsapp.contacts.list.$.outboundCount": 1
                },
                $set: {
                    "whatsapp.contacts.list.$.lastMessageAt": new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            await UserModel.updateOne(
                { _id: user._id },
                {
                    $push: {
                        "whatsapp.contacts.list": {
                            phone: session.visitorPhone,
                            status: "whitelist",
                            messageCount: 1,
                            outboundCount: 1,
                            inboundCount: 0,
                            lastMessageAt: new Date(),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    }
                }
            );
        }

        /* =========================
           10. UPDATE SESSION
        ========================= */
        await SessionModel.updateOne(
            { _id: session._id },
            {
                $inc: {
                    "context.messageCount": 1,
                    "context.outboundCount": 1,
                    "context.totalTokens": aiResponse?.tokensUsed || 0
                },
                $set: {
                    lastMessageAt: new Date(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            }
        );

        console.log("✅ AI response completed");

    } catch (error) {
        console.error("Error in triggerAIResponse:", error);
    } finally {
        /* =========================
           SAFE LOCK RELEASE
        ========================= */
        if (lock) {
            await releaseLock(lock.key, lock.token);
        }
    }
};