/**
 * /api/s/[slug]/route.js
 *
 * Permanent storefront short-link redirect.
 * URL format: pax26.com/api/s/[store-slug]
 *
 * This is a permanent, seller-scoped redirect — it works as long
 * as the seller's account exists in the platform.
 *
 * NO expiry. NO session tokens in the URL. NO external dependencies.
 *
 * Redirect chain:
 *   pax26.com/api/s/jaystore  →  pax26.com/store/jaystore
 *
 * Future gate (when ready):
 *   Uncomment the subscription check block below to restrict access
 *   to sellers with an active paid plan.
 */

import { NextResponse } from "next/server";
import { connectDb } from "../../../ults/db/ConnectDb.js";
import SellerProfileModel from "../../../ults/models/SellerProfileModel.js";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pax26.com";

export async function GET(request, { params }) {
    const { slug } = params;

    if (!slug || typeof slug !== "string") {
        return NextResponse.redirect(`${BASE_URL}`, { status: 302 });
    }

    try {
        await connectDb();

        // Look up seller by their store slug — permanent, no expiry
        const seller = await SellerProfileModel.findOne({
            slug: slug.toLowerCase().trim(),
            isActive: true,
        })
        .select("slug isActive userId")  // lean projection — fetch only what we need
        .lean();

        if (!seller) {
            console.log(`[shortlink] Store not found or inactive: ${slug}`);
            // Redirect to home — friendly fallback
            return NextResponse.redirect(`${BASE_URL}`, { status: 302 });
        }

        // ── SUBSCRIPTION GATE (enable when ready) ───────────────────────────
        // Uncomment this block to restrict short links to active paid subscribers:
        //
        // const user = await UserModel.findById(seller.userId).select("paxAI.plan paxAI.planStatus").lean();
        // const isSubscribed = user?.paxAI?.planStatus === "active" && user?.paxAI?.plan !== "free";
        // if (!isSubscribed) {
        //     return NextResponse.redirect(`${BASE_URL}/pricing?ref=store-link`, { status: 302 });
        // }
        // ────────────────────────────────────────────────────────────────────

        const storeUrl = `${BASE_URL}/store/${seller.slug}`;

        console.log(`[shortlink] ✅ /s/${slug} → ${storeUrl}`);

        // 307 Temporary Redirect — appropriate since the seller slug could theoretically change
        return NextResponse.redirect(storeUrl, { status: 307 });

    } catch (err) {
        console.error("[shortlink] Error resolving store link:", err.message);
        return NextResponse.redirect(`${BASE_URL}`, { status: 302 });
    }
}
