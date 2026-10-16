/**
 * detectDeliveryZone.js
 *
 * Auto-detects the matching delivery zone from a customer's address string
 * by fuzzy-matching the address against each zone's "areas" field.
 *
 * Zone structure: { name, areas, fee, timeframe }
 * Areas is a free-text comma-separated string e.g. "Lekki, Ajah, Ikoyi, Victoria Island"
 *
 * Matching strategy:
 * 1. Split each zone's areas by comma → normalize each area keyword
 * 2. Check if any keyword appears in the normalized address string
 * 3. If multiple zones match, prefer the one with the most keyword matches (most specific)
 * 4. If no zone matches, return the last zone (typically the interstate/most expensive one)
 *    so the seller is never under-charged
 *
 * @param {string} address - Customer's delivery address
 * @param {Array}  zones   - Array of zone objects from fulfillmentSettings.deliveryZones
 * @returns {{ zone: object|null, fee: number, zoneName: string, confidence: "matched"|"fallback"|"none" }}
 */
export function detectDeliveryZone(address, zones) {
  if (!zones || zones.length === 0) {
    return { zone: null, fee: 0, zoneName: "", confidence: "none" };
  }

  if (!address || address.trim().length < 3) {
    return { zone: null, fee: 0, zoneName: "", confidence: "none" };
  }

  const normAddress = address
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let bestZone = null;
  let bestScore = 0;

  for (const zone of zones) {
    if (!zone.areas && !zone.name) continue;

    // Combine zone name + areas for matching
    const combined = `${zone.name || ""}, ${zone.areas || ""}`;
    const keywords = combined
      .split(",")
      .map(k => k.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim())
      .filter(k => k.length >= 3);

    let matchScore = 0;
    for (const keyword of keywords) {
      // Full keyword match (e.g. "lekki" in "lagos lekki no 5")
      if (normAddress.includes(keyword)) {
        matchScore += keyword.length; // longer matches score higher = more specific
      }
    }

    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestZone = zone;
    }
  }

  if (bestZone && bestScore > 0) {
    return {
      zone: bestZone,
      fee: Number(bestZone.fee) || 0,
      zoneName: bestZone.name || "",
      timeframe: bestZone.timeframe || "",
      confidence: "matched",
    };
  }

  // No match — fall back to last zone (usually "Interstate / Other States")
  // This ensures delivery fee is never 0 for unmatched addresses
  const fallbackZone = zones[zones.length - 1];
  return {
    zone: fallbackZone,
    fee: Number(fallbackZone?.fee) || 0,
    zoneName: fallbackZone?.name || "",
    timeframe: fallbackZone?.timeframe || "",
    confidence: "fallback",
  };
}

/**
 * computeOrderDeliveryFee
 *
 * Determines the final delivery fee for a cart order given:
 * - The store's delivery model and settings
 * - The customer's delivery address (for zone matching)
 * - The cart items (for per-product fee comparison)
 *
 * Rules:
 * - pickup: always ₦0
 * - quote: ₦0 (calculated separately by seller)
 * - flat: flatDeliveryFee OR max(product-level flat fees)
 * - zones: auto-detected zone fee OR max(product-level flat fees) if product fee > zone fee
 *
 * @param {object} options
 * @param {string} options.fulfillmentMethod - "delivery" | "pickup"
 * @param {object} options.fulfillmentSettings - store fulfillmentSettings
 * @param {string} options.deliveryAddress - customer's address string
 * @param {Array}  options.cartItems - cart items with deliveryFee per item
 * @returns {{ fee: number, zoneName: string, model: string, confidence: string }}
 */
export function computeOrderDeliveryFee({ fulfillmentMethod, fulfillmentSettings, deliveryAddress, cartItems = [] }) {
  if (fulfillmentMethod === "pickup") {
    return { fee: 0, zoneName: "", model: "pickup", confidence: "matched" };
  }

  const model = fulfillmentSettings?.deliveryModel || "flat";

  if (model === "quote") {
    return { fee: 0, zoneName: "", model: "quote", confidence: "matched" };
  }

  // Max per-product flat fee across cart items (fallback for products with individual fees set)
  const maxProductFee = cartItems.length > 0
    ? Math.max(0, ...cartItems.map(i => Number(i.deliveryFee) || 0))
    : 0;

  if (model === "flat") {
    const flatFee = Number(fulfillmentSettings?.flatDeliveryFee) || 0;
    // Use the higher of: store flat fee or max product fee
    const fee = Math.max(flatFee, maxProductFee);
    return { fee, zoneName: "", model: "flat", confidence: "matched" };
  }

  if (model === "zones") {
    const zones = fulfillmentSettings?.deliveryZones || [];
    const detection = detectDeliveryZone(deliveryAddress, zones);
    // Use the higher of: detected zone fee or max product fee
    const fee = Math.max(detection.fee, maxProductFee);
    return {
      fee,
      zoneName: detection.zoneName,
      timeframe: detection.timeframe || "",
      model: "zones",
      confidence: detection.confidence,
    };
  }

  return { fee: 0, zoneName: "", model, confidence: "none" };
}
