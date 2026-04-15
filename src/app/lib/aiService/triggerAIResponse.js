import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { buildSystemPrompt } from "../aiBuild/buildSystemPrompt";
import BusinessProfileModel from "@/app/ults/models/BusinessProfileModel";
import { callGroqAI } from "./grok";
import UserModel from "@/app/ults/models/UserModel";
import SessionModel from "@/app/ults/models/SessionModel";

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

        if (session.context.inboundCount > 20) {
            console.log("Rate limit hit");
            return;
        }

        await SessionModel.findByIdAndUpdate(session._id, {
            isProcessingAI: true
        });

        // ✅ Fetch business profile for this user
        const businessProfile = await BusinessProfileModel.findOne({
            userId: user._id,
            whatsappEnabled: true
        }).lean();

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
        const history = await AIMessageModel.find({ sessionId: session.sessionId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const historyMessages = history.reverse().map(m => ({
            role: m.senderType === "visitor" ? "user" : "assistant",
            content: m.text
        }));

        const trimmedMessages = historyMessages.slice(-6);
        console.log("trimmedMessages: ", trimmedMessages);

        const messages = [
            ...trimmedMessages,
            { role: "user", content: inboundText }
        ];

        // Call AI
        const aiResponse = await Promise.race([
            callGroqAI({ systemPrompt, messages }),
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
        console.log("AI reply for session :", aiReply);

        await new Promise(res => setTimeout(res, 1500));

        // Send via WhatsApp
        const response = await sendWhatsAppAutomationReply({
            phoneNumberId: user?.whatsapp?.phoneNumberId,
            to: session?.visitorPhone,
            text: aiReply,
            accessToken: user?.whatsapp?.accessToken
        });

        if (!response?.messageId) {
            console.warn("⚠️ No messageId from WhatsApp — possible tracking issue");
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

        const updateResult = await UserModel.updateOne(
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
        };

        await SessionModel.findByIdAndUpdate(session._id, {
            lastMessageAt: new Date(),
            $inc: {
                "context.messageCount": 1,
                "context.outboundCount": 1,
                "context.totalTokens": aiResponse?.tokensUsed || 0
            },
            isProcessingAI: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        console.log("✅ Session updated");
    } catch (error) {
        console.error("Error in triggerAIResponse:", error);
    } finally {
        await SessionModel.findByIdAndUpdate(session._id, {
            isProcessingAI: false
        });
    }
};
