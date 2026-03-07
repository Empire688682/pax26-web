// lib/posts.js
export const posts = [
  {
    slug: "whatsapp-automation-tips",
    title: "Top 5 WhatsApp Automation Tips for Businesses",
    excerpt:
      "Learn how to automate WhatsApp messages to save time and increase lead engagement.",
    image: "/blog/whatsapp-automation.png",
    keywords: ["whatsapp automation", "ai automation", "lead follow-up"],
  },
  {
    slug: "lead-follow-up-strategies",
    title: "Effective Lead Follow-Up Strategies with AI",
    excerpt:
      "Discover the best AI-powered techniques to follow up with leads and boost conversion rates.",
    image: "/blog/lead-follow-up.png",
    keywords: ["lead follow-up", "ai automation", "business growth"],
  },
  {
    slug: "chatbots-for-small-business",
    title: "How Chatbots Can Help Small Businesses Save Time",
    excerpt:
      "Chatbots are revolutionizing customer service. Learn how your small business can benefit.",
    image: "/blog/chatbots-small-business.png",
    keywords: ["chatbots", "small business", "ai automation"],
  },
  {
    slug: "ai-automation-workflows",
    title: "Streamline Your Workflow with AI Automation",
    excerpt:
      "Step-by-step guide on implementing AI automation in your business workflows for maximum efficiency.",
    image: "/blog/ai-automation-workflows.png",
    keywords: ["ai automation", "workflow automation", "business efficiency"],
  },
  {
    slug: "digital-services-nigeria",
    title: "Top Digital Services in Nigeria You Should Know",
    excerpt:
      "Explore the best digital services in Nigeria, including airtime, data, and bill payment solutions.",
    image: "/blog/digital-services-nigeria.png",
    keywords: ["digital services nigeria", "airtime", "data", "bill payment"],
  },
  {
    slug: "saving-data-tips",
    title: "How to Save Data in Nigeria Effectively",
    excerpt:
      "Data prices can be high. Learn practical tips to save data on your mobile plans daily.",
    image: "/blog/saving-data-tips.png",
    keywords: ["data saving tips", "mobile data nigeria", "pax26 tips"],
  },
  {
    slug: "boost-sales-with-automation",
    title: "Boost Your Sales Using AI Automation Tools",
    excerpt:
      "Discover how AI tools can automate your sales process and help your business grow faster.",
    image: "/blog/boost-sales-automation.png",
    keywords: ["sales automation", "ai tools", "business growth"],
  },
  {
    slug: "monnify-payment-integration",
    title: "Monnify Payment Integration in Your App",
    excerpt:
      "Step-by-step guide to integrating Monnify payment solutions in your app for smooth transactions.",
    image: "/blog/monnify-payment.png",
    keywords: ["monnify", "payment integration", "digital payments"],
  },
  {
    slug: "whatsapp-chatbot-case-study",
    title: "Case Study: WhatsApp Chatbot Success Stories",
    excerpt:
      "See real examples of businesses that increased engagement and sales using WhatsApp chatbots.",
    image: "/blog/whatsapp-chatbot-case.png",
    keywords: ["whatsapp chatbot", "case study", "business success"],
  },
  {
    slug: "future-of-ai-automation",
    title: "The Future of AI Automation in Business",
    excerpt:
      "Explore emerging AI automation trends that are shaping how businesses operate globally.",
    image: "/blog/future-ai-automation.png",
    keywords: ["ai automation", "future trends", "business technology"],
  },
]

export async function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug)
}