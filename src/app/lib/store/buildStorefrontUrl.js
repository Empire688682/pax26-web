/**
 * buildStorefrontUrl.js
 *
 * Returns the permanent short storefront URL for the AI to share in WhatsApp.
 *
 * URL format: {BASE_URL}/api/s/{store-slug}
 * Example:    https://www.pax26.com/api/s/jaystore
 *
 * This URL:
 *   - Is permanent (lives as long as the seller's account)
 *   - Works for AI messaging AND marketing (WhatsApp status, Instagram, etc.)
 *   - Has no session token — no expiry, no broken links after 24h
 *   - Is gateable by subscription via /api/s/[slug]/route.js
 *
 * The StorefrontSession is still created so the storefront can optionally
 * recognise returning WhatsApp visitors — but it is NOT embedded in the URL.
 * The AI sends the clean /api/s/slug link; the storefront tracks sessions
 * separately via the WhatsApp "Chat" button flow.
 *
 * Fallback chain:
 *   1. Permanent short URL  → pax26.com/api/s/jaystore  ← what the AI sends
 *   2. Plain storefront URL → pax26.com/store/jaystore   ← if slug missing
 */

import { createSessionToken, sessionExpiresAt } from "./signSession.js";
import StorefrontSessionModel from "../../ults/models/StorefrontSessionModel.js";
import { connectDb } from "../../ults/db/ConnectDb.js";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pax26.com";

/**
 * @param {object} options
 * @param {object} options.sellerProfile      - SellerProfile document (lean)
 * @param {string} options.customerPhone      - customer's WhatsApp number "+234..."
 * @param {string} [options.referredProductId] - optional product _id string
 * @returns {Promise<string|null>}             - permanent short URL or null if no slug
 */
export async function buildStorefrontUrl({ sellerProfile, customerPhone, referredProductId }) {
    const slug = sellerProfile?.slug;

    // If the seller hasn't set a slug, return null — AI should not send a broken link
    if (!slug) return null;

    const plainUrl  = `${BASE_URL}/store/${slug}`;
    const shortUrl  = `${BASE_URL}/api/s/${slug}`;

    // Fire-and-forget: create a StorefrontSession so the storefront can
    // optionally track this WhatsApp visitor. NOT embedded in the URL.
    if (customerPhone) {
        try {
            await connectDb();

            const payload = {
                sellerId:          sellerProfile._id.toString(),
                storeSlug:         slug,
                customerPhone,
                businessPhone:     sellerProfile.whatsappNumber || "",
                referredProductId: referredProductId || null,
            };

            const token     = createSessionToken(payload);
            const expiresAt = sessionExpiresAt();

            StorefrontSessionModel.create({
                token,
                sellerId:          sellerProfile._id,
                storeSlug:         slug,
                customerPhone,
                businessPhone:     sellerProfile.whatsappNumber || "",
                referredProductId: referredProductId || null,
                expiresAt,
            }).catch(err => console.warn("⚠️ StorefrontSession save failed (non-fatal):", err.message));

        } catch (err) {
            // Non-fatal — session tracking is optional, the short URL still works
            console.warn("⚠️ StorefrontSession creation failed (non-fatal):", err.message);
        }
    }

    return shortUrl;
}
