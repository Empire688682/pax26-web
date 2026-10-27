/**
 * GET /api/store/[slug]/search?q=black+sneaker&maxPrice=30000
 *
 * Public search endpoint for the storefront page's search bar.
 * No auth required — scoped to a single seller by slug.
 *
 * Query params:
 *   q         — search query string (required)
 *   maxPrice  — optional upper price limit
 *   minPrice  — optional lower price limit
 *   category  — optional exact category filter
 *   limit     — max results (default 20, max 50)
 *
 * Returns: { success, results: product[], total }
 */

import { connectDb } from "@/app/ults/db/ConnectDb";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import UserModel from "@/app/ults/models/UserModel";
import { searchProducts } from "@/app/lib/store/searchProducts";
import { NextResponse } from "next/server";

const publicHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: publicHeaders() });
}

export async function GET(req, { params }) {
  try {
    await connectDb();

    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, message: "Search query (q) is required" },
        { status: 400, headers: publicHeaders() }
      );
    }

    // Resolve slug → seller profile
    const profile = await SellerProfileModel.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    }).lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Store not found" },
        { status: 404, headers: publicHeaders() }
      );
    }

    // ── Resolve plan's product allowance ─────────────────────────────────────
    // Read directly from the DB — never trust client-supplied values.
    // planProductsLimit === 0 means unlimited (enterprise).
    const user = await UserModel.findById(profile.userId).select("paxAI.productsLimit").lean();
    const planProductsLimit = user?.paxAI?.productsLimit ?? 20;

    // ── Build the set of eligible product IDs ────────────────────────────────
    // Same deterministic ordering used by the storefront listing and product
    // detail pages (oldest-first, _id tie-breaker) so search results are
    // consistent with what's visible on the storefront.
    let allowedProductIds = null; // null = no restriction (unlimited plan)

    if (planProductsLimit > 0) {
      const allAvailable = await SellerProductModel.find({
        sellerId: profile._id,
        isAvailable: true,
      })
        .sort({ createdAt: 1, _id: 1 })
        .select("_id")
        .lean();

      const eligibleSlice = allAvailable.slice(0, planProductsLimit);
      allowedProductIds = eligibleSlice.map((p) => p._id);
    }

    const { results, hasResults, tier } = await searchProducts(
      profile._id,
      query,
      { allowedProductIds }
    );

    // Strip private fields before responding
    const publicResults = results.map(p => ({
      _id: p._id,
      slug: p.slug || null,
      name: p.name,
      description: p.description || null,
      price: p.price,
      discountPrice: p.discountPrice || null,
      comparePrice: p.comparePrice || null,
      category: p.category || null,
      tags: p.tags || [],
      stock: p.stock ?? 0,
      isPhysical: p.isPhysical,
      deliveryFee: p.deliveryFee || null,
      deliveryTimeFrame: p.deliveryTimeFrame || null,
      locationNotes: p.locationNotes || null,
      images: p.images || [],
      variants: p.variants || [],
    }));

    return NextResponse.json(
      {
        success: true,
        results: publicResults,
        total: publicResults.length,
        hasResults,
        searchTier: tier, // "text" | "regex" — useful for debugging
      },
      { status: 200, headers: publicHeaders() }
    );
  } catch (error) {
    console.error("GET /api/store/[slug]/search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500, headers: publicHeaders() }
    );
  }
}
