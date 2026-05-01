// Shared utility used by both Blog.jsx and BlogPostClient.jsx
export const categoryColor = (cat) => {
  const map = {
    "WhatsApp Automation": "#25d366",
    "Lead Generation": "#f59e0b",
    Chatbots: "#8b5cf6",
    "AI Automation": "#3b82f6",
    "Digital Services": "#06b6d4",
    Sales: "#ef4444",
    Fintech: "#10b981",
    "Case Study": "#f97316",
  };
  return map[cat] || "#3b82f6";
};
