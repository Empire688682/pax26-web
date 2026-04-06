import { sendWhatsAppReply } from "@/app/api/helper/ReplyWhatsappMessage";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { buildSystemPrompt } from "../aiBuild/buildSystemPrompt";
import BusinessProfileModel from "@/app/ults/models/BusinessProfileModel";
import { callGroqAI } from "./grok";

export const triggerAIResponse = async ({ session, user, inboundText }) => {
    // Check if handed off to human — skip AI
    if (session.handoff.isHandedOff) return;

    // ✅ Fetch business profile for this user
    const businessProfile = await BusinessProfileModel.findOne({
        userId: user._id,
        whatsappEnabled: true
    }).lean();

    const systemPrompt = buildSystemPrompt(businessProfile);

    // Fetch last N messages for context
    const history = await AIMessageModel.find({ sessionId: session.sessionId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    const messages = history.reverse().map(m => ({
        role: m.senderType === "visitor" ? "user" : "assistant",
        content: m.text
    }));

    // Add current message
    messages.push({ role: "user", content: inboundText });

    // Call AI (Claude, GPT, etc.)
    const aiReply = await callGroqAI({
        systemPrompt,
        messages
    });

    // ✅ Guard against null AI response
    if (!aiReply) {
        console.error("AI returned null, skipping reply for session:", session.sessionId);
        await AIMessageModel.findOneAndUpdate(
            { sessionId: session.sessionId, direction: "inbound", status: "received" },
            { status: "failed" }
        );
        return;
    }

    // Save outbound message
    await AIMessageModel.create({
        messageId: `ai_${Date.now()}`,
        userId: user._id,
        sessionId: session.sessionId,
        platform: "whatsapp",
        phoneNumberId: user.whatsapp.phoneNumberId,
        from: user.whatsapp.displayPhone,
        to: session.visitorPhone,
        text: aiReply,
        aiMeta: {
            model: aiReply?.model,
            tokensUsed: aiReply?.tokensUsed,
        },
        direction: "outbound",
        senderType: "ai",
        status: "sent",
        automation: { isAutoReply: true }
    });

    // Send via WhatsApp
    await sendWhatsAppReply({
        phoneNumberId: user.whatsapp.phoneNumberId,
        to: session.visitorPhone,
        text: aiReply
    });
};
