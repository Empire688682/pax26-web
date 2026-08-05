/**
 * checkPlanFeature
 *
 * Server-side plan feature guard for API routes.
 * Returns { allowed: true } or { allowed: false, response: NextResponse }
 *
 * Usage:
 *   const guard = await checkPlanFeature(user, "webhookAccess");
 *   if (!guard.allowed) return guard.response;
 *
 * @param {object} user       - Mongoose user document (paxAI must be populated)
 * @param {string} feature    - key from paxAI (e.g. "webhookAccess", "salesAnalyticsEnabled")
 * @param {object} corsHeaders - optional headers to attach to the error response
 */
import { NextResponse } from "next/server";

const FEATURE_MESSAGES = {
  salesAnalyticsEnabled:   "Sales analytics requires the Starter plan or higher.",
  salesAlertsEnabled:      "Sales alerts are not available on your current plan.",
  orderReceiptsEnabled:    "Order receipts are not available on your current plan.",
  storefrontEnabled:       "Storefront access requires upgrading your plan.",
  leadFollowupEnabled:     "Lead follow-up automation requires the Starter plan or higher.",
  leadQualificationEnabled:"Lead qualification requires the Business plan or higher.",
  productRecommendations:  "AI product recommendations require the Business plan or higher.",
  scheduledBroadcast:      "Scheduled broadcasts require the Business plan or higher.",
  segmentation:            "Audience segmentation requires the Business plan or higher.",
  bulkSequences:           "Bulk sequences require the Enterprise plan.",
  campaignReports:         "Campaign reports require the Business plan or higher.",
  customStorefrontDomain:  "Custom domains require the Enterprise plan.",
};

export function checkPlanFeature(user, feature, headers = {}) {
  const value = user?.paxAI?.[feature];

  // Default: if the flag doesn't exist on the user's paxAI, treat as disabled
  const isEnabled = value === true || (value !== undefined && value !== false && value !== 0);

  if (isEnabled) {
    return { allowed: true };
  }

  const message = FEATURE_MESSAGES[feature] || `This feature requires a plan upgrade.`;

  return {
    allowed: false,
    response: NextResponse.json(
      {
        success: false,
        message,
        upgradeRequired: true,
        feature,
      },
      { status: 403, headers }
    ),
  };
}
