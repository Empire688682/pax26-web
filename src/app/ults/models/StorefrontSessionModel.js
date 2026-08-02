import mongoose from "mongoose";

/**
 * StorefrontSessionModel
 *
 * Ties a storefront visit to a specific WhatsApp conversation.
 * Created by the AI when it sends a /store/{slug}?session=TOKEN link.
 * Validated when the customer clicks "Chat about this product" to
 * ensure the WhatsApp redirect targets the right number.
 *
 * Security rules:
 * - Token is a signed HMAC-SHA256 hex string (see lib/store/signSession.js)
 * - Expires after `expiresAt` — enforced at validation time
 * - Contains NO conversation content — only enough to route the customer back
 */
const StorefrontSessionSchema = new mongoose.Schema(
  {
    // The token string that appears in the URL query param (?session=TOKEN)
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Which seller's storefront this session belongs to
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProfile",
      required: true,
      index: true,
    },

    // The slug of the storefront (denormalised for fast lookup without joining)
    storeSlug: {
      type: String,
      required: true,
      index: true,
    },

    // The customer's WhatsApp number (e.g. "+2348012345678")
    // Used to pre-fill the wa.me redirect when the customer clicks "Chat"
    customerPhone: {
      type: String,
      required: true,
    },

    // The seller's WhatsApp Business number (e.g. "+2348098765432")
    // The number the customer needs to send the message TO
    businessPhone: {
      type: String,
      required: true,
    },

    // Hard expiry timestamp — sessions are considered invalid after this
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL — auto-deletes expired docs
    },

    // Optional: track which product the AI was discussing when it sent the link
    // Allows the storefront to pre-highlight that product on load
    referredProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProduct",
      default: null,
    },

    // Whether this session has been consumed (customer clicked "Chat")
    // One-time use prevents token reuse, though expiry is the primary guard
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const StorefrontSessionModel =
  mongoose.models.StorefrontSession ||
  mongoose.model("StorefrontSession", StorefrontSessionSchema);

export default StorefrontSessionModel;
