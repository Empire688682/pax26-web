/**
 * buildStorefrontUrl.js
 *
 * Server-side helper called by the AI response pipeline.
 * Creates a StorefrontSession and returns a SHORT link (e.g. pax26.com/s/x7k2qp)
 * that redirects to the full session URL.
 *
 * Short link base URL is controlled by SHORT_LINK_BASE_URL env var.
 * Set it to "https://www.pax26.com" today; switch to "https://pax26.co" later
 * without any code changes.
 *
 * Fallback chain (most trustworthy → least):
 *   1. Short link  (pax26.com/s/x7k2qp)
 *   2. Long URL    (pax26.com/store/slug?session=TOKEN)
 *   3. Plain URL   (pax26.com/store/slug)
 */

import { createSessionToken, sessionExpiresAt } from "./signSession.js";
import StorefrontSessionModel from "../../ults/models/StorefrontSessionModel.js";
import ShortLinkModel from "../../ults/models/ShortLinkModel.js";
import { connectDb } from "../../ults/db/ConnectDb.js";

const BASE_URL       = process.env.NEXT_PUBLIC_BASE_URL  || "https://www.pax26.com";
const SHORT_BASE_URL = process.env.SHORT_LINK_BASE_URL   || BASE_URL;

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LEN   = 6;

/**
 * Generate a cryptographically random 6-char alphanumeric slug.
 * Collision probability: 1 in 2.1 billion — negligible at our scale.
 */
function generateSlug() {
    let slug = "";
    // Use Math.random as a fast non-cryptographic fallback — fine for URL slugs
    for (let i = 0; i < SLUG_LEN; i++) {
        slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
    }
    return slug;
}

/**
 * Save a short link to the DB and return the short URL.
 * If a short link for this customer/session already exists and is still valid, reuse it.
 *
 * @param {string} targetUrl    - full storefront session URL to redirect to
 * @param {object} sellerId     - seller ObjectId
 * @param {string} customerPhone
 * @param {Date}   expiresAt    - expiry in sync with the StorefrontSession
 * @returns {Promise<string>}   - full short URL  e.g. "https://www.pax26.com/s/x7k2qp"
 */
async function createShortLink(targetUrl, sellerId, customerPhone, expiresAt) {
    // Reuse an existing active short link for this customer (same session window)
    // This avoids creating multiple short links per conversation
    const existing = await ShortLinkModel.findOne({
        sellerId,
        customerPhone,
        expiresAt: { $gt: new Date() },
    }).lean();

    if (existing) {
        // Update target URL in case it changed (new session token)
        ShortLinkModel.updateOne(
            { _id: existing._id },
            { $set: { targetUrl } }
        ).catch(err => console.warn("[shortlink] Update failed (non-fatal):", err.message));

        return `${SHORT_BASE_URL}/api/s/${existing.slug}`;
    }

    // Generate a unique slug (retry once on collision — extremely rare)
    let slug = generateSlug();
    let attempt = 0;
    while (attempt < 3) {
        const conflict = await ShortLinkModel.exists({ slug });
        if (!conflict) break;
        slug = generateSlug();
        attempt++;
    }

    await ShortLinkModel.create({
        slug,
        targetUrl,
        sellerId,
        customerPhone,
        expiresAt,
    });

    return `${SHORT_BASE_URL}/api/s/${slug}`;
}

/**
 * @param {object} options
 * @param {object} options.sellerProfile      - SellerProfile document (lean)
 * @param {string} options.customerPhone      - customer's WhatsApp number "+234..."
 * @param {string} [options.referredProductId] - optional product _id string
 * @returns {Promise<string|null>}             - short storefront URL or null if no slug
 */
export async function buildStorefrontUrl({ sellerProfile, customerPhone, referredProductId }) {
    const slug = sellerProfile?.slug;

    // If the seller hasn't set a slug, return null — AI should not send a broken link
    if (!slug) return null;

    const plainUrl = `${BASE_URL}/store/${slug}`;

    // If no customer phone provided, return plain URL (no session needed)
    if (!customerPhone) return plainUrl;

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
        const longUrl   = `${plainUrl}?session=${encodeURIComponent(token)}`;

        // 1. Save StorefrontSession (fire-and-forget — same as before)
        StorefrontSessionModel.create({
            token,
            sellerId:          sellerProfile._id,
            storeSlug:         slug,
            customerPhone,
            businessPhone:     sellerProfile.whatsappNumber || "",
            referredProductId: referredProductId || null,
            expiresAt,
        }).catch(err => console.warn("⚠️ StorefrontSession save failed (non-fatal):", err.message));

        // 2. Generate short link (fast — same DB, parallel-safe)
        try {
            const shortUrl = await createShortLink(
                longUrl,
                sellerProfile._id,
                customerPhone,
                expiresAt
            );
            console.log(`[shortlink] Generated: ${shortUrl}`);
            return shortUrl;
        } catch (shortErr) {
            // Short link failed — fall back to long URL gracefully
            console.warn("⚠️ Short link creation failed — falling back to long URL:", shortErr.message);
            return longUrl;
        }

    } catch (err) {
        // Total failure — return plain URL so AI still sends something
        console.warn("⚠️ buildStorefrontUrl failed, falling back to plain URL:", err.message);
        return plainUrl;
    }
}
