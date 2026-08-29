import { formatPrice } from "@/app/lib/currency/currencyHelper";

export function buildMultiProductWhatsAppMessage({
  businessName,
  cartItems,
  currency = "NGN",
  deliveryLocation = "",
  fulfillmentMethod = "delivery",
  pickupDetails = "",
  selectedZone = null,
  slug,
  sessionToken,
}) {
  if (!cartItems || !cartItems.length) return "";

  const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pax26.com";

  // The 1st product link is attached to provide the single thumbnail card on WhatsApp!
  const firstItem = cartItems[0];
  const firstItemProductUrl = firstItem
    ? `${BASE}/store/${slug}/${firstItem.productId}${sessionToken ? `?session=${sessionToken}` : ""}`
    : `${BASE}/store/${slug}${sessionToken ? `?session=${sessionToken}` : ""}`;

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery fee logic:
  // If selectedZone is provided, use zone.fee.
  // Otherwise fallback to max delivery fee from product items.
  const deliveryFee = selectedZone && selectedZone.fee != null
    ? Number(selectedZone.fee)
    : Math.max(0, ...cartItems.map((item) => Number(item.deliveryFee) || 0));

  let text = `Hi! I'm interested in ordering the following items from *${businessName || "your store"}*:\n\n`;

  cartItems.forEach((item) => {
    text += `• ${item.quantity}x *${item.name}* — ${formatPrice(item.price * item.quantity, currency)}\n`;
  });

  text += `\n💰 *Products Total:* ${formatPrice(totalPrice, currency)}`;

  if (fulfillmentMethod === "pickup") {
    text += `\n🏬 *Fulfillment:* Store Pick-up (FREE)`;
    text += `\n💳 *Total Amount:* ${formatPrice(totalPrice, currency)}`;
    if (pickupDetails && pickupDetails.trim()) {
      text += `\n📍 *Pick-up Location:* ${pickupDetails.trim()}`;
    }
  } else {
    text += `\n🚚 *Fulfillment:* Home Delivery`;
    if (selectedZone) {
      text += `\n📍 *Delivery Zone:* ${selectedZone.name}${selectedZone.areas ? ` (${selectedZone.areas})` : ""}`;
      if (deliveryFee > 0) {
        text += `\n🚚 *Delivery Fee:* ${formatPrice(deliveryFee, currency)}`;
        text += `\n💳 *Estimated Total:* ${formatPrice(totalPrice + deliveryFee, currency)}`;
      } else {
        text += `\n🚚 *Delivery Fee:* FREE`;
        text += `\n💳 *Total:* ${formatPrice(totalPrice, currency)}`;
      }
    } else if (deliveryFee > 0) {
      text += `\n🚚 *Estimated Delivery Fee:* ${formatPrice(deliveryFee, currency)}`;
      text += `\n💳 *Estimated Total:* ${formatPrice(totalPrice + deliveryFee, currency)}`;
    } else {
      text += `\n💳 *Total:* ${formatPrice(totalPrice, currency)}`;
    }
    if (deliveryLocation && deliveryLocation.trim()) {
      text += `\n📍 *Delivery Address:* ${deliveryLocation.trim()}`;
    }
  }

  text += `\n\nProduct page: ${firstItemProductUrl}`;
  text += `\n\nCould you assist me with this order?`;

  return encodeURIComponent(text);
}
