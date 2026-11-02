/**
 * /store/[slug]/cart
 *
 * Dedicated cart & checkout page — replaces the slide-over CartDrawer.
 * Fully theme-aware, mobile-first, works on large screens too.
 *
 * Stages (managed by client-side state):
 *   cart       → Cart review + top products
 *   delivery   → Select delivery method (only if seller allows BOTH pickup AND delivery)
 *   address    → Add / select delivery address
 *   (submit)   → Checkout API call → WhatsApp redirect
 */

import { notFound } from "next/navigation";
import CartPage from "@/components/Storefront/CartPage";
import { connectDb } from "@/app/ults/db/ConnectDb";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import UserModel from "@/app/ults/models/UserModel";

async function getCartPageData(slug) {
  try {
    await connectDb();

    const profile = await SellerProfileModel.findOne({
      slug: slug.toLowerCase().trim(),
    }).lean();

    if (!profile) return null;

    // ── Plan product limit ─────────────────────────────────────────────────
    const user = await UserModel.findById(profile.userId).select("paxAI.productsLimit paxAI.plan").lean();
    const planProductsLimit = user?.paxAI?.productsLimit ?? 20;

    // ── Top products: most-ordered in confirmed/paid/delivered orders ──────
    // Aggregate the top 10 product IDs by order frequency
    const topProductAgg = await SellerOrderModel.aggregate([
      { $match: { sellerId: profile._id, status: { $in: ["confirmed", "paid", "delivered"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", orderCount: { $sum: "$items.quantity" } } },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
    ]);

    const topProductIds = topProductAgg.map(a => a._id).filter(Boolean);

    let topProducts = [];
    if (topProductIds.length > 0) {
      topProducts = await SellerProductModel.find({
        _id: { $in: topProductIds },
        isAvailable: true,
      }).select("_id slug name price discountPrice comparePrice images category stock").lean();

      // Keep order from aggregate (highest sales first)
      const orderMap = Object.fromEntries(topProductAgg.map(a => [a._id?.toString(), a.orderCount]));
      topProducts.sort((a, b) => (orderMap[b._id.toString()] || 0) - (orderMap[a._id.toString()] || 0));
    }

    // Fallback: if no order history yet, show newest available products
    if (topProducts.length === 0) {
      const allEligible = await SellerProductModel.find({ sellerId: profile._id, isAvailable: true })
        .sort({ createdAt: 1, _id: 1 })
        .select("_id")
        .lean();
      const eligibleSlice = planProductsLimit > 0 ? allEligible.slice(0, planProductsLimit) : allEligible;
      const eligibleIds = eligibleSlice.map(p => p._id);
      topProducts = await SellerProductModel.find({ _id: { $in: eligibleIds } })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id slug name price discountPrice comparePrice images category stock")
        .lean();
    }

    const serialize = (obj) => JSON.parse(JSON.stringify(obj));

    return serialize({
      store: {
        slug: profile.slug,
        businessName: profile.businessName,
        logoUrl: profile.logoUrl || null,
        currency: profile.currency || "NGN",
        storeTheme: profile.storeTheme || "classic",
        whatsappHref: profile.whatsappNumber
          ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`
          : null,
        callNumber: profile.callNumber || null,
        callNumberEnabled: profile.callNumberEnabled || false,
        deliveryCoverage: profile.deliveryCoverage || "",
        liveLocation: profile.liveLocation || "",
        fulfillmentSettings: profile.fulfillmentSettings
          ? {
              allowDelivery: profile.fulfillmentSettings.allowDelivery ?? true,
              allowPickup: profile.fulfillmentSettings.allowPickup ?? false,
              pickupAddress: profile.fulfillmentSettings.pickupAddress || "",
              pickupInstructions: profile.fulfillmentSettings.pickupInstructions || "",
              deliveryModel: profile.fulfillmentSettings.deliveryModel || "flat",
              flatDeliveryFee: Number(profile.fulfillmentSettings.flatDeliveryFee) || 0,
              deliveryZones: (profile.fulfillmentSettings.deliveryZones || []).map(z => ({
                name: z.name || "",
                areas: z.areas || "",
                fee: Number(z.fee) || 0,
                timeframe: z.timeframe || "",
              })),
            }
          : { allowDelivery: true, allowPickup: false, deliveryModel: "flat", flatDeliveryFee: 0, deliveryZones: [] },
      },
      topProducts: topProducts.map(p => ({
        _id: p._id.toString(),
        slug: p.slug || null,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice || null,
        comparePrice: p.comparePrice || null,
        stock: p.stock ?? 0,
        category: p.category || null,
        image: p.images?.[0]?.url || null,
      })),
    });
  } catch (err) {
    console.error("CartPage getCartPageData error:", err?.message);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Cart | Pax26 Store` };
}

export default async function CartSlugPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const sessionToken = resolvedSearch?.session || null;

  const data = await getCartPageData(slug);
  if (!data) notFound();

  return (
    <CartPage
      store={data.store}
      topProducts={data.topProducts}
      slug={slug}
      sessionToken={sessionToken}
    />
  );
}
