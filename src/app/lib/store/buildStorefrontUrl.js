/**
 * buildStorefrontUrl.js
 *
 * Server-side helper called by the AI response pipeline.
 * Creates a StorefrontSession and returns the full URL with token.
 *
 * Usage (inside triggerAIResponse or any server-side AI handler):
 *
 *   const storeUrl = await buildStorefrontUrl({
 *     sellerProfile,
 *     customerPhone: "+2348012345678",
 *     referredProductId: product._id.toString(),  // optional
 *   });
 *   // → "https://pax26.com/store/jaystore?session=eyJ..."
 *
 * Falls back to the plain storefront URL (no session) if token creation fails,
 * so the AI can still send a working link even if session creation errors.
 */

import { createSessionToken, sessionExpiresAt } from "./signSession.js";
import StorefrontSessionModel from "../../ults/models/StorefrontSessionModel.js";
import { connectDb } from "../../ults/db/ConnectDb.js";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pax26.com";

/**
 * @param {object} options
 * @param {object} options.sellerProfile      - SellerProfile document (lean)
 * @param {string} options.customerPhone      - customer's WhatsApp number "+234..."
 * @param {string} [options.referredProductId] - optional product _id string
 * @returns {Promise<string>}                 - full storefront URL with session token
 */
export async function buildStorefrontUrl({ sellerProfile, customerPhone, referredProductId }) {
  const slug = sellerProfile?.slug;

  // If the seller hasn't set a slug, return null — AI should not send a broken link
  if (!slug) return null;

  const plainUrl = `${BASE_URL}/store/${slug}`;

  // If no customer phone provided, return the plain URL (no session needed)
  if (!customerPhone) return plainUrl;

  try {
    await connectDb();

    const payload = {
      sellerId:         sellerProfile._id.toString(),
      storeSlug:        slug,
      customerPhone,
      businessPhone:    sellerProfile.whatsappNumber || "",
      referredProductId: referredProductId || null,
    };

    const token = createSessionToken(payload);
    const expiresAt = sessionExpiresAt();

    // Fire-and-forget DB write — don't block the AI response on a DB write
    StorefrontSessionModel.create({
      token,
      sellerId:         sellerProfile._id,
      storeSlug:        slug,
      customerPhone,
      businessPhone:    sellerProfile.whatsappNumber || "",
      referredProductId: referredProductId || null,
      expiresAt,
    }).catch(err => console.warn("⚠️ StorefrontSession save failed (non-fatal):", err.message));

    return `${plainUrl}?session=${encodeURIComponent(token)}`;
  } catch (err) {
    // Non-fatal — return plain URL so the AI can still send something
    console.warn("⚠️ buildStorefrontUrl failed, falling back to plain URL:", err.message);
    return plainUrl;
  }
}
