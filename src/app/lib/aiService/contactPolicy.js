// lib/contactPolicy.service.js

export const isAllowedToAutoReply = (visitorPhone, whatsappConfig) => {
  const { status, unknownContactPolicy = "allow" } = 
    whatsappConfig?.contacts || {};

  // 1. Blacklist always wins — never reply to blocked numbers
  if (status === "blacklist") {
    console.log(`Blocked contact: ${visitorPhone}`);
    return false;
  }
  
  // 2. No whitelist set — fall back to unknownContactPolicy
  // if (unknownContactPolicy === "block") return false;
  // if (unknownContactPolicy === "allow") return true;

  // "ask" policy — block for now, notify owner (handle separately)
  // if (unknownContactPolicy === "ask") return false;

  return true;
};