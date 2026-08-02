/**
 * signSession.js
 *
 * Creates and verifies signed storefront session tokens.
 *
 * Format:  <payload_b64url>.<hmac_hex>
 *
 * Payload (JSON, base64url-encoded):
 *   {
 *     sellerId:    string,
 *     storeSlug:   string,
 *     customerPhone: string,   // the customer's WhatsApp number
 *     businessPhone: string,   // the seller's WhatsApp Business number
 *     expiresAt:   number,     // Unix timestamp (ms)
 *     referredProductId?: string,  // product the AI was discussing (optional)
 *   }
 *
 * Security:
 * - HMAC-SHA256 keyed with NEXTAUTH_SECRET — cannot be forged without the key
 * - Expiry is baked into the payload AND enforced on verify — clock skew safe
 * - No conversation content or private data in the token
 * - Node.js built-in `crypto` — zero extra dependencies
 */

import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "pax26_secret";
// Default session lifetime: 30 minutes.  Override with env var.
const DEFAULT_TTL_MS = parseInt(process.env.STOREFRONT_SESSION_TTL_MS || "1800000", 10);

/* ── helpers ──────────────────────────────────────────────── */
function toBase64Url(str) {
  return Buffer.from(str).toString("base64url");
}

function fromBase64Url(str) {
  return Buffer.from(str, "base64url").toString("utf8");
}

function sign(data) {
  return createHmac("sha256", SECRET).update(data).digest("hex");
}

/* ── public API ───────────────────────────────────────────── */

/**
 * createSessionToken(payload, ttlMs?)
 *
 * Returns a signed token string safe for use in a URL query param.
 *
 * @param {object} payload  - { sellerId, storeSlug, customerPhone, businessPhone, referredProductId? }
 * @param {number} ttlMs    - optional override for TTL in milliseconds
 * @returns {string}        - "<b64url_payload>.<hmac_hex>"
 */
export function createSessionToken(payload, ttlMs = DEFAULT_TTL_MS) {
  const full = {
    ...payload,
    expiresAt: Date.now() + ttlMs,
  };
  const encoded = toBase64Url(JSON.stringify(full));
  const mac = sign(encoded);
  return `${encoded}.${mac}`;
}

/**
 * verifySessionToken(token)
 *
 * Returns the decoded payload if the token is valid and unexpired.
 * Returns null for any invalid, tampered, or expired token —
 * never throws so callers don't need try/catch.
 *
 * @param {string} token
 * @returns {{ sellerId, storeSlug, customerPhone, businessPhone, expiresAt, referredProductId? } | null}
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = token.slice(0, dotIndex);
  const mac = token.slice(dotIndex + 1);

  // Constant-time comparison to prevent timing attacks
  const expectedMac = sign(encoded);
  try {
    const a = Buffer.from(mac, "hex");
    const b = Buffer.from(expectedMac, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }

  // Check expiry
  if (!payload.expiresAt || Date.now() > payload.expiresAt) return null;

  return payload;
}

/**
 * sessionExpiresAt(ttlMs?)
 *
 * Convenience — returns a Date object for the expiry time.
 * Used when persisting a session to MongoDB.
 */
export function sessionExpiresAt(ttlMs = DEFAULT_TTL_MS) {
  return new Date(Date.now() + ttlMs);
}
