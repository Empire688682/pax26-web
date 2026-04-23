import { fetchUrl } from "../fetchUrl.js";
import GeneralBusinessProfileModel from "../../../app/ults/models/GeneralBusinessProfileModel.js";

const URL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Returns cached URL content from the DB.
 * If cache is missing or stale (>24h), fetches fresh content, saves it, and returns it.
 */
async function getUrlContent(profile) {
  if (!profile.businessUrl) return "";

  const cacheAge = profile.urlCachedAt
    ? Date.now() - new Date(profile.urlCachedAt).getTime()
    : Infinity;

  // ✅ Cache is fresh — use it instantly (no network call)
  if (profile.urlCache && cacheAge < URL_CACHE_TTL_MS) {
    return profile.urlCache;
  }

  // 🔄 Cache is stale or missing — fetch once and save back to DB
  try {
    const freshContent = await fetchUrl(profile.businessUrl);
    if (freshContent) {
      // Save in background — don't await, don't block the response
      GeneralBusinessProfileModel.findByIdAndUpdate(profile._id, {
        urlCache: freshContent,
        urlCachedAt: new Date(),
      }).catch((err) => console.warn("⚠️ Failed to save urlCache:", err.message));

      return freshContent;
    }
  } catch (err) {
    console.warn("⚠️ URL fetch failed, using stale cache if available:", err.message);
    // Fall back to stale cache rather than breaking the response
    if (profile.urlCache) return profile.urlCache;
  }

  return "";
}

export const buildSystemPrompt = async (profile, businessUrl) => {
  if (!profile) {
    return "You are a helpful business assistant on WhatsApp. Be concise and friendly.";
  }

  // ── URL content (cached — fast path) ─────────────────────────
  const urlContent = await getUrlContent(profile);

  const toneMap = {
    friendly: "You are warm, casual, and approachable.",
    professional: "You are formal, precise, and professional.",
    salesy: "You are persuasive, enthusiastic, and sales-focused.",
  };

  // ── Sections ─────────────────────────────────────────────
  const faqSection = profile.faqs?.length
    ? `
## Frequently Asked Questions:
${profile.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`
    : "";

  const kbSection = profile.knowledgeBase?.length
    ? `
## Additional Knowledge Base:
${profile.knowledgeBase.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n")}`
    : "";

  const servicesSection = profile.services?.length
    ? `
## Services Offered:
${profile.services.map((s) => `- ${s}`).join("\n")}`
    : "";

  const urlSection = urlContent
    ? `
## Live Knowledge Source (${urlContent.length >= 12000 ? "truncated" : "full"} content from ${businessUrl}):
Use the content below as an additional reference when answering questions.
If something is covered here, prefer this over guessing.

--- BEGIN ---
${urlContent}
--- END ---`
    : "";

  return `
You are an AI assistant for ${profile.businessName}, a business in the ${profile.industry} industry.
${toneMap[profile.tone] || toneMap.professional}

## WhatsApp Communication Style:
- Keep messages short — 1 to 3 sentences max per reply
- Use line breaks to separate points, never write walls of text
- Never use markdown headers (##), bullet dashes (-), or HTML in replies
- Sound human, not robotic — like a helpful staff member texting a customer
- Never reveal that you are an AI — present yourself as an agent
- Keep all replies professional, no emojis

## About the Business:
${profile.description || ""}

## Website:
${businessUrl || "Not provided"}

${servicesSection}

## Working Hours:
${profile.workingHours || "Not specified"}

${faqSection}

${kbSection}

${urlSection}

## Important Rules:
- Only answer questions related to this business
- If you don't know something, say "Let me check that for you and get back to you shortly"
- Never make up services, prices, or information not provided above
- If asked something outside your knowledge, say "I'll connect you with our team for that"
- If a Live Knowledge Source is provided above, use it to answer questions accurately
`.trim();
};
