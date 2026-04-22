import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply.js";
import AIMessageModel from "../../ults/models/AIMessageModel.js";
import { buildSystemPrompt } from "../aiBuild/buildSystemPrompt.js";
import BusinessProfileModel from "../../ults/models/BusinessProfileModel.js";
import { callGroqAI } from "./grok.js";
import { callGeminiAI } from "./gemini.js";
import { callMistralAI } from "./mistral.js";
import UserModel from "../../ults/models/UserModel.js";
import SessionModel from "../../ults/models/SessionModel.js";

export const triggerAIResponse = async ({ session, user, inboundText }) => {
    try {
        // Check if handed off to human — skip AI
        if (session.handoff.isHandedOff) {
            console.log("Session is handed off to human, skipping AI response for session:", session.sessionId);
            return;
        }

        const lockedSession = await SessionModel.findOneAndUpdate(
            { _id: session._id, isProcessingAI: false },
            { isProcessingAI: true },
            { new: true }
        );

        if (!lockedSession) {
            console.log("AI already processing (atomic lock), skipping...");
            return;
        }

        const LIMIT = 30;
        const WARNING_THRESHOLD = 29;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        // ✅ Auto-restore: if 24 hours passed since limit was reached, reset the session
        if (session.limitReachedAt) {
            const timeSinceLimitReached = Date.now() - new Date(session.limitReachedAt).getTime();
            if (timeSinceLimitReached >= TWENTY_FOUR_HOURS) {
                await SessionModel.findByIdAndUpdate(session._id, {
                    limitWarningSent: false,
                    limitReachedSent: false,
                    limitReachedAt: null,
                    "context.inboundCount": 0,
                    "context.outboundCount": 0,
                    "context.messageCount": 0,
                });
                // Refresh session data after reset
                session.context.inboundCount = 0;
                session.limitReachedSent = false;
                session.limitWarningSent = false;
                session.limitReachedAt = null;
                console.log("♻️ Session auto-restored after 24 hours for:", session.sessionId);
            }
        }

        // ⚠️ Warning at threshold
        if (session.context.inboundCount === WARNING_THRESHOLD && !session.limitWarningSent) {
            await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: session.visitorPhone,
                text: "⚠️ You're about to reach the conversation limit. Send your final message 😊"
            });

            await SessionModel.findByIdAndUpdate(session._id, {
                limitWarningSent: true
            });

            return; // stop AI for this turn
        }

        // 🚫 Limit reached — send message ONCE, then silently block
        if (session?.context?.inboundCount >= LIMIT) {
            if (!session.limitReachedSent) {
                await sendWhatsAppAutomationReply({
                    phoneNumberId: user?.whatsapp?.phoneNumberId,
                    to: session?.visitorPhone,
                    text: "🙏 This session has reached its limit. Please try again in 24 hours — I'll be here to help 😊",
                });

                await SessionModel.findByIdAndUpdate(session._id, {
                    limitReachedSent: true,
                    limitReachedAt: new Date(),
                });
            }

            console.log("🚫 Limit reached — blocking AI for session:", session.sessionId);
            return;
        }

        // ✅ Fetch business profile + message history in parallel — they're independent
        const [businessProfile, rawHistory] = await Promise.all([
            BusinessProfileModel.findOne({
                userId: user._id,
                whatsappEnabled: true
            }).lean(),
            AIMessageModel.find({ sessionId: session.sessionId })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
        ]);

        // ✅ Hard stop — no profile or not trained yet
        if (!businessProfile || !businessProfile.aiTrained) {
            console.log(`AI skipped for user ${user._id} — profile not trained yet.`);
            return; // Silent stop, no reply sent
        }

        const businessUrl = businessProfile?.businessUrl || null;

        const systemPrompt = await buildSystemPrompt(businessProfile, businessUrl);
        if (!systemPrompt) {
            console.error("Failed to build system prompt for user:", user._id);
            return;
        }

        // Fetch last N messages for context
        const history = rawHistory; // already fetched above in parallel

        const historyMessages = history.reverse().map(m => ({
            role: m.senderType === "visitor" ? "user" : "assistant",
            content: m.text
        }));

        const trimmedMessages = historyMessages.slice(-6);

        const messages = [
            ...trimmedMessages,
            { role: "user", content: inboundText }
        ];

        //Call Ai's
        const callAI = async () => {
            // Try Groq first
            try {
                const result = await callGroqAI({ systemPrompt, messages });
                if (result) {
                    console.log("✅ Groq responded");
                    return result;
                }
            } catch (err) {
                if (err?.status === 429) {
                    console.warn("⚠️ Groq rate limit — trying Gemini...");
                } else throw err;
            }

            // Try Gemini second
            try {
                const result = await callGeminiAI({ systemPrompt, messages });
                if (result) {
                    console.log("✅ Gemini responded");
                    return result;
                }
            } catch (err) {
                if (err?.status === 429) {
                    console.warn("⚠️ Gemini rate limit — trying Mistral...");
                } else throw err;
            }

            // Try Mistral third
            try {
                const result = await callMistralAI({ systemPrompt, messages });
                if (result) {
                    console.log("✅ Mistral responded");
                    return result;
                }
            } catch (err) {
                if (err?.status === 429) {
                    console.warn("⚠️ Mistral rate limit — all providers exhausted");
                } else throw err;
            }

            return null; // all providers failed
        };

        const aiResponse = await Promise.race([
            callAI(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("AI timeout")), 10000)
            )
        ]);

        // ✅ Guard against null AI response
        if (!aiResponse) {
            console.log("AI returned null, skipping reply for session:", session.sessionId);
            await AIMessageModel.findOneAndUpdate(
                { sessionId: session.sessionId, direction: "inbound", status: "received" },
                { status: "failed" }
            );
            return;
        }

        // Extract plain text from response object
        const fallback = "Sorry, I’m having trouble right now. Please try again later.";

        const aiReply = aiResponse?.text || fallback;

        // Send via WhatsApp
        const response = await sendWhatsAppAutomationReply({
            phoneNumberId: user?.whatsapp?.phoneNumberId,
            to: session?.visitorPhone,
            text: aiReply
        });

        if (!response?.messageId) {
            console.warn("⚠️ No messageId from WhatsApp — possible tracking issue");
        }

        if (response?.error?.code === 190) {
            console.error("🔐 Token expired — reconnect WhatsApp required");
        }

        const status = response?.success ? "sent" : "failed";

        // Save outbound message
        await AIMessageModel.create({
            messageId: response?.messageId || `ai_${Date.now()}`,
            userId: user._id,
            sessionId: session.sessionId,
            platform: "whatsapp",
            phoneNumberId: user.whatsapp.phoneNumberId,
            from: user.whatsapp.displayPhone,
            to: session.visitorPhone,
            text: aiReply,                    // ← plain string ✓
            aiMeta: {
                model: aiResponse?.model,     // ← changed from aiReply?.model
                tokensUsed: aiResponse?.tokensUsed, // ← changed from aiReply?.tokensUsed
            },
            direction: "outbound",
            senderType: "ai",
            status,
            automation: { isAutoReply: true }
        });

        // ✅ Parallelize all post-send DB writes — none block each other
        const contactUpdate = UserModel.updateOne(
            {
                _id: user._id,
                "whatsapp.contacts.list.phone": session?.visitorPhone
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

        const sessionUpdate = SessionModel.findByIdAndUpdate(session._id, {
            lastMessageAt: new Date(),
            $inc: {
                "context.messageCount": 1,
                "context.outboundCount": 1,
                "context.totalTokens": aiResponse?.tokensUsed || 0
            },
            isProcessingAI: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        const [updateResult] = await Promise.all([contactUpdate, sessionUpdate]);

        // Fallback: add contact if it didn't exist yet
        if (updateResult.matchedCount === 0) {
            await UserModel.updateOne(
                { _id: user._id },
                {
                    $push: {
                        "whatsapp.contacts.list": {
                            phone: session?.visitorPhone,
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

        console.log("✅ Session updated");
    } catch (error) {
        console.error("Error in triggerAIResponse:", error);
    } finally {
        await SessionModel.findByIdAndUpdate(session._id, {
            isProcessingAI: false
        });
    }
};
