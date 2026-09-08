import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply.js";
import { sendWhatsAppImageReply } from "../../api/helper/WhatsAppImageReply.js";
import AIMessageModel from "../../ults/models/AIMessageModel.js";
import ServiceProfileModel from "../../ults/models/ServiceProfileModel.js";
import SellerProfileModel from "../../ults/models/SellerProfileModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import UserModel from "../../ults/models/UserModel.js";
import SessionModel from "../../ults/models/SessionModel.js";
import { analyzeCustomerIntent } from "./intentAnalyzer.js";
import { resolveBusinessFacts } from "./businessFactsService.js";
import { generateResponseText } from "./responseWriter.js";
import { validateAIResponse, getSafeFallbackMessage } from "./responseValidator.js";

// Load seller profile and products
async function loadProfileAndProducts(userId, user = null) {
    const activeType = user?.paxAI?.businessType;

    if (!activeType) {
        return { businessProfile: null, profileType: null, products: [], isTrained: false };
    }

    if (activeType === "seller") {
        const sellerProfile = await SellerProfileModel.findOne({
            userId,
            isActive: true,
        }).lean();

        if (!sellerProfile) {
            return { businessProfile: null, profileType: "seller", products: [], isTrained: false };
        }

        const products = await SellerProductModel.find({
            sellerId: sellerProfile._id,
            isAvailable: true,
        }).lean();

        return { businessProfile: sellerProfile, profileType: "seller", products, isTrained: true };
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
            isTrained: serviceProfile?.aiTrained === true,
        };
    }

    return { businessProfile: null, profileType: null, products: [], isTrained: false };
}

// Send images first, then text
async function sendReply({ phoneNumberId, to, imageUrls = [], cleanText }) {
    if (imageUrls.length > 0) {
        const firstUrl = imageUrls[0];
        try {
            const result = await sendWhatsAppImageReply({
                phoneNumberId,
                to,
                imageUrl: firstUrl,
                caption: cleanText || "",
            });
            return result;
        } catch (err) {
            console.warn("⚠️ Failed to send image reply:", err.message);
        }
    }

    if (cleanText) {
        return sendWhatsAppAutomationReply({ phoneNumberId, to, text: cleanText });
    }

    return { success: true, messageId: null };
}

/**
 * DETERMINISTIC MULTI-STAGE PIPELINE TRIGGER
 */
export const triggerAIResponse = async ({
    session,
    user,
    inboundText,
    imageSearchContext = false,
}) => {
    try {
        if (session.handoff?.isHandedOff) {
            console.log("Session handed off — skipping AI for:", session.sessionId);
            return;
        }

        const lockedSession = await SessionModel.findOneAndUpdate(
            { _id: session._id, isProcessingAI: false },
            { isProcessingAI: true },
            { new: true }
        );

        if (!lockedSession) {
            console.log("AI already processing (atomic lock) — skipping...");
            return;
        }

        const profileData = await loadProfileAndProducts(user._id, user);
        const { businessProfile, profileType, products, isTrained } = profileData;

        if (!businessProfile || !isTrained || user.paxAI?.aiAgentEnabled === false || user.paxAI?.enabled === false) {
            console.log(`AI skipped for user ${user._id} — profile inactive or AI disabled`);
            return;
        }

        // Fetch raw history with trust levels
        const rawHistory = await AIMessageModel.find({ sessionId: session.sessionId })
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();

        const historyContext = rawHistory.reverse().map((m) => ({
            role: m.senderType === "visitor" || m.direction === "inbound" ? "user" : "assistant",
            content: m.text || "",
            trustLevel: m.trustLevel || (m.direction === "inbound" ? "CUSTOMER_MESSAGE" : "AI_MESSAGE"),
        }));

        // STAGE 1: INTENT ANALYSIS AI
        console.log(`\n--- PIPELINE EXECUTION FOR SESSION: ${session.sessionId} ---`);
        console.log(`1. INTENT ANALYSIS: Analyzing customer message: "${inboundText}"`);
        const intentResult = await analyzeCustomerIntent({
            inboundText,
            conversationContext: historyContext,
        });
        console.log(`✅ Intent Analysis Result: ${intentResult.intent} (Confidence: ${intentResult.confidence})`);

        // STAGE 2: BACKEND BUSINESS FACTS RESOLVER
        console.log("2. BUSINESS FACTS RESOLVER: Resolving facts and enforcing single price authority...");
        const verifiedContext = await resolveBusinessFacts({
            sellerProfile: businessProfile,
            intentResult,
            customerPhone: session.visitorPhone,
            customerName: session.customerName || "Customer",
            session,
            inboundText,
            messagesHistory: historyContext,
        });

        console.log(`✅ Business Facts Approved Action: ${verifiedContext.approvedAction}`);
        console.log(`✅ Order Stage: ${verifiedContext.order.orderStage} (Locked: ${verifiedContext.order.isSnapshotLocked}) | Total: ₦${verifiedContext.order.grandTotal}`);

        // STAGE 3: RESPONSE WRITER AI
        console.log("3. RESPONSE WRITER AI: Generating response strictly from verified context...");
        let responseSource = "AI_RESPONSE";
        let responseText = await generateResponseText({
            verifiedContext,
            approvedAction: verifiedContext.approvedAction,
            customerLanguage: "English",
            tone: businessProfile.tone || "friendly",
        });

        // STAGE 4: RESPONSE VALIDATOR
        console.log("4. RESPONSE VALIDATOR: Pre-send validation interceptor running...");
        let valResult = validateAIResponse(responseText, verifiedContext);
        let regenerationAttempt = 0;

        if (!valResult.isValid) {
            console.warn(`⚠️ Pre-send Validation FAILED: ${valResult.reason} (Check: ${valResult.failedCheck})`);
            console.log("5. SAFE REGENERATION: Attempting 1-retry with correction instruction...");
            regenerationAttempt = 1;
            responseSource = "REGENERATED_AI_RESPONSE";

            responseText = await generateResponseText({
                verifiedContext,
                approvedAction: verifiedContext.approvedAction,
                customerLanguage: "English",
                tone: businessProfile.tone || "friendly",
                correctionPrompt: valResult.reason,
                previousResponse: responseText,
            });

            valResult = validateAIResponse(responseText, verifiedContext);
        }

        if (!valResult.isValid) {
            console.error(`❌ Second validation attempt FAILED. Falling back to deterministic safe message.`);
            responseText = getSafeFallbackMessage(intentResult.intent);
            responseSource = "SAFE_FALLBACK";
        } else {
            console.log(`✅ Pre-send Validation PASSED (${responseSource})`);
        }

        // Image URLs extraction
        let imageUrls = [];
        if (verifiedContext.approvedAction === "PROVIDE_PRODUCT_IMAGE" && verifiedContext.products.length > 0) {
            const firstImg = verifiedContext.products[0].imageUrl;
            if (firstImg) imageUrls.push(firstImg);
        }

        // STAGE 5: WHATSAPP SEND & STRUCTURED LOGGING
        const sendRes = await sendReply({
            phoneNumberId: user?.whatsapp?.phoneNumberId,
            to: session?.visitorPhone,
            imageUrls,
            cleanText: responseText,
        });

        const status = sendRes?.success ? "sent" : "failed";

        // Save outbound AI message record
        await AIMessageModel.create({
            messageId: sendRes?.messageId || `ai_${Date.now()}`,
            userId: user._id,
            sessionId: session.sessionId,
            platform: "whatsapp",
            phoneNumberId: user.whatsapp.phoneNumberId,
            from: user.whatsapp.displayPhone,
            to: session.visitorPhone,
            text: responseText,
            trustLevel: "AI_MESSAGE",
            aiMeta: {
                intent: intentResult.intent,
                intentConfidence: intentResult.confidence,
                approvedAction: verifiedContext.approvedAction,
                orderId: verifiedContext.order.id,
                orderStage: verifiedContext.order.orderStage,
                validationPassed: valResult.isValid,
                responseSource,
                regenerationAttempt,
            },
            direction: "outbound",
            senderType: "ai",
            status,
            automation: { isAutoReply: true },
        });

        // Update Session counts and timestamp
        await SessionModel.findByIdAndUpdate(session._id, {
            $set: {
                lastMessageAt: new Date(),
                isProcessingAI: false,
            },
            $inc: {
                "context.messageCount": 1,
                "context.outboundCount": 1,
            },
        });

        // STAGE 6: STRUCTURED DEBUG LOGGING
        console.log(`\n================ STRUCTURED PIPELINE LOG ================`);
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            sessionId: session.sessionId,
            sellerId: businessProfile._id.toString(),
            intent: intentResult.intent,
            intentConfidence: intentResult.confidence,
            productIds: verifiedContext.products.map(p => p.id),
            orderId: verifiedContext.order.id,
            orderStage: verifiedContext.order.orderStage,
            calculatedTotals: {
                productsTotal: verifiedContext.order.productsTotal,
                deliveryFee: verifiedContext.order.deliveryFee,
                grandTotal: verifiedContext.order.grandTotal,
            },
            aiResponse: responseText,
            validationResult: valResult.isValid ? "PASSED" : "FAILED",
            validationFailureReason: valResult.reason || null,
            regenerationAttempt,
            finalResponseSource: responseSource,
        }, null, 2));
        console.log(`=========================================================\n`);

    } catch (error) {
        console.error("❌ Error in triggerAIResponse pipeline:", error);
    } finally {
        await SessionModel.findByIdAndUpdate(session._id, { isProcessingAI: false });
    }
};