/**
 * /api/s/[slug]
 *
 * Public short-link redirect handler.
 * No authentication required — this is the public redirect endpoint.
 *
 * GET /api/s/x7k2qp
 *   → Looks up the slug in ShortLink collection
 *   → If found & not expired → 307 redirect to targetUrl
 *   → If not found or expired → 302 redirect to home
 *
 * Also increments the click counter for lightweight analytics (fire-and-forget).
 */

import { NextResponse } from "next/server";
import { connectDb } from "../../../ults/db/ConnectDb.js";
import ShortLinkModel from "../../../ults/models/ShortLinkModel.js";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pax26.com";

export async function GET(request, { params }) {
    const { slug } = params;

    if (!slug || typeof slug !== "string") {
        return NextResponse.redirect(`${BASE_URL}`, { status: 302 });
    }

    try {
        await connectDb();

        const link = await ShortLinkModel.findOne({
            slug: slug.toLowerCase().trim(),
            expiresAt: { $gt: new Date() }, // exclude expired links
        }).lean();

        if (!link) {
            console.log(`[shortlink] Slug not found or expired: ${slug}`);
            // Redirect to home — friendly fallback
            return NextResponse.redirect(`${BASE_URL}`, { status: 302 });
        }

        // Fire-and-forget click increment — don't block the redirect
        ShortLinkModel.updateOne(
            { _id: link._id },
            { $inc: { clicks: 1 } }
        ).catch(err => console.warn("[shortlink] Click increment failed:", err.message));

        console.log(`[shortlink] ✅ Redirecting ${slug} → ${link.targetUrl.slice(0, 60)}...`);

        // 307 Temporary Redirect — preserves HTTP method, appropriate for session URLs
        return NextResponse.redirect(link.targetUrl, { status: 307 });

    } catch (err) {
        console.error("[shortlink] Error resolving short link:", err.message);
        return NextResponse.redirect(`${BASE_URL}`, { status: 302 });
    }
}
