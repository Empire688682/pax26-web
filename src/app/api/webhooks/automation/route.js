import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { handleNewContact } from "@/app/lib/aiService/optIn";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";

// The revised webhook flow
export const handleIncomingWhatsApp = async (payload) => {
    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const metadata = value?.metadata;
    const contact = value?.contacts?.[0];
    const inboundText = message?.text?.body || "";

    if (!message?.from) {
        console.log("Invalid message.from");
        return { ok: true };
    }

    const cleaned = message.from.replace(/\D/g, "");
    const visitorPhone = `+${cleaned}`;

    // 1. Find which user owns this phoneNumberId
    const user = await UserModel.findOne({ "whatsapp.phoneNumberId": metadata.phone_number_id });
    if (!user) {
        console.log("No user for this phoneNumberId");
        return { ok: true };
    }

    // 2. Get or create session
    const session = await getOrCreateSession({
        visitorPhone,
        userId: user._id,
        phoneNumberId: metadata.phone_number_id
    });

    if (!session) {
        console.log("Session creation failed");
        return { ok: true };
    }

    // 3. Save inbound message
    try {
        await AIMessageModel.create({
            messageId: message.id,
            userId: user._id,
            sessionId: session.sessionId,
            platform: "whatsapp",
            phoneNumberId: metadata.phone_number_id,
            from: visitorPhone,
            to: metadata.display_phone_number,
            text: inboundText,
            direction: "inbound",
            senderType: "visitor",
            status: "received"
        });
    } catch (err) {
        if (err.code === 11000) {
            console.log("Duplicate message prevented at DB level");
            return { skipped: true };
        }
        throw err;
    }

    await UserModel.updateOne(
        {
            _id: user._id,
            "whatsapp.contacts.list.phone": { $ne: visitorPhone }
        },
        {
            $addToSet: {
                "whatsapp.contacts.list": {
                    phone: visitorPhone,
                    status: "whitelist"
                }
            }
        }
    );
    // 4. Update session
    await SessionModel.findByIdAndUpdate(session._id, {
        lastMessageAt: new Date(),
        $inc: { "context.messageCount": 1 },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // reset TTL
    });

    // 5. Check allow contacts to auto reply
    const canAutoReply = await UserModel.exists({
        _id: user._id,
        "whatsapp.contacts.list": {
            $elemMatch: {
                phone: visitorPhone,
                status: "whitelist"
            }
        }
    });
    if (!canAutoReply) {
        console.log("Auto-reply blocked by contact policy. Session:", session.sessionId);
        return { ok: true };
    }

    // 6. Handle opt-in flow for new contacts
    const handled = await handleNewContact({ session, user, visitorPhone, inboundText });
    if (handled) {
        console.log("Handled by opt-in flow. Session:", session.sessionId);
        return { ok: true };
    }

    // 7. Trigger AI response (next step)
    triggerAIResponse({ session, user, inboundText }).catch(err => console.log("AI error:", err));
    return { ok: true };
};