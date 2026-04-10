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
        .limit(1)
        .lean();

    const messages = [];

    // const messages = history.reverse().map(m => ({
    //     role: m.senderType === "visitor" ? "user" : "assistant",
    //     content: m.text
    // }));

    // Add current message
    messages.push({ role: "user", content: inboundText });

    // Call AI
    const aiResponse = await callGroqAI({ systemPrompt, messages });

    // ✅ Guard against null AI response
    if (!aiResponse) {
        console.error("AI returned null, skipping reply for session:", session.sessionId);
        await AIMessageModel.findOneAndUpdate(
            { sessionId: session.sessionId, direction: "inbound", status: "received" },
            { status: "failed" }
        );
        return;
    }

    // Extract plain text from response object
    const aiReply = aiResponse?.text || aiResponse;
    console.log("AI reply for session :", aiReply);

    // Save outbound message
    await AIMessageModel.create({
        messageId: `ai_${Date.now()}`,
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
