const HANDOFF_KEYWORDS = [
  "human",
  "agent",
  "real person",
  "talk to someone",
  "customer service",
  "representative",
  "speak to",
  "live chat"
];

export const shouldHandOffToHuman = (text) => {
  const lower = text.toLowerCase();
  return HANDOFF_KEYWORDS.some(keyword => lower.includes(keyword));
};