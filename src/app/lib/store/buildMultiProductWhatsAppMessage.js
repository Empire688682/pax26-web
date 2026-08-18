import { formatPrice } from "@/app/lib/currency/currencyHelper";

export function buildMultiProductWhatsAppMessage({
  businessName,
  cartItems,
  currency = "NGN",
  deliveryLocation = "",
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
  const maxDeliveryFee = Math.max(0, ...cartItems.map((item) => Number(item.deliveryFee) || 0));

  let text = `Hi! I'm interested in ordering the following items from *${businessName || "your store"}*:\n\n`;

  cartItems.forEach((item) => {
    text += `• ${item.quantity}x *${item.name}* — ${formatPrice(item.price * item.quantity, currency)}\n`;
  });

  text += `\n💰 *Products Total:* ${formatPrice(totalPrice, currency)}`;
  if (maxDeliveryFee > 0) {
    text += `\n🚚 *Estimated Delivery Fee:* ${formatPrice(maxDeliveryFee, currency)} (single package fee)`;
    text += `\n💳 *Estimated Total:* ${formatPrice(totalPrice + maxDeliveryFee, currency)}`;
  } else {
    text += `\n💳 *Total:* ${formatPrice(totalPrice, currency)}`;
  }

  if (deliveryLocation && deliveryLocation.trim()) {
    text += `\n📍 *Delivery Location:* ${deliveryLocation.trim()}`;
  }

  text += `\n\nProduct page: ${firstItemProductUrl}`;
  text += `\n\nCould you assist me with this order?`;

  return encodeURIComponent(text);
}
