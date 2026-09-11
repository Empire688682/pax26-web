/**
 * validateDeliveryLocation.js
 *
 * Validates a customer's delivery address against allowed delivery locations
 * for products in their cart or single item selection.
 */
export function validateDeliveryLocation(items = [], deliveryAddress = "", storeCoverage = "Nationwide") {
  const addr = (deliveryAddress || "").trim();
  if (!addr || addr.length < 5) {
    return {
      valid: false,
      reason: "empty_address",
      message: "⚠️ Please enter your Full Delivery Address (State, City, Area, Street Name & House No) to proceed.",
    };
  }

  const cleanAddr = addr.toLowerCase();
  const invalidItems = [];

  for (const item of items) {
    const allowed = (item.allowedDeliveryLocations || item.locationNotes || storeCoverage || "Nationwide").trim();

    // If allowed is "Nationwide", "Everywhere", or "All Locations", skip restriction check
    if (/nationwide|all locations|everywhere|nigeria/i.test(allowed)) {
      continue;
    }

    // Split allowed locations by commas, slashes, or "or"
    const allowedList = allowed
      .toLowerCase()
      .split(/[,/\n|]|\bor\b/)
      .map((s) => s.replace(/\bonly\b/gi, "").trim())
      .filter((s) => s.length >= 2);

    const matches = allowedList.some((loc) => cleanAddr.includes(loc));
    if (!matches) {
      invalidItems.push({ name: item.name || "Item", allowed });
    }
  }

  if (invalidItems.length > 0) {
    const item = invalidItems[0];
    return {
      valid: false,
      reason: "location_restricted",
      invalidItems,
      message: `❌ Delivery for "${item.name}" is not available to your location. Allowed delivery areas: ${item.allowed}.`,
    };
  }

  return { valid: true };
}
