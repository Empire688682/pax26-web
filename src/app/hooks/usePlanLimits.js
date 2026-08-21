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
  const rawBroadcastLimit = paxAI.broadcastContactsLimit;
  const isUnlimitedBroadcast = rawBroadcastLimit === null || (isEnterprise && rawBroadcastLimit === undefined);
  const broadcastLimit = isUnlimitedBroadcast ? null : (rawBroadcastLimit ?? (isBusiness ? 500 : isStarter ? 100 : 0));
  const broadcastUsed  = paxAI.broadcastContactsUsedThisMonth ?? 0;
  const canBroadcast   = plan !== "free" && (isUnlimitedBroadcast || (broadcastLimit ?? 0) > 0);
  const broadcastRemaining = isUnlimitedBroadcast
    ? Infinity
    : Math.max(0, (broadcastLimit ?? 0) - broadcastUsed);
  const broadcastPct = isUnlimitedBroadcast || !broadcastLimit || broadcastLimit === 0
    ? 0
    : Math.min(100, (broadcastUsed / broadcastLimit) * 100);

  // ── Broadcast advanced features ───────────────────────────
  const canSchedule     = !!paxAI.scheduledBroadcast;
  const canSegment      = !!paxAI.segmentation;
  const canBulkSequence = !!paxAI.bulkSequences;
  const hasCampaignReports = canSegment; // same gate — business+

  // ── Storefront & Commerce ──────────────────────────────────
  const storefrontEnabled      = paxAI.storefrontEnabled      ?? true;
  const productsLimit          = paxAI.productsLimit          ?? (isEnterprise ? 0 : isBusiness ? 500 : isStarter ? 100 : 20);   // 0 = unlimited
  const orderReceiptsEnabled   = paxAI.orderReceiptsEnabled   ?? true;
  const salesAlertsEnabled     = paxAI.salesAlertsEnabled     ?? true;
  const salesAnalyticsEnabled  = paxAI.salesAnalyticsEnabled  ?? (plan !== "free");
  const salesAnalyticsDays     = paxAI.salesAnalyticsDays     ?? (isEnterprise ? 365 : isBusiness ? 90 : isStarter ? 14 : 7);
  const customStorefrontDomain = paxAI.customStorefrontDomain ?? isEnterprise;

  // ── AI features ────────────────────────────────────────────
  const aiAgentEnabled           = paxAI.aiAgentEnabled           ?? true;
  const leadFollowupEnabled      = paxAI.leadFollowupEnabled      ?? isStarter;
  const leadQualificationEnabled = paxAI.leadQualificationEnabled ?? isBusiness;
  const productRecommendations   = paxAI.productRecommendations   ?? isBusiness;

  // ── Branding & Team ────────────────────────────────────────
  const removeBranding = !!paxAI.removeBranding || isStarter;
  const multiStaff     = paxAI.multiStaff ?? (isEnterprise ? 10 : isBusiness ? 5 : 0);

  // ── WhatsApp numbers ──────────────────────────────────────
  // Always 1 for all plans for now
  const whatsappNumbersLimit = 1;

  // ── Named Helper Methods ───────────────────────────────────
  const canUseAnalytics = salesAnalyticsEnabled;
  const canSendAIMessage = messagesLimit === 0 || messagesRemaining > 0;
  const canCreateProduct = (currentCount = 0) => productsLimit === 0 || currentCount < productsLimit;
  const canInviteStaff   = (currentCount = 0) => multiStaff > 0 && currentCount < multiStaff;

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
    canSendAIMessage,

    // Broadcast
    canBroadcast,
    broadcastLimit,
    broadcastUsed,
    broadcastRemaining,
    broadcastPct,
    isUnlimitedBroadcast,
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
    hasMultiStaff: multiStaff > 0,
    whatsappNumbersLimit,

    // Named Helpers
    canUseAnalytics,
    canCreateProduct,
    canInviteStaff,
  };
}
