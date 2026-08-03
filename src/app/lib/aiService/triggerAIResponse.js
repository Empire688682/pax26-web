import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply.js";
import { sendWhatsAppImageReply } from "../../api/helper/WhatsAppImageReply.js";
import AIMessageModel from "../../ults/models/AIMessageModel.js";
import { buildSystemPrompt } from "../aiBuild/buildSystemPrompt.js";
import { buildStorefrontUrl } from "../store/buildStorefrontUrl.js";
import ServiceProfileModel from "../../ults/models/ServiceProfileModel.js";
import SellerProfileModel from "../../ults/models/SellerProfileModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
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
    // Match both formats:
    // [SEND_IMAGE: https://...]  — legacy bracket format
    // IMAGE_URL: https://...     — plain format models output more reliably
    const bracketRegex = /\[SEND_IMAGE:\s*(https?:\/\/[^\]\s]+)\]/g;
    const plainRegex   = /^IMAGE_URL:\s*(https?:\/\/\S+)/gm;
    const imageUrls = [];

    let cleanText = text
        .replace(bracketRegex, (_, url) => { imageUrls.push(url.trim()); return ""; })
        .replace(plainRegex,   (_, url) => { imageUrls.push(url.trim()); return ""; })
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    // If images are already being sent, strip redundant "want me to send pictures?" offers
    if (imageUrls.length > 0) {
        cleanText = stripRedundantImageOffers(cleanText);
    }

    return { imageUrls, cleanText };
}

function stripRedundantImageOffers(text) {
    if (!text) return text;

    let cleaned = text
        // Full sentences offering to send pictures/photos/images
        .replace(
            /(?:^|[.!?]\s*)(?:Want me to|Would you like(?: me)? to|Shall I|Should I|Can I|Do you want(?: me)? to)\s+send(?:\s+you)?\s+(?:(?:a|some|the)\s+)?(?:pictures?|photos?|images?)(?:\s+of\s+(?:it|them|this|that))?[?.!]*/gi,
            (match) => (match.trimStart().match(/^[.!?]/) ? match.trimStart()[0] : "")
        )
        // Trailing offer fragments after a period
        .replace(
            /\s*(?:Want me to|Would you like(?: me)? to|Shall I|Should I)\s+send(?:\s+you)?\s+(?:(?:a|some|the)\s+)?(?:pictures?|photos?|images?)(?:\s+of\s+(?:it|them|this|that))?[?.!]*/gi,
            ""
        )
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([.!?])/g, "$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    // If cleanup wiped everything, keep original (better than empty WhatsApp message)
    return cleaned || text.trim();
}

// ─────────────────────────────────────────────────────────────
// Load the right profile depending on whether the user is a
// seller or a service provider.
//
// Dispatches directly based on user.paxAI.businessType —
// no cross-type fallback. If no type is set, automation is off.
//
// Returns: { businessProfile, profileType, products, businessUrl, isTrained }
// ─────────────────────────────────────────────────────────────
async function loadProfileAndProducts(userId, user = null) {
    const activeType = user?.paxAI?.businessType;

    // If no type selected, automation is off — return null immediately
    if (!activeType) {
        return {
            businessProfile: null,
            profileType: null,
            products: [],
            businessUrl: null,
            isTrained: false,
        };
    }

    // Direct dispatch — no cross-type fallback
    if (activeType === "seller") {
        const sellerProfile = await SellerProfileModel.findOne({
            userId,
            isActive: true,
        }).lean();

        if (!sellerProfile) {
            return { businessProfile: null, profileType: "seller", products: [], businessUrl: null, isTrained: false };
        }

        const products = await SellerProductModel.find({
            sellerId: sellerProfile._id,
            isAvailable: true,
        }).lean();

        return {
            businessProfile: sellerProfile,
            profileType: "seller",
            products,
            businessUrl: sellerProfile.businessUrl || null,
            isTrained: true,
        };
    }

    if (activeType === "service") {
        const serviceProfile = await ServiceProfileModel.findOne({
            userId,
            whatsappEnabled: true,
            aiTrained: true,
        }).lean();

        return {
            businessProfile: serviceProfile || null,
            profileType: "service",
            products: [],
            businessUrl: serviceProfile?.businessUrl || null,
            isTrained: serviceProfile?.aiTrained === true,
        };
    }

    // Unknown type — fail safe
    return { businessProfile: null, profileType: null, products: [], businessUrl: null, isTrained: false };
}

// ─────────────────────────────────────────────────────────────
// Send images first, then text — order matters on WhatsApp
// Images appear above the text message in the chat thread
// ─────────────────────────────────────────────────────────────
async function sendReply({ phoneNumberId, to, imageUrls, cleanText }) {
    // When there are images, send the first one with the text as caption (if text exists).
    // Subsequent images (2nd, 3rd) are sent as standalone image messages.
    if (imageUrls.length > 0) {
        const firstUrl = imageUrls[0];
        console.log("🖼️ Sending image URL (full):", firstUrl);
        // First image carries the text as a caption — keeps the conversation coherent
        try {
            const result = await sendWhatsAppImageReply({
                phoneNumberId,
                to,
                imageUrl: firstUrl,
                caption: cleanText || "",   // caption can be empty — that's fine
            });
            console.log("🖼️  Image send result:", JSON.stringify(result));
            // Send remaining images (2nd, 3rd) without caption
            for (const url of imageUrls.slice(1, 3)) {
                try {
                    await sendWhatsAppImageReply({ phoneNumberId, to, imageUrl: url });
                    console.log("🖼️  Image sent:", url.slice(0, 60) + "...");
                } catch (err) {
                    console.warn("⚠️  Failed to send additional image:", err.message);
                }
            }
            // Return the first image send result — it has the messageId
            return result;
        } catch (err) {
            console.warn("⚠️  Failed to send image:", err.message);
        }
    }

    // No images — send text only
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

        // ── Plan-based conversation limits ───────────────────────
        const plan = user.paxAI?.plan || "free";
        const LIMIT = plan === "free" ? 100 : 5000; 
        const WARNING_THRESHOLD = LIMIT - 5;
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
            loadProfileAndProducts(user._id, user),
            AIMessageModel.find({ sessionId: session.sessionId })
                .sort({ createdAt: -1 })
                .limit(20)
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
        // For seller profiles: generate a session-scoped storefront URL
        // so the AI can send customers a browse link during the conversation.
        // This runs in parallel with nothing (fast, non-blocking for service type).
        let storefrontUrl = null;
        if (profileType === "seller" && businessProfile.slug) {
            storefrontUrl = await buildStorefrontUrl({
                sellerProfile: businessProfile,
                customerPhone: session.visitorPhone,
            }).catch(err => {
                console.warn("⚠️ Storefront URL generation failed (non-fatal):", err.message);
                return null;
            });
        }

        const systemPrompt = await buildSystemPrompt(
            businessProfile,
            businessUrl,
            profileType,    // "seller" | "general"
            products,       // [] for general profiles
            storefrontUrl   // null for service profiles or sellers without a slug
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

        const trimmedMessages = historyMessages.slice(-16);

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

        if (!response?.success) {
            console.warn("⚠️ WhatsApp send failed — possible delivery issue");
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
                imagesSent: imageUrls.length,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                wasImageSearch: imageSearchContext,
            },
            ...(imageUrls.length > 0 && {
                mediaType: "image",
                mediaUrl: imageUrls[0],
            }),
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
                    "paxAI.messagesUsedThisMonth": status === "sent" ? 1 : 0,
                    "planAnalytics.aiMessagesUsed": status === "sent" ? 1 : 0,
                    "planAnalytics.metaCost": status === "sent" ? 5 : 0
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
            const policy = user.whatsapp?.contacts?.unknownContactPolicy || "allow";
            await UserModel.updateOne(
                { _id: user._id },
                {
                    $push: {
                        "whatsapp.contacts.list": {
                            phone: session?.visitorPhone,
                            status: policy === "ask" ? "pending" : "whitelist",
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