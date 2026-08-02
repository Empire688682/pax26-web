/**
 * /store/[slug]/[productSlug]
 *
 * Product detail page — server component.
 * Fetches directly from DB — no HTTP self-fetch.
 */

import { notFound } from "next/navigation";
import ProductDetailPage from "@/components/Storefront/ProductDetailPage";
import { connectDb } from "@/app/ults/db/ConnectDb";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";

async function getStoreData(slug) {
  try {
    await connectDb();

    const profile = await SellerProfileModel.findOne({
      slug: slug.toLowerCase().trim(),
    }).lean();

    if (!profile) return null;

    const products = await SellerProductModel.find({
      sellerId: profile._id,
      isAvailable: true,
    })
      .sort({ createdAt: -1 })
      .lean();

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
      whatsappHref: profile.whatsappNumber
        ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`
        : null,
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

    return { store, products: publicProducts };
  } catch (err) {
    console.error("getStoreData error:", err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug, productSlug } = await params;
  const data = await getStoreData(slug);
  if (!data) return { title: "Product Not Found | Pax26" };

  const product = data.products?.find(
    (p) => p.slug === productSlug || p._id === productSlug
  );

  const title = product
    ? `${product.name} — ${data.store.businessName} | Pax26 Store`
    : `${data.store.businessName} | Pax26 Store`;

  return {
    title,
    description: product?.description?.slice(0, 160) || "",
    openGraph: {
      title,
      description: product?.description?.slice(0, 160) || "",
      images: product?.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductSlugPage({ params, searchParams }) {
  const { slug, productSlug } = await params;
  const resolvedSearch = await searchParams;
  const data = await getStoreData(slug);
  if (!data) notFound();

  const product = data.products?.find(
    (p) => p.slug === productSlug || p._id === productSlug
  );
  if (!product) notFound();

  return (
    <ProductDetailPage
      store={data.store}
      product={product}
      allProducts={data.products}
      slug={slug}
      isPreview={resolvedSearch?.preview === "1"}
      sessionToken={resolvedSearch?.session || null}
    />
  );
}
