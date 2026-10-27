/**
 * /store/[slug]
 *
 * Server component — fetches storefront data directly from the DB.
 * No HTTP self-fetch — avoids BASE_URL config issues in development.
 */

import { notFound } from "next/navigation";
import StorefrontPage from "@/components/Storefront/StorefrontPage";
import { connectDb } from "@/app/ults/db/ConnectDb";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import UserModel from "@/app/ults/models/UserModel";

async function getStoreData(slug, { page = 1, limit = 20, category = "all", q = "" } = {}) {
  try {
    await connectDb();

    const profile = await SellerProfileModel.findOne({
      slug: slug.toLowerCase().trim(),
    }).lean();

    if (!profile) return null;

    // ── Resolve plan's product allowance ──────────────────────────────────────
    // Never trust the client — read directly from the user document.
    // planProductsLimit === 0 means unlimited (enterprise).
    const user = await UserModel.findById(profile.userId).select("paxAI.productsLimit").lean();
    const planProductsLimit = user?.paxAI?.productsLimit ?? 20;

    // ── Determine which products are eligible for public display ─────────────
    // Eligible = the first N products by createdAt ascending (oldest first = stable
    // deterministic order; the seller's earliest-created products are always shown).
    // We fetch all available products once and slice to the plan limit before
    // applying any further filters, so pagination counts are always correct.
    const baseFilter = { sellerId: profile._id, isAvailable: true };

    // Fetch all eligible products ordered oldest-first, then cap to plan limit.
    // Using ascending order (oldest first) ensures that when a seller exceeds their
    // limit the NEWEST products are the ones hidden — which is the least disruptive
    // behaviour during a downgrade.
    const allEligible = await SellerProductModel.find(baseFilter)
      .sort({ createdAt: 1, _id: 1 }) // deterministic: oldest first, _id as tie-breaker
      .select("_id")
      .lean();

    // Cap to plan allowance
    const eligibleSlice = planProductsLimit > 0
      ? allEligible.slice(0, planProductsLimit)
      : allEligible;

    const eligibleIds = eligibleSlice.map((p) => p._id);

    // ── Build the filtered query scoped to eligible IDs ───────────────────────
    const filter = { _id: { $in: eligibleIds } };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (q && q.trim()) {
      const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedQ, "i");
      filter.$or = [
        { name: regex },
        { category: regex },
        { tags: regex },          // direct regex on [String] array — no $elemMatch needed
        { description: regex },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [products, totalProducts, rawCategories] = await Promise.all([
      SellerProductModel.find(filter)
        .sort({ createdAt: -1 }) // newest-first for display within the eligible set
        .skip(skip)
        .limit(limit)
        .lean(),
      SellerProductModel.countDocuments(filter),
      // Categories only from the eligible set so no hidden-product category leaks
      SellerProductModel.distinct("category", { _id: { $in: eligibleIds } }),
    ]);

    const categories = rawCategories.filter(Boolean).sort();

    // Serialize through JSON to strip all BSON ObjectId / Buffer types
    const serialize = (obj) => JSON.parse(JSON.stringify(obj));

    const store = serialize({
      slug: profile.slug,
      businessName: profile.businessName,
      businessDescription: profile.businessDescription,
      logoUrl: profile.logoUrl || null,
      industry: profile.industry || null,
      liveLocation: profile.liveLocation || null,
      workingHours: profile.workingHours || null,
      currency: profile.currency || "NGN",
      storeTheme: profile.storeTheme || "classic",
      deliveryCoverage: profile.deliveryCoverage || null,
      whatsappHref: profile.whatsappNumber
        ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`
        : null,
      promoAnnouncement: profile.promoAnnouncement || null,
      // fulfillmentSettings drives delivery model, zones, flat fee, and pickup in CartDrawer
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
    });

    const publicProducts = serialize(products.map((p) => ({
      _id: p._id.toString(),
      slug: p.slug || null,
      name: p.name,
      description: p.description || null,
      price: p.price,
      comparePrice: p.comparePrice || null,
      discountPrice: p.discountPrice || null,
      category: p.category || null,
      tags: p.tags || [],
      stock: p.stock ?? 0,
      isPhysical: p.isPhysical,
      deliveryFee: p.deliveryFee || null,
      deliveryTimeFrame: p.deliveryTimeFrame || null,
      locationNotes: p.locationNotes || null,
      images: (p.images || []).map(img => ({
        url: img.url,
        publicId: img.publicId,
      })),
      variants: (p.variants || []).map(v => ({
        label: v.label,
        options: (v.options || []).map(o => ({
          value: o.value,
          priceAdjustment: o.priceAdjustment ?? 0,
          stock: o.stock ?? 0,
        })),
      })),
    })));

    return {
      store,
      products: publicProducts,
      categories,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    };
  } catch (err) {
    console.error("getStoreData error:", err?.message || err, "| slug:", slug, "| q:", q);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getStoreData(slug);
  if (!data) return { title: "Store Not Found | Pax26" };
  const { store } = data;
  return {
    title: `${store.businessName} | Pax26 Store`,
    description: store.businessDescription?.slice(0, 160) || `Shop ${store.businessName} on Pax26`,
    openGraph: {
      title: store.businessName,
      description: store.businessDescription?.slice(0, 160) || "",
      images: store.logoUrl ? [{ url: store.logoUrl }] : [],
      type: "website",
    },
  };
}

export default async function StoreSlugPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const page = parseInt(resolvedSearch?.page || "1", 10);
  const limit = parseInt(resolvedSearch?.limit || "20", 10);
  const category = resolvedSearch?.category || "all";
  const q = resolvedSearch?.q || "";
  const orderCode = resolvedSearch?.order || "";

  const data = await getStoreData(slug, { page, limit, category, q });
  if (!data) notFound();

  return (
    <StorefrontPage
      store={data.store}
      initialProducts={data.products}
      initialCategories={data.categories}
      initialPagination={data.pagination}
      slug={slug}
      isPreview={resolvedSearch?.preview === "1"}
      sessionToken={resolvedSearch?.session || null}
      referredProductId={resolvedSearch?.ref || null}
      initialSearch={q || ""}
      initialOrderCode={orderCode || ""}
    />
  );
}
