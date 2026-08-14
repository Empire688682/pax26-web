import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
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
            UserModel.findById(userId).select("whatsapp.displayPhone whatsapp.connected").lean(),
            SellerProfileModel.findOne({ userId }).lean(),
        ]);

        const whatsappNumber = user?.whatsapp?.displayPhone;
        if (!user?.whatsapp?.connected || !whatsappNumber) {
            return NextResponse.json(
                { success: false, message: "Seller whatsapp not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        // First-time sellers have no profile yet — return empty shell (not 404)
        if (!existingProfile) {
            return NextResponse.json(
                {
                    success: true,
                    profile: {
                        whatsappNumber,
                        businessName: "",
                        businessDescription: "",
                        industry: "",
                        tone: "friendly",
                        autoReplyEnabled: true,
                        followUpEnabled: true,
                        followUpDelayMinutes: 30,
                        currency: "NGN",
                        workingHours: "",
                        onlineStoreUrl: "",
                        liveLocation: "",
                        slug: "",
                        logoUrl: "",
                        storeTheme: "classic",
                        emailSalesAlerts: true,
                        spamAutoHandoff: true,
                        spamThreshold: 10,
                        promoAnnouncement: { enabled: false, text: "", badgeText: "PROMO" },
                        paymentDetails: [],
                        products: [],
                    },
                },
                { status: 200, headers: corsHeaders() }
            );
        }

        let profile = existingProfile;
        if (profile.whatsappNumber !== whatsappNumber) {
            profile = await SellerProfileModel.findOneAndUpdate(
                { userId },
                { $set: { whatsappNumber } },
                { new: true }
            ).lean();
        }

        const products = await SellerProductModel.find({
            sellerId: profile._id,
        }).lean();

        // Single batched media query — no N+1.
        const enrichedProducts = await attachMediaToProducts(products);

        return NextResponse.json(
            {
                success: true,
                profile: {
                    ...profile,
                    onlineStoreUrl: profile.onlineStoreUrl ?? "",
                    liveLocation: profile.liveLocation ?? "",
                    slug: profile.slug ?? "",
                    logoUrl: profile.logoUrl ?? "",
                    storeTheme: profile.storeTheme ?? "classic",
                    emailSalesAlerts: profile.emailSalesAlerts !== false,
                    spamAutoHandoff: profile.spamAutoHandoff !== false,
                    spamThreshold: profile.spamThreshold ?? 10,
                    promoAnnouncement: profile.promoAnnouncement ?? { enabled: false, text: "", badgeText: "PROMO" },
                    products: enrichedProducts,
                },
            },
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

        const user = await UserModel.findById(userId);
        const whatsappNumber = user?.whatsapp?.displayPhone;
        if (!user?.whatsapp?.connected || !whatsappNumber) {
            return NextResponse.json(
                { success: false, message: "Seller whatsapp not found. Connect WhatsApp before saving products." },
                { status: 400, headers: corsHeaders() }
            );
        }

        // ── Plan gate: storefrontEnabled ──────────────────────────
        const storefrontEnabled = user.paxAI?.storefrontEnabled ?? true; // default on for all
        if (!storefrontEnabled) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your current plan does not include access to the storefront feature. Please upgrade your plan.",
                    upgradeRequired: true,
                },
                { status: 403, headers: corsHeaders() }
            );
        }

        const { products, ...profileData } = await req.json();

        // Explicitly extract the new presence fields so they're always included in the update
        const { onlineStoreUrl, liveLocation, slug, logoUrl, storeTheme, emailSalesAlerts, spamAutoHandoff, spamThreshold, promoAnnouncement, ...restProfileData } = profileData;

        // 1. Upsert profile — use $set to avoid document replacement and bypass runValidators issues.
        const profile = await SellerProfileModel.findOneAndUpdate(
            { userId },
            {
                $set: {
                    ...restProfileData,
                    ...(onlineStoreUrl !== undefined && { onlineStoreUrl }),
                    ...(liveLocation !== undefined && { liveLocation }),
                    ...(slug && typeof slug === "string" && { slug: slug.toLowerCase().trim() }),
                    ...(logoUrl !== undefined && { logoUrl }),
                    ...(storeTheme && typeof storeTheme === "string" && { storeTheme }),
                    ...(emailSalesAlerts !== undefined && { emailSalesAlerts }),
                    ...(spamAutoHandoff !== undefined && { spamAutoHandoff }),
                    ...(spamThreshold !== undefined && { spamThreshold: parseInt(spamThreshold) || 10 }),
                    ...(promoAnnouncement !== undefined && { promoAnnouncement }),
                    whatsappNumber,
                    userId,
                    lastUpdated: new Date(),
                },
            },
            { upsert: true, new: true }
        ).lean();

        if (!profile) throw new Error("Failed to save profile");

        const sellerId = profile._id;

        // 2. Handle products.
        if (Array.isArray(products) && products.length > 0) {
            const incomingIds = products
                .filter((p) => p._id)
                .map((p) => p._id.toString());

            // Delete products removed by the seller.
            await SellerProductModel.deleteMany({
                sellerId,
                ...(incomingIds.length > 0 && { _id: { $nin: incomingIds } }),
            });

            // Split into updates and inserts so we can track new _ids.
            const existingProducts = products.filter((p) => p._id);
            const newProducts = products.filter((p) => !p._id);

            const buildProductData = (prod) => ({
                sellerId,
                name: prod.name,
                price: prod.price,
                description: prod.description,
                category: prod.category,
                tags: prod.tags,
                stock: prod.stock,
                images: prod.images ?? [],
                isAvailable: prod.isAvailable ?? true,
                discountPrice: prod.discountPrice,
                deliveryFee: prod.deliveryFee,
                deliveryTimeFrame: prod.deliveryTimeFrame,
                locationNotes: prod.locationNotes,
                isPhysical: prod.isPhysical ?? true,
            });

            // Bulk update existing products.
            if (existingProducts.length > 0) {
                const updateOps = existingProducts.map((prod) => ({
                    updateOne: {
                        filter: { _id: prod._id },
                        update: { $set: buildProductData(prod) },
                        upsert: true,
                    },
                }));
                await SellerProductModel.bulkWrite(updateOps, { ordered: false });
            }

            // Insert new products and capture returned _ids.
            let insertedProducts = [];
            if (newProducts.length > 0) {
                const docsToInsert = newProducts.map(buildProductData);
                insertedProducts = await SellerProductModel.insertMany(docsToInsert, {
                    ordered: false,
                });
            }

            // Wipe old media for this seller's products.
            const allSavedIds = [
                ...incomingIds,
                ...insertedProducts.map((p) => p._id.toString()),
            ];

            await SellerMediaModel.deleteMany({
                productId: { $in: allSavedIds },
            });

            // Build media docs — existing products matched by _id, new ones by index.
            const mediaDocs = [];

            for (const prod of existingProducts) {
                if (!Array.isArray(prod.images) || prod.images.length === 0) continue;
                prod.images.forEach((img, index) => {
                    mediaDocs.push({
                        sellerId,
                        productId: prod._id,
                        url: img.url,
                        publicId: img.publicId,
                        type: "image",
                        isPrimary: index === 0,
                    });
                });
            }

            newProducts.forEach((prod, i) => {
                if (!Array.isArray(prod.images) || prod.images.length === 0) return;
                const savedDoc = insertedProducts[i];
                if (!savedDoc) return;
                prod.images.forEach((img, index) => {
                    mediaDocs.push({
                        sellerId,
                        productId: savedDoc._id,
                        url: img.url,
                        publicId: img.publicId,
                        type: "image",
                        isPrimary: index === 0,
                    });
                });
            });

            if (mediaDocs.length > 0) {
                await SellerMediaModel.insertMany(mediaDocs, { ordered: false });
            }
        } else if (Array.isArray(products) && products.length === 0) {
            // Seller explicitly cleared all products.
            await SellerProductModel.deleteMany({ sellerId });
        }

        // 3. Update paxAI training status — one-type enforcement: deactivate service profile.
        if (user.paxAI) {
            user.paxAI.lastUpdated = Date.now();
            user.paxAI.trained = true;
            user.paxAI.businessType = "seller"; // seller is now the active type
            await user.save();
        }

        // Deactivate service profile so triggerAIResponse uses seller
        await ServiceProfileModel.updateOne(
            { userId },
            { $set: { whatsappEnabled: false, aiTrained: false } }
        );

        // 4. Return final state.
        const finalProducts = await SellerProductModel.find({ sellerId }).lean();
        const enrichedFinal = await attachMediaToProducts(finalProducts);

        return NextResponse.json(
            { success: true, profile: { ...profile, products: enrichedFinal } },
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