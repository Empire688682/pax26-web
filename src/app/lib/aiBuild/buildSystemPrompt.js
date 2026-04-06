// lib/buildSystemPrompt.js

export const buildSystemPrompt = (profile) => {
  if (!profile) {
    return "You are a helpful business assistant on WhatsApp. Be concise and friendly.";
  }

  const toneMap = {
    friendly: "You are warm, casual, and approachable.",
    professional: "You are formal, precise, and professional.",
    salesy: "You are persuasive, enthusiastic, and sales-focused."
  };

  // Build FAQs section
  const faqSection = profile.faqs?.length
    ? `
## Frequently Asked Questions:
${profile.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`
    : "";

  // Build Knowledge Base section
  const kbSection = profile.knowledgeBase?.length
    ? `
## Additional Knowledge Base:
${profile.knowledgeBase.map(k => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n")}`
    : "";

  // Build Services section
  const servicesSection = profile.services?.length
    ? `
## Services Offered:
${profile.services.map(s => `- ${s}`).join("\n")}`
    : "";

  return `
You are an AI assistant for ${profile.businessName}, a business in the ${profile.industry} industry.
${toneMap[profile.tone] || toneMap.professional}
This is a WhatsApp conversation — keep responses short, clear, and direct.

## About the Business:
${profile.description || ""}

${servicesSection}

## Working Hours:
${profile.workingHours || "Not specified"}

${faqSection}

${kbSection}

## Important Rules:
- Only answer questions related to this business
- If you don't know something, say "Let me check that for you and get back to you shortly"
- Never make up services, prices, or information not provided above
- If asked something outside your knowledge, offer to connect them with a human agent
`.trim();
};