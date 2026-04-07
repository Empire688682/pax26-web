import UserModel from "@/app/ults/models/UserModel.js";
import { sendWhatsAppReply } from "./whatsapp.service.js";
import SessionModel from "@/app/ults/models/SessionModel.js";
import AIMessageModel from "@/app/ults/models/AIMessageModel.js";

export const handleNewContact = async ({ session, user, visitorPhone, inboundText }) => {

  // Check if this is their first ever message
  const messageCount = await AIMessageModel.countDocuments({
    userId: user._id,
    from: visitorPhone
  });

  if (messageCount === 1) { // first message just saved
    // Send opt-in prompt
    await sendWhatsAppReply({
      phoneNumberId: user.whatsapp.phoneNumberId,
      to: visitorPhone,
      text: `Hi! 👋 You've reached ${user.whatsapp.displayPhone}. Are you contacting us for business enquiries?\n\nReply:\n1️⃣ *Yes* — to chat with our assistant\n2️⃣ *No* — to stop automated replies`
    });

    // Mark session as waiting for opt-in
    await SessionModel.findByIdAndUpdate(session._id, {
      status: "waiting",
      "context.lastIntent": "awaiting_optin"
    });

    return true; // handled
  }

  // Handle opt-in response
  if (session.context?.lastIntent === "awaiting_optin") {
    const lower = inboundText.toLowerCase().trim();

    if (["yes", "1", "y", "yeah", "yep"].includes(lower)) {
      // Whitelist this contact
      await UserModel.findByIdAndUpdate(user._id, {
        $addToSet: { "whatsapp.contacts.whitelist": visitorPhone }
      });
      await SessionModel.findByIdAndUpdate(session._id, {
        status: "active",
        "context.lastIntent": null
      });
      return false; // let AI take over

    } else if (["no", "2", "n", "nope"].includes(lower)) {
      // Blacklist this contact
      await UserModel.findByIdAndUpdate(user._id, {
        $addToSet: { "whatsapp.contacts.blacklist": visitorPhone }
      });
      await sendWhatsAppReply({
        phoneNumberId: user.whatsapp.phoneNumberId,
        to: visitorPhone,
        text: "Got it! You won't receive automated replies from us. 👍"
      });
      return true; // stop processing
    }
  }

  return false;
};