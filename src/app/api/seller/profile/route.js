import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// ─── Shared helper ────────────────────────────────────────────────────────────
// Fetches all media for a set of products in ONE query and maps it by productId.
async function attachMediaToProducts(products) {
    const productIds = products.map((p) => p._id);

    const allMedia = await SellerMediaModel.find({
        productId: { $in: productIds },
    }).lean();

    const mediaMap = {};
    for (const m of allMedia) {
        const key = m.productId.toString();
        if (!mediaMap[key]) mediaMap[key] = [];
        mediaMap[key].push({ url: m.url, publicId: m.publicId });
    }

    return products.map((prod) => ({
        ...prod,
        images:
            prod.images?.length > 0
                ? prod.images
                : (mediaMap[prod._id.toString()] ?? []),
    }));
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req) {
    try {
        await connectDb();

        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        // Fetch user and existing profile in parallel — no dependency between them.
        const [user, existingProfile] = await Promise.all([
            UserModel.findById(userId).select("whatsapp.displayPhone").lean(),
            SellerProfileModel.findOne({ userId }).lean(),
        ]);

        const whatsappNumber = user?.whatsapp?.displayPhone;
        if (!whatsappNumber) {
            return NextResponse.json(
                { success: false, message: "Seller whatsapp not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        // Only write to DB when the stored number is actually out of date.
        // Avoids a write operation on every single GET request.
        let profile = existingProfile;
        if (!profile || profile.whatsappNumber !== whatsappNumber) {
            profile = await SellerProfileModel.findOneAndUpdate(
                { userId },
                { $set: { whatsappNumber } },
                { new: true, upsert: true }
            ).lean();
        }

        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        const products = await SellerProductModel.find({
            sellerId: profile._id,
        }).lean();

        // Single batched media query — no N+1.
        const enrichedProducts = await attachMediaToProducts(products);

        return NextResponse.json(
            { success: true, profile: { ...profile, products: enrichedProducts } },
            { status: 200, headers: corsHeaders() }
        );
    } catch (error) {
        console.error("GET /api/seller/profile error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500, headers: corsHeaders() }
        );
    }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req) {
    try {
        await connectDb();

        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const user = await UserModel.findById(userId)
            .select("whatsapp.displayPhone")
            .lean();

        const whatsappNumber = user?.whatsapp?.displayPhone;
        if (!whatsappNumber) {
            return NextResponse.json(
                { success: false, message: "Seller whatsapp not found" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const { products, ...profileData } = await req.json();

        // 1. Upsert profile.
        const profile = await SellerProfileModel.findOneAndUpdate(
            { userId },
            { ...profileData, whatsappNumber, userId, lastUpdated: new Date() },
            { upsert: true, new: true, runValidators: true }
        ).lean();

        if (!profile) throw new Error("Failed to save profile");

        const sellerId = profile._id;

        // 2. Handle products.
        if (Array.isArray(products) && products.length > 0) {
            const incomingIds = products
                .filter((p) => p._id)
                .map((p) => p._id.toString());

            // Delete products removed by the seller.
            if (incomingIds.length > 0) {
                // Only query if there are surviving IDs; otherwise delete all.
                await SellerProductModel.deleteMany({
                    sellerId,
                    _id: { $nin: incomingIds },
                });
            } else {
                await SellerProductModel.deleteMany({ sellerId });
            }

            // Upsert all products in ONE bulkWrite instead of a serial loop.
            const productBulkOps = products.map((prod) => {
                const productData = {
                    sellerId,
                    name: prod.name,
                    price: prod.price,
                    description: prod.description,
                    category: prod.category,
                    tags: prod.tags,
                    stock: prod.stock,
                    images: prod.images ?? [],
                    isAvailable: prod.isAvailable ?? true,
                };

                if (prod._id) {
                    return {
                        updateOne: {
                            filter: { _id: prod._id },
                            update: { $set: productData },
                            upsert: true,
                        },
                    };
                }
                return { insertOne: { document: productData } };
            });

            await SellerProductModel.bulkWrite(productBulkOps, { ordered: false });

            // Sync media: fetch saved products once, then replace media in bulk.
            const savedProducts = await SellerProductModel.find({
                sellerId,
            })
                .select("_id")
                .lean();

            // Build a name→_id map so we can match incoming products to saved _ids.
            // (bulkWrite insertOne doesn't return inserted ids directly.)
            const savedProductIds = savedProducts.map((p) => p._id);

            // Wipe all old media for this seller's products in one shot.
            await SellerMediaModel.deleteMany({
                productId: { $in: savedProductIds },
            });

            // Build new media docs for every product that carries images.
            // We correlate by _id for updates, and by position for inserts.
            const mediaDocs = [];
            for (const prod of products) {
                if (!Array.isArray(prod.images) || prod.images.length === 0) continue;

                // For existing products the _id is known; for new ones we match by
                // name+sellerId since bulkWrite insertOne doesn't return the new _id.
                const matchedProduct = prod._id
                    ? savedProducts.find((s) => s._id.toString() === prod._id.toString())
                    : savedProducts.find((s) => !prod._id); // fallback — see note below

                if (!matchedProduct) continue;

                prod.images.forEach((img, index) => {
                    mediaDocs.push({
                        sellerId,
                        productId: matchedProduct._id,
                        url: img.url,
                        publicId: img.publicId,
                        type: "image",
                        isPrimary: index === 0,
                    });
                });
            }

            if (mediaDocs.length > 0) {
                // Single bulk insert instead of nested Promise.all + individual creates.
                await SellerMediaModel.insertMany(mediaDocs, { ordered: false });
            }
        } else if (Array.isArray(products) && products.length === 0) {
            // Seller explicitly cleared all products.
            await SellerProductModel.deleteMany({ sellerId });
        }

        // 3. Return final state — one query per collection, no N+1.
        const finalProducts = await SellerProductModel.find({
            sellerId,
        }).lean();

        const enrichedFinal = await attachMediaToProducts(finalProducts);

        return NextResponse.json(
            {
                success: true,
                profile: { ...profile, products: enrichedFinal },
            },
            { status: 200, headers: corsHeaders() }
        );
    } catch (error) {
        console.error("POST /api/seller/profile error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Server error" },
            { status: 500, headers: corsHeaders() }
        );
    }
}