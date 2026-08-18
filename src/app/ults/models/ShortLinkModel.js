import mongoose from "mongoose";

/**
 * ShortLinkModel
 *
 * Stores short-link slugs that redirect to full storefront session URLs.
 * Created by buildStorefrontUrl.js when the AI sends a browse link.
 *
 * Short link format: ${SHORT_LINK_BASE_URL}/s/{slug}
 * Example:          https://www.pax26.com/s/x7k2qp
 *
 * Expires in sync with the StorefrontSession (MongoDB TTL auto-deletes after expiresAt).
 */
const ShortLinkSchema = new mongoose.Schema(
  {
    // 6-char alphanumeric slug — the public-facing short code
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    // The full target URL this slug redirects to
    // e.g. https://www.pax26.com/store/jaystore?session=eyJhbGc...
    targetUrl: {
      type: String,
      required: true,
    },

    // Which seller this short link belongs to (for analytics / cleanup)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProfile",
      index: true,
    },

    // Customer phone — for deduplication (one active short link per customer per session)
    customerPhone: {
      type: String,
    },

    // Click counter — lightweight analytics
    clicks: {
      type: Number,
      default: 0,
    },

    // MongoDB TTL — auto-deletes the document after this date
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

const ShortLinkModel =
  mongoose.models.ShortLink ||
  mongoose.model("ShortLink", ShortLinkSchema);

export default ShortLinkModel;
