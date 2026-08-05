import { useGlobalContext } from "@/components/Context";

/**
 * usePlanLimits
 *
 * Central source of truth for all plan-based feature access.
 * Reads from userData.paxAI — the server syncs this on every plan upgrade.
 *
 * Every feature in PlanModel maps to a derived flag here.
 * UI gates (PlanGate, BroadcastLimitBar, etc.) consume this hook.
 * API routes do their own DB checks — this is client-side only.
 */
export function usePlanLimits() {
  const { userData } = useGlobalContext();

  const paxAI = userData?.paxAI || {};
  const plan = paxAI.plan || "free";

  // ── Plan tier helpers ──────────────────────────────────────
  const planWeights = { free: 0, starter: 1, business: 2, enterprise: 3 };
  const planWeight = planWeights[plan] ?? 0;
  const isStarter    = planWeight >= 1;
  const isBusiness   = planWeight >= 2;
  const isEnterprise = planWeight >= 3;

  // ── AI Messages ────────────────────────────────────────────
  const messagesLimit = paxAI.maxMonthlyMessages ?? 200;
  const messagesUsed  = paxAI.messagesUsedThisMonth ?? 0;
  const messagesRemaining = Math.max(0, messagesLimit - messagesUsed);
  const messagesPct   = messagesLimit > 0 ? Math.min(100, (messagesUsed / messagesLimit) * 100) : 0;

  // ── Broadcast ─────────────────────────────────────────────
  const broadcastLimit = paxAI.broadcastContactsLimit ?? 0;
  const broadcastUsed  = paxAI.broadcastContactsUsedThisMonth ?? 0;
  const canBroadcast   = plan !== "free" && broadcastLimit > 0;
  const broadcastRemaining = isEnterprise
    ? Infinity
    : Math.max(0, broadcastLimit - broadcastUsed);
  const broadcastPct = broadcastLimit > 0 && !isEnterprise
    ? Math.min(100, (broadcastUsed / broadcastLimit) * 100)
    : 0;

  // ── Broadcast advanced features ───────────────────────────
  const canSchedule     = !!paxAI.scheduledBroadcast;
  const canSegment      = !!paxAI.segmentation;
  const canBulkSequence = !!paxAI.bulkSequences;
  const hasCampaignReports = canSegment; // same gate — business+

  // ── Storefront & Commerce ──────────────────────────────────
  const storefrontEnabled      = paxAI.storefrontEnabled      ?? true;
  const productsLimit          = paxAI.productsLimit          ?? 10;   // 0 = unlimited
  const orderReceiptsEnabled   = paxAI.orderReceiptsEnabled   ?? true;
  const salesAlertsEnabled     = paxAI.salesAlertsEnabled     ?? true;
  const salesAnalyticsEnabled  = paxAI.salesAnalyticsEnabled  ?? (plan !== "free");
  const salesAnalyticsDays     = paxAI.salesAnalyticsDays     ?? 7;
  const customStorefrontDomain = paxAI.customStorefrontDomain ?? false;

  // ── AI features ────────────────────────────────────────────
  const aiAgentEnabled           = paxAI.aiAgentEnabled           ?? true;
  const leadFollowupEnabled      = paxAI.leadFollowupEnabled      ?? isStarter;
  const leadQualificationEnabled = paxAI.leadQualificationEnabled ?? isBusiness;
  const productRecommendations   = paxAI.productRecommendations   ?? isBusiness;

  // ── Branding & Team ────────────────────────────────────────
  const removeBranding = !!paxAI.removeBranding;
  const multiStaff     = paxAI.multiStaff ?? 0;

  // ── WhatsApp numbers ──────────────────────────────────────
  // Stored directly on the plan, not yet synced to user. Derive from plan tier.
  const whatsappNumbersLimit =
    plan === "enterprise" ? 10
    : plan === "business"  ? 3
    : 1; // free & starter

  return {
    // Raw
    plan,
    planWeight,

    // Tier booleans
    isStarter,
    isBusiness,
    isEnterprise,

    // AI messages
    messagesLimit,
    messagesUsed,
    messagesRemaining,
    messagesPct,

    // Broadcast
    canBroadcast,
    broadcastLimit,
    broadcastUsed,
    broadcastRemaining,
    broadcastPct,
    canSchedule,
    canSegment,
    canBulkSequence,
    hasCampaignReports,

    // Storefront & Commerce
    storefrontEnabled,
    productsLimit,
    orderReceiptsEnabled,
    salesAlertsEnabled,
    salesAnalyticsEnabled,
    salesAnalyticsDays,
    customStorefrontDomain,

    // AI features
    aiAgentEnabled,
    leadFollowupEnabled,
    leadQualificationEnabled,
    productRecommendations,

    // Branding & Team
    removeBranding,
    multiStaff,
    whatsappNumbersLimit,
  };
}
