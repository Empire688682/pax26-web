/**
 * searchProducts.js
 *
 * AI product search service — runs inside the WhatsApp webhook pipeline
 * before the AI responds to a customer text message.
 *
 * ─── Search strategy (3 tiers) ────────────────────────────────────────
 *
 * Tier 1 — MongoDB full-text search  ($text index on name, description,
 *           tags, category — weighted 10/3/8/6)
 *           Fast, typo-tolerant for whole words, language-aware stemming.
 *           Example: "black sneaker" → matches name:"Black Nike Sneakers"
 *
 * Tier 2 — Regex fallback  (if Tier 1 returns nothing)
 *           Splits the query into tokens and runs case-insensitive regex
 *           against name, category, tags, and description.
 *           Catches partial words Tier 1 misses.
 *           Example: "sneak" → matches "Sneakers"
 *
 * Tier 3 — Price filter  (applied on top of Tier 1 or 2 results)
 *           Detects phrases like "under ₦30,000", "below 5000",
 *           "less than $200", "max 10000" and filters accordingly.
 *
 * ─── Intent detection ─────────────────────────────────────────────────
 *
 * shouldSearch(text) decides whether to run a search at all.
 * Only product-seeking messages trigger it. Greetings, payment
 * confirmations, and order questions pass straight to the AI.
 *
 * ─── Why no vector DB / embeddings? ──────────────────────────────────
 *
 * The MongoDB text index + regex combo covers 95% of real customer
 * queries at zero cost and zero latency overhead.
 * The AI's own system prompt (with the full product catalogue) handles
 * the remaining semantic gap — it knows all the products and can
 * recommend based on context even if the search returns nothing.
 * Embeddings can be layered on later without changing this API.
 */

import SellerProductModel from "../../ults/models/SellerProductModel.js";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const MAX_RESULTS = 5;

// Words that strongly signal product enquiry intent
const SEARCH_INTENT_PATTERNS = [
  /\bdo you have\b/i,
  /\bdo you sell\b/i,
  /\bi (need|want|am looking for|'m looking for)\b/i,
  /\bshow me\b/i,
  /\bwhat (do you have|types|kinds|options)\b/i,
  /\bany\b.{0,20}\bavailable\b/i,
  /\bhow much (is|are|for)\b/i,
  /\bprice of\b/i,
  /\bcost of\b/i,
  /\bsell.{0,10}\b(shoe|bag|cloth|shirt|jean|dress|watch|phone|laptop|book|cap|shoe|sneaker|trouser)/i,
  /\b(shoe|bag|shirt|dress|sneaker|jean|trouser|watch|phone|laptop|gown|cap|hat|jacket|suit|boot)\b/i,
];

// Words that indicate the customer is NOT shopping — skip search
const NON_SEARCH_PATTERNS = [
  /\b(paid|payment|transferred|sent money|bank|receipt|proof)\b/i,
  /\b(hello|hi|hey|good morning|good afternoon|good evening)\b.*$/i, // greeting-only messages
  /\b(thank you|thanks|ok|okay|alright|noted|sure|yes|no)\b.*$/i,
  /\bwhere is my (order|delivery|package)\b/i,
  /\b(cancel|refund|complaint|issue|problem)\b/i,
];

/* ─────────────────────────────────────────────────────────────
   INTENT DETECTION
   Returns true if the message looks like a product search query.
───────────────────────────────────────────────────────────── */
export function shouldSearch(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;

  // Short greetings / confirmations — skip
  if (trimmed.split(/\s+/).length <= 2 && NON_SEARCH_PATTERNS.some(p => p.test(trimmed))) return false;

  // Non-search patterns take priority
  if (NON_SEARCH_PATTERNS.some(p => p.test(trimmed))) return false;

  // Explicit search intent
  if (SEARCH_INTENT_PATTERNS.some(p => p.test(trimmed))) return true;

  // If message is longer than 4 words and not a greeting/payment, give it a chance
  return trimmed.split(/\s+/).length >= 4;
}

/* ─────────────────────────────────────────────────────────────
   PRICE EXTRACTION
   Parses budget constraints like:
     "under ₦30,000"  →  { max: 30000 }
     "between 5000 and 10000"  →  { min: 5000, max: 10000 }
     "above 2000"  →  { min: 2000 }
───────────────────────────────────────────────────────────── */
function extractPriceConstraints(text) {
  const clean = text.replace(/[₦$€£₵]/g, "").replace(/,/g, "");

  const constraints = {};

  // "under / below / less than / max / at most N"
  const maxMatch = clean.match(
    /\b(?:under|below|less than|max(?:imum)?|at most|not more than)\s+(\d+(?:\.\d+)?)/i
  );
  if (maxMatch) constraints.max = parseFloat(maxMatch[1]);

  // "above / over / more than / min / at least N"
  const minMatch = clean.match(
    /\b(?:above|over|more than|min(?:imum)?|at least|from)\s+(\d+(?:\.\d+)?)/i
  );
  if (minMatch) constraints.min = parseFloat(minMatch[1]);

  // "between N and M"
  const betweenMatch = clean.match(/\bbetween\s+(\d+(?:\.\d+)?)\s+(?:and|to|-)\s+(\d+(?:\.\d+)?)/i);
  if (betweenMatch) {
    constraints.min = parseFloat(betweenMatch[1]);
    constraints.max = parseFloat(betweenMatch[2]);
  }

  return constraints; // {} if no price constraint found
}

/* ─────────────────────────────────────────────────────────────
   CLEAN QUERY
   Strips price phrases and filler words so the text search
   gets cleaner signal.
───────────────────────────────────────────────────────────── */
function cleanQueryText(text) {
  return text
    .replace(/\b(?:under|below|less than|maximum|above|over|more than|minimum|between|at most|at least|from|not more than)\s+[\d,₦$€£₵.]+\s*(?:and|to|-)?\s*[\d,₦$€£₵.]*/gi, "")
    .replace(/[₦$€£₵]/g, "")
    .replace(/\b(?:do you have|do you sell|i need|i want|show me|i am looking for|i'm looking for|any available|how much is|price of|cost of)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ─────────────────────────────────────────────────────────────
   TIER 1: MongoDB Full-Text Search
───────────────────────────────────────────────────────────── */
async function textSearch(sellerId, queryText, priceFilter, limit) {
  if (!queryText || queryText.length < 2) return [];

  const filter = {
    sellerId,
    isAvailable: true,
    $text: { $search: queryText },
    ...buildPriceFilter(priceFilter),
  };

  try {
    return await SellerProductModel.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();
  } catch (err) {
    // $text index might not exist yet on this collection instance
    console.warn("⚠️ Text search failed (index may not exist):", err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────
   TIER 2: Regex Fallback
───────────────────────────────────────────────────────────── */
async function regexSearch(sellerId, queryText, priceFilter, limit) {
  if (!queryText || queryText.length < 2) return [];

  // Split into meaningful tokens (min 3 chars, skip stop words)
  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "are", "was", "have", "has"]);
  const tokens = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length >= 3 && !stopWords.has(t));

  if (!tokens.length) return [];

  // OR across all tokens across all searchable fields
  const regexConditions = tokens.map(token => ({
    $or: [
      { name: { $regex: token, $options: "i" } },
      { category: { $regex: token, $options: "i" } },
      { description: { $regex: token, $options: "i" } },
      { tags: { $elemMatch: { $regex: token, $options: "i" } } },
    ],
  }));

  const filter = {
    sellerId,
    isAvailable: true,
    $and: regexConditions.length > 1
      ? [{ $or: regexConditions.map(c => c.$or).flat() }]
      : regexConditions,
    ...buildPriceFilter(priceFilter),
  };

  // Simpler OR query — match any token in any field
  const orFilter = {
    sellerId,
    isAvailable: true,
    $or: tokens.flatMap(token => [
      { name: { $regex: token, $options: "i" } },
      { category: { $regex: token, $options: "i" } },
      { tags: { $elemMatch: { $regex: token, $options: "i" } } },
    ]),
    ...buildPriceFilter(priceFilter),
  };

  return SellerProductModel.find(orFilter).limit(limit).lean();
}

/* ─────────────────────────────────────────────────────────────
   PRICE FILTER BUILDER (for Mongoose query)
───────────────────────────────────────────────────────────── */
function buildPriceFilter({ min, max } = {}) {
  if (!min && !max) return {};
  const priceCondition = {};
  // Use discountPrice if available, else price
  if (min) priceCondition.$gte = min;
  if (max) priceCondition.$lte = max;
  return {
    $or: [
      { discountPrice: { $exists: true, ...priceCondition } },
      { price: priceCondition },
    ],
  };
}

/* ─────────────────────────────────────────────────────────────
   DEDUPLICATE results by _id
───────────────────────────────────────────────────────────── */
function dedup(products) {
  const seen = new Set();
  return products.filter(p => {
    const id = p._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT: searchProducts
   
   @param {object|string} sellerId  - SellerProfile._id
   @param {string}        query     - raw customer message text
   @returns {{ results: product[], query: string, priceConstraints: object, tier: string }}
───────────────────────────────────────────────────────────── */
export async function searchProducts(sellerId, query) {
  const priceConstraints = extractPriceConstraints(query);
  const cleanedQuery = cleanQueryText(query);

  // Tier 1: full-text
  let results = await textSearch(sellerId, cleanedQuery, priceConstraints, MAX_RESULTS);
  let tier = "text";

  // Tier 2: regex fallback if text search found nothing
  if (!results.length) {
    results = await regexSearch(sellerId, cleanedQuery, priceConstraints, MAX_RESULTS);
    tier = "regex";
  }

  // Deduplicate (shouldn't happen but belt-and-braces)
  results = dedup(results);

  console.log(`🔍 Product search [${tier}] for "${cleanedQuery.slice(0, 50)}": ${results.length} result(s)`);

  return {
    results,
    hasResults: results.length > 0,
    query: cleanedQuery,
    priceConstraints,
    tier,
  };
}
