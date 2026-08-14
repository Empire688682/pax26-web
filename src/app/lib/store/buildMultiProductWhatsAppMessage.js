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

  let text = `Hi! I'm interested in ordering the following items from *${businessName || "your store"}*:\n\n`;

  cartItems.forEach((item) => {
    text += `• ${item.quantity}x *${item.name}* — ${formatPrice(item.price * item.quantity, currency)}\n`;
  });

  text += `\n💰 *Total Price:* ${formatPrice(totalPrice, currency)}`;

  if (deliveryLocation && deliveryLocation.trim()) {
    text += `\n📍 *Delivery Location:* ${deliveryLocation.trim()}`;
  }

  text += `\n\nProduct page: ${firstItemProductUrl}`;
  text += `\n\nCould you assist me with this order?`;

  return encodeURIComponent(text);
}
