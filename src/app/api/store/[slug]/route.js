/**
 * GET /api/store/[slug]
 *
 * Public endpoint — no auth required.
 * Returns the seller's storefront profile and product catalogue
 * for a given slug.
 *
 * Only exposes data safe for public consumption:
 * - Business name, description, logo, location, working hours
 * - Products (name, price, images, category, tags, variants)
 *
 * Deliberately excluded:
 * - paymentDetails (bank accounts)
 * - whatsappNumber raw — only the wa.me href is returned
 * - urlCache, internal IDs beyond what the storefront needs
 * - Any customer or conversation data
 */

import { connectDb } from "@/app/ults/db/ConnectDb";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import { NextResponse } from "next/server";

// Public — no CORS restriction on this route (it's a customer-facing page)
const publicHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: publicHeaders() });
}

export async function GET(req, { params }) {
  try {
    await connectDb();

    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid store slug" },
        { status: 400, headers: publicHeaders() }
      );
    }

    // Find the seller profile by slug
    // Note: we do NOT filter by isActive here — a seller who set a slug
    // should always have their store visible. isActive only controls AI responses.
    const profile = await SellerProfileModel.findOne({
      slug: slug.toLowerCase().trim(),
    }).lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Store not found" },
        { status: 404, headers: publicHeaders() }
      );
    }

    // Fetch available products for this seller
    const products = await SellerProductModel.find({
      sellerId: profile._id,
      isAvailable: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // ── Strip private fields before responding ─────────────────
    const publicProfile = {
      slug: profile.slug,
      businessName: profile.businessName,
      businessDescription: profile.businessDescription,
      logoUrl: profile.logoUrl || null,
      industry: profile.industry || null,
      liveLocation: profile.liveLocation || null,
      workingHours: profile.workingHours || null,
      currency: profile.currency || "NGN",
      // wa.me link so the storefront "Chat" button works without exposing the raw number
      whatsappHref: profile.whatsappNumber
        ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`
        : null,
    };

    // Strip internal fields from each product
    const publicProducts = products.map((p) => ({
      _id: p._id,
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
      images: p.images || [],
      variants: p.variants || [],
      // sku intentionally excluded from public response
    }));

    return NextResponse.json(
      { success: true, store: publicProfile, products: publicProducts },
      { status: 200, headers: publicHeaders() }
    );
  } catch (error) {
    console.error("GET /api/store/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: publicHeaders() }
    );
  }
}
