/**
 * complaintDetector.js
 *
 * Deterministic, lightweight complaint-trigger detection for the Pax26 AI sales
 * agent. Runs synchronously BEFORE the AI is invoked so no expensive LLM call
 * is made for a serious customer complaint.
 *
 * Groups (A–H) map to the spec. Each group has a priority and a list of phrase
 * triggers. Triggers are matched at word boundaries after text normalisation.
 *
 * Conservative negation: If the matched phrase is immediately preceded by a
 * negation word (not, no, never, didn't, isn't, haven't, wouldn't, don't,
 * can't, won't, without) within 4 words, the match is skipped.
 *
 * Configuration: individual groups or keywords can be toggled via the optional
 * `disabledGroups` / `disabledKeywords` arrays passed to `detectComplaints()`.
 * These are intended to be stored in the seller profile and forwarded here.
 *
 * Exported API:
 *   detectComplaints(text, options?) → { triggered, group, priority, matchedPhrases }
 *   HANDOFF_GROUPS                  → the raw configuration (importable for admin UIs)
 */

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD CONFIGURATION  (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────
export const HANDOFF_GROUPS = [
  {
    id: "A",
    name: "Human / Seller Request",
    priority: "HIGH",
    triggers: [
      "human",
      "human being",
      "real person",
      "real human",
      "real agent",
      "customer service",
      "customer care",
      "representative",
      "speak to someone",
      "talk to someone",
      "speak with the seller",
      "talk to the owner",
      "let me talk to you",
      "connect me to a human",
      "manager",
      "supervisor",
      "i want to speak to the owner",
      "abeg let me talk to you",
    ],
  },
  {
    id: "B",
    name: "Fraud, Scam and Trust Complaints",
    priority: "CRITICAL",
    triggers: [
      "scam",
      "scammer",
      "fraud",
      "fraudulent",
      "fraudster",
      "thief",
      "theif",
      "stealing",
      "419",
      "fake seller",
      "fake product",
      "fake business",
      "dishonest",
      "liar",
      "lying",
      "cheat",
      "cheating",
      "you stole my money",
      "you duped me",
      "you defrauded me",
      "you've deceived me",
      "this is a scam",
      "i have been scammed",
      "na scam be this",
      "una be scam",
    ],
  },
  {
    id: "C",
    name: "Payment, Debit and Refund Complaints",
    priority: "HIGH",
    triggers: [
      "payment problem",
      "payment issue",
      "paid already",
      "i've paid",
      "i have paid",
      "money deducted",
      "debited",
      "debit alert",
      "transfer failed",
      "payment not confirmed",
      "no confirmation",
      "double debit",
      "money missing",
      "where is my money",
      "refund",
      "refund me",
      "give me my money",
      "return my money",
      "reverse my money",
      "i paid twice",
      "i want a refund",
    ],
  },
  {
    id: "D",
    name: "Delivery and Order Complaints",
    priority: "HIGH",
    triggers: [
      "where is my order",
      "where is my package",
      "delivery delay",
      "delayed delivery",
      "not delivered",
      "hasn't arrived",
      "not received",
      "missing order",
      "wrong item",
      "wrong product",
      "damaged",
      "broken",
      "incomplete order",
      "missing item",
      "you sent the wrong item",
      "you haven't delivered",
      "tracking issue",
      "rider issue",
      "dispatch issue",
      "still waiting",
      "how long will it take",
    ],
  },
  {
    id: "E",
    name: "Threats to Report or Expose",
    priority: "CRITICAL",
    triggers: [
      "report you",
      "report your business",
      "report your page",
      "report to whatsapp",
      "report to meta",
      "report to police",
      "efcc",
      "fccpc",
      "consumer protection",
      "take legal action",
      "sue you",
      "take you to court",
      "expose you",
      "expose this business",
      "post you online",
      "go viral",
      "i'll report you",
      "i will report you",
      "i'll expose you",
      "i will expose you",
      "contact my lawyer",
    ],
  },
  {
    id: "F",
    name: "Anger and Dissatisfaction",
    priority: "MEDIUM",
    triggers: [
      "angry",
      "annoyed",
      "frustrated",
      "disappointed",
      "ridiculous",
      "nonsense",
      "rubbish",
      "useless",
      "terrible",
      "horrible",
      "unacceptable",
      "disgraceful",
      "i'm tired",
      "i'm fed up",
      "this is frustrating",
      "very poor service",
      "worst service",
      "what kind of nonsense",
      "i'm not happy",
      "i'm highly disappointed",
      "you disappointed me",
      "this is not what i ordered",
      "no be so we agree",
    ],
  },
  {
    id: "G",
    name: "AI Failure / Unresolved Conversation",
    priority: "HIGH",
    triggers: [
      "you don't understand",
      "you are not listening",
      "are you a robot",
      "stop repeating",
      "you keep repeating",
      "same answer",
      "that's not what i asked",
      "you didn't answer me",
      "you haven't answered",
      "answer my question",
      "read my message",
      "i already told you",
      "i've explained already",
      "this is going nowhere",
      "i need a solution",
      "solve my problem",
      "nobody is helping me",
      "you are wasting my time",
    ],
  },
  {
    id: "H",
    name: "Product Quality, Returns and Cancellation",
    priority: "HIGH",
    triggers: [
      "poor quality",
      "bad quality",
      "not original",
      "counterfeit",
      "not as described",
      "not as advertised",
      "different from the picture",
      "return this item",
      "return my goods",
      "exchange this",
      "replace this",
      "cancel my order",
      "cancel the order",
      "i want to return it",
      "defective",
      "expired",
      "wrong size",
      "doesn't fit",
      "not working",
      "stopped working",
      "warranty claim",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEXT NORMALISATION
// Lowercase, collapse whitespace, normalise apostrophes, strip leading/trailing
// punctuation on the message. We do NOT strip punctuation globally so that
// phrases like "419" or emoticons are still matched.
// ─────────────────────────────────────────────────────────────────────────────
function normalise(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[''`´]/g, "'")   // normalise apostrophes
    .replace(/[–—]/g, "-")     // normalise dashes
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// NEGATION GUARD
// Returns true if the phrase match is preceded (within 4 words) by a negation.
// This handles "I heard there are scammers out there" differently from
// "you are a scammer".
// ─────────────────────────────────────────────────────────────────────────────
const NEGATION_WORDS = new Set([
  "not", "no", "never", "neither", "nor",
  "didn't", "isn't", "aren't", "wasn't", "weren't",
  "haven't", "hasn't", "hadn't", "wouldn't", "couldn't",
  "shouldn't", "don't", "doesn't", "won't", "can't",
  "without", "nothing",
]);

function isNegated(text, matchIndex) {
  // Extract up to 4 words before the match position
  const before = text.slice(0, matchIndex).trim();
  const words = before.split(/\s+/).slice(-4);
  return words.some((w) => NEGATION_WORDS.has(w.replace(/[^a-z']/g, "")));
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTED TEXT GUARD
// Returns true if the match position is inside a quoted string (single or
// double quotes, or parentheses). This catches "he told me 'you are a scammer'"
// being about a THIRD PARTY saying it, not the seller.
//
// NOTE: We only skip for Group B (fraud) and E (threats) where false-positives
// are most likely. For simpler groups we don't apply this guard.
// ─────────────────────────────────────────────────────────────────────────────
function isInsideQuotes(text, matchIndex) {
  const before = text.slice(0, matchIndex);
  // Count unmatched opening quotes before the match
  const singles = (before.match(/'/g) || []).length;
  const doubles = (before.match(/"/g) || []).length;
  // Odd count = we're inside a quoted block
  return singles % 2 !== 0 || doubles % 2 !== 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PHRASE REGEX
// For multi-word phrases: require word boundary at start and end.
// For single words: same.
// Also allow minor punctuation directly adjacent (comma, period, exclamation).
// ─────────────────────────────────────────────────────────────────────────────
function buildPhraseRegex(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // \b doesn't work well at start of non-\w chars, so we use lookahead/lookbehind
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "gi");
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY ORDERING (for when multiple groups trigger)
// ─────────────────────────────────────────────────────────────────────────────
const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function topPriority(a, b) {
  return (PRIORITY_ORDER[a] ?? 99) <= (PRIORITY_ORDER[b] ?? 99) ? a : b;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: detectComplaints
//
// @param {string} text — raw inbound customer message text
// @param {object} [options]
// @param {string[]} [options.disabledGroups]   — group IDs to skip ("A", "B"…)
// @param {string[]} [options.disabledKeywords] — specific keyword strings to skip
//
// @returns {{
//   triggered: boolean,
//   group: string|null,        — group ID (e.g. "B") of highest-priority match
//   groupName: string|null,
//   priority: string|null,     — "CRITICAL"|"HIGH"|"MEDIUM"
//   matchedPhrases: string[],  — all matched phrases across all triggered groups
//   allTriggeredGroups: string[]
// }}
// ─────────────────────────────────────────────────────────────────────────────
export function detectComplaints(text, options = {}) {
  const { disabledGroups = [], disabledKeywords = [] } = options;

  const norm = normalise(text);
  if (!norm) {
    return { triggered: false, group: null, groupName: null, priority: null, matchedPhrases: [], allTriggeredGroups: [] };
  }

  const disabledGroupsSet = new Set((disabledGroups || []).map(g => String(g).toUpperCase()));
  const disabledKeywordsSet = new Set((disabledKeywords || []).map(k => normalise(k)));

  let highestPriority = null;
  let highestGroup = null;
  const allMatchedPhrases = [];
  const allTriggeredGroups = [];

  for (const group of HANDOFF_GROUPS) {
    if (disabledGroupsSet.has(group.id)) continue;

    const useQuoteGuard = group.id === "B" || group.id === "E";
    const groupMatches = [];

    for (const trigger of group.triggers) {
      if (disabledKeywordsSet.has(normalise(trigger))) continue;

      const normTrigger = normalise(trigger);
      const re = buildPhraseRegex(normTrigger);

      let match;
      let found = false;
      while ((match = re.exec(norm)) !== null) {
        const idx = match.index;
        // Negation guard for all groups
        if (isNegated(norm, idx)) continue;
        // Quote guard only for high-risk groups
        if (useQuoteGuard && isInsideQuotes(norm, idx)) continue;
        found = true;
        break;
      }

      if (found) {
        groupMatches.push(trigger);
      }
    }

    if (groupMatches.length > 0) {
      allTriggeredGroups.push(group.id);
      allMatchedPhrases.push(...groupMatches);

      if (highestPriority === null || PRIORITY_ORDER[group.priority] < PRIORITY_ORDER[highestPriority]) {
        highestPriority = group.priority;
        highestGroup = group;
      }
    }
  }

  if (!highestGroup) {
    return { triggered: false, group: null, groupName: null, priority: null, matchedPhrases: [], allTriggeredGroups: [] };
  }

  return {
    triggered: true,
    group: highestGroup.id,
    groupName: highestGroup.name,
    priority: highestPriority,
    matchedPhrases: [...new Set(allMatchedPhrases)],
    allTriggeredGroups,
  };
}
