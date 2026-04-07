// lib/contactPolicy.service.js

export const isAllowedToAutoReply = (visitorPhone, whatsappConfig) => {
  const { whitelist = [], blacklist = [], unknownContactPolicy = "allow" } = 
    whatsappConfig?.contacts || {};

  // 1. Blacklist always wins — never reply to blocked numbers
  if (blacklist.includes(visitorPhone)) {
    console.log(`Blocked contact: ${visitorPhone}`);
    return false;
  }

  // 2. If whitelist has entries, ONLY reply to those numbers
  if (whitelist.length > 0) {
    const isWhitelisted = whitelist.includes(visitorPhone);
    if (!isWhitelisted) {
      console.log(`Not whitelisted: ${visitorPhone}`);
      return false;
    }
    return true;
  }

  // 3. No whitelist set — fall back to unknownContactPolicy
  if (unknownContactPolicy === "block") return false;
  if (unknownContactPolicy === "allow") return true;

  // "ask" policy — block for now, notify owner (handle separately)
  if (unknownContactPolicy === "ask") return false;

  return true;
};