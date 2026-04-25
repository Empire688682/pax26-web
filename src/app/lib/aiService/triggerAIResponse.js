import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply.js";
import { sendWhatsAppImageReply } from "../../api/helper/WhatsAppImageReply.js";
import AIMessageModel from "../../ults/models/AIMessageModel.js";
import { buildSystemPrompt } from "../aiBuild/buildSystemPrompt.js";
import GeneralBusinessProfileModel from "../../ults/models/GeneralBusinessProfileModel.js";
import SellerProfile from "../../ults/models/SellerProfile.js";
import SellerProduct from "../../ults/models/SellerProduct.js";
import { callGroqAI } from "./grok.js";
import { callGeminiAI } from "./gemini.js";
import { callMistralAI } from "./mistral.js";
import UserModel from "../../ults/models/UserModel.js";
import SessionModel from "../../ults/models/SessionModel.js";

// ─────────────────────────────────────────────────────────────
// Parse [SEND_IMAGE: url] tags out of the AI reply.
// Returns the image URLs and the clean text separately.
// ─────────────────────────────────────────────────────────────
function extractImageTags(text) {
    const imageRegex = /\[SEND_IMAGE:\s*(https?:\/\/[^\]]+)\]/g;
    const imageUrls = [];

    const cleanText = text
        .replace(imageRegex, (_, url) => {
            imageUrls.push(url.trim());
            return "";
        })
        .replace(/\n{3,}/g, "\n\n") // collapse triple+ newlines left by removed tags
        .trim();

    return { imageUrls, cleanText };
}

// ─────────────────────────────────────────────────────────────
// Load the right profile depending on whether the user is a
// seller or a general business (consultant, marketer, etc.)
//
// Returns: { businessProfile, profileType, products, businessUrl }
// ─────────────────────────────────────────────────────────────
async function loadProfileAndProducts(userId) {
    // Check for seller profile first — seller takes priority
    const sellerProfile = await SellerProfile.findOne({
        userId,
        isActive: true,
    }).lean();

    if (sellerProfile) {
        // Load available products in parallel with nothing else needed
        const products = await SellerProduct.find({
            sellerId: sellerProfile._id,
            isAvailable: true,
        }).lean();

        return {
            businessProfile: sellerProfile,
            profileType: "seller",
            products,
            businessUrl: sellerProfile.businessUrl || null,
            // Seller profiles don't have aiTrained flag — presence of profile is enough
            isTrained: true,
        };
    }

    // Fall back to general business profile
    const generalProfile = await GeneralBusinessProfileModel.findOne({
        userId,
        whatsappEnabled: true,
    }).lean();

    return {
        businessProfile: generalProfile,
        profileType: "general",
        products: [],
        businessUrl: generalProfile?.businessUrl || null,
        isTrained: generalProfile?.aiTrained === true,
    };
}

// ─────────────────────────────────────────────────────────────
// Send images first, then text — order matters on WhatsApp
// Images appear above the text message in the chat thread
// ─────────────────────────────────────────────────────────────
async function sendReply({ phoneNumberId, to, imageUrls, cleanText }) {
    // Send each image (max 3 — already enforced in buildImageMatchContext)
    for (const url of imageUrls.slice(0, 3)) {
        try {
            await sendWhatsAppImageReply({ phoneNumberId, to, imageUrl: url });
            console.log("🖼️  Image sent:", url.slice(0, 60) + "...");
        } catch (err) {
            // Non-fatal — log and continue to next image / text
            console.warn("⚠️  Failed to send image:", err.message);
        }
    }

    // Send text reply (always, even if images failed)
    if (cleanText) {
        return sendWhatsAppAutomationReply({ phoneNumberId, to, text: cleanText });
    }

    return { success: true, messageId: null };
}

// ─────────────────────────────────────────────────────────────
// Main trigger
// ─────────────────────────────────────────────────────────────
export const triggerAIResponse = async ({
    session,
    user,
    inboundText,
    imageSearchContext = false, // true when called from the image search branch
}) => {
    try {
        // ── Guard: handed off to human ────────────────────────────
        if (session.handoff.isHandedOff) {
            console.log("Session handed off — skipping AI for:", session.sessionId);
            return;
        }

        // ── Atomic lock: prevent double-processing ────────────────
        const lockedSession = await SessionModel.findOneAndUpdate(
            { _id: session._id, isProcessingAI: false },
            { isProcessingAI: true },
            { new: true }
        );

        if (!lockedSession) {
            console.log("AI already processing (atomic lock) — skipping...");
            return;
        }

        const LIMIT = 30;
        const WARNING_THRESHOLD = 29;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        // ── Auto-restore session after 24h ────────────────────────
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
                session.context.inboundCount = 0;
                session.limitReachedSent = false;
                session.limitWarningSent = false;
                session.limitReachedAt = null;
                console.log("♻️ Session auto-restored for:", session.sessionId);
            }
        }

        // ── Warning at threshold ──────────────────────────────────
        if (session.context.inboundCount === WARNING_THRESHOLD && !session.limitWarningSent) {
            await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: session.visitorPhone,
                text: "⚠️ You're about to reach the conversation limit. Send your final message 😊",
            });
            await SessionModel.findByIdAndUpdate(session._id, { limitWarningSent: true });
            return;
        }

        // ── Limit reached ─────────────────────────────────────────
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
            console.log("🚫 Limit reached — blocking AI for:", session.sessionId);
            return;
        }

        // ── Load profile (seller or general) + message history ────
        // These are independent — run in parallel
        const [profileData, rawHistory] = await Promise.all([
            loadProfileAndProducts(user._id),
            AIMessageModel.find({ sessionId: session.sessionId })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
        ]);

        const { businessProfile, profileType, products, businessUrl, isTrained } = profileData;

        // ── Hard stop: no profile or not trained ──────────────────
        if (!businessProfile) {
            console.log(`No business profile found for user ${user._id} — skipping AI`);
            return;
        }

        if (!isTrained) {
            console.log(`AI skipped for user ${user._id} — profile not trained yet`);
            return;
        }

        // ── Build system prompt (type-aware) ──────────────────────
        const systemPrompt = await buildSystemPrompt(
            businessProfile,
            businessUrl,
            profileType,   // "seller" | "general"
            products       // [] for general profiles
        );

        if (!systemPrompt) {
            console.error("Failed to build system prompt for user:", user._id);
            return;
        }

        // ── Build conversation history ────────────────────────────
        const historyMessages = rawHistory.reverse().map((m) => ({
            role: m.senderType === "visitor" ? "user" : "assistant",
            // For image context messages stored as placeholders, use a neutral label
            content: m.text || "[image]",
        }));

        const trimmedMessages = historyMessages.slice(-6);

        // When imageSearchContext is true, inboundText already contains the
        // [SYSTEM: ...] block from buildImageMatchContext / buildImageNoMatchContext.
        // We pass it as the user turn so the AI has the real match data.
        const messages = [
            ...trimmedMessages,
            { role: "user", content: inboundText },
        ];

        // ── Call AI providers with fallback chain ─────────────────
        const callAI = async () => {
            try {
                const result = await callGroqAI({ systemPrompt, messages });
                if (result) { console.log("✅ Groq responded"); return result; }
            } catch (err) {
                if (err?.status === 429) console.warn("⚠️ Groq rate limit — trying Gemini...");
                else throw err;
            }

            try {
                const result = await callGeminiAI({ systemPrompt, messages });
                if (result) { console.log("✅ Gemini responded"); return result; }
            } catch (err) {
                if (err?.status === 429) console.warn("⚠️ Gemini rate limit — trying Mistral...");
                else throw err;
            }

            try {
                const result = await callMistralAI({ systemPrompt, messages });
                if (result) { console.log("✅ Mistral responded"); return result; }
            } catch (err) {
                if (err?.status === 429) console.warn("⚠️ Mistral rate limit — all providers exhausted");
                else throw err;
            }

            return null;
        };

        const aiResponse = await Promise.race([
            callAI(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("AI timeout")), 10000)
            ),
        ]);

        // ── Guard: null AI response ───────────────────────────────
        if (!aiResponse) {
            console.log("AI returned null — skipping reply for:", session.sessionId);
            await AIMessageModel.findOneAndUpdate(
                { sessionId: session.sessionId, direction: "inbound", status: "received" },
                { status: "failed" }
            );
            return;
        }

        const fallback = "Sorry, I'm having trouble right now. Please try again later.";
        const rawAiText = aiResponse?.text || fallback;

        // ── Parse image tags out of the AI reply ──────────────────
        // Seller AI may embed [SEND_IMAGE: url] tags — strip them
        // and send them as actual WhatsApp image messages first
        const { imageUrls, cleanText } = extractImageTags(rawAiText);

        if (imageUrls.length > 0) {
            console.log(`🖼️  AI included ${imageUrls.length} image(s) — sending before text`);
        }

        // ── Send: images first, then text ─────────────────────────
        const response = await sendReply({
            phoneNumberId: user?.whatsapp?.phoneNumberId,
            to: session?.visitorPhone,
            imageUrls,
            cleanText,
        });

        if (!response?.messageId) {
            console.warn("⚠️ No messageId from WhatsApp — possible tracking issue");
        }

        if (response?.error?.code === 190) {
            console.error("🔐 Token expired — reconnect WhatsApp required");
        }

        const status = response?.success ? "sent" : "failed";

        // ── Save outbound message ─────────────────────────────────
        // Store the clean text (no tags) — what the customer actually received
        await AIMessageModel.create({
            messageId: response?.messageId || `ai_${Date.now()}`,
            userId: user._id,
            sessionId: session.sessionId,
            platform: "whatsapp",
            phoneNumberId: user.whatsapp.phoneNumberId,
            from: user.whatsapp.displayPhone,
            to: session.visitorPhone,
            text: cleanText || rawAiText,
            aiMeta: {
                model: aiResponse?.model,
                tokensUsed: aiResponse?.tokensUsed,
                imagesSent: imageUrls.length,        // track how many images were sent
                wasImageSearch: imageSearchContext,  // flag for analytics
            },
            direction: "outbound",
            senderType: "ai",
            status,
            automation: { isAutoReply: true },
        });

        // ── Parallelise all post-send DB writes ───────────────────
        const contactUpdate = UserModel.updateOne(
            { _id: user._id, "whatsapp.contacts.list.phone": session?.visitorPhone },
            {
                $inc: {
                    "whatsapp.contacts.list.$.messageCount": 1,
                    "whatsapp.contacts.list.$.outboundCount": 1,
                },
                $set: { "whatsapp.contacts.list.$.lastMessageAt": new Date() },
            }
        );

        const sessionUpdate = SessionModel.findByIdAndUpdate(session._id, {
            lastMessageAt: new Date(),
            $inc: {
                "context.messageCount": 1,
                "context.outboundCount": 1,
                "context.totalTokens": aiResponse?.tokensUsed || 0,
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
                            updatedAt: new Date(),
                        },
                    },
                }
            );
        }

        console.log("✅ AI response sent and session updated");
    } catch (error) {
        console.error("Error in triggerAIResponse:", error);
    } finally {
        await SessionModel.findByIdAndUpdate(session._id, { isProcessingAI: false });
    }
};