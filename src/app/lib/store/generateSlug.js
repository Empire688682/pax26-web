/**
 * generateSlug.js
 *
 * Converts a business name (or product name) into a URL-safe slug.
 *
 * Rules:
 * - Lowercase
 * - Replace spaces and special characters with hyphens
 * - Strip leading/trailing hyphens
 * - Collapse consecutive hyphens into one
 * - Max 60 characters (long slugs look bad in URLs)
 *
 * Examples:
 *   "Jay's Store!"   → "jays-store"
 *   "Nike Air Max 42" → "nike-air-max-42"
 *   "Lagos Fashion Hub & Co." → "lagos-fashion-hub-co"
 */
export function generateSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric (keep spaces and hyphens)
    .replace(/[\s]+/g, "-")          // spaces → hyphens
    .replace(/-+/g, "-")             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, "")         // strip leading/trailing hyphens
    .slice(0, 60);
}

/**
 * makeUniqueSlug
 *
 * Appends a short random suffix if the plain slug is already taken.
 * The suffix is 4 hex characters (65,536 combinations per slug) which
 * is sufficient for a per-seller namespace.
 *
 * Usage:
 *   const slug = makeUniqueSlug("nike air max"); // "nike-air-max" or "nike-air-max-a3f1"
 */
export function makeUniqueSlug(text = "", { appendSuffix = false } = {}) {
  const base = generateSlug(text);
  if (!appendSuffix) return base;
  const suffix = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
  return `${base}-${suffix}`.slice(0, 60);
}
