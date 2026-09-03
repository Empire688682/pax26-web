import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
import UserModel from "@/app/ults/models/UserModel";
import { generateSlug, makeUniqueSlug } from "@/app/lib/store/generateSlug";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    try {
        await connectDb();
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const profile = await SellerProfileModel.findOne({ userId }).lean();
        if (!profile) {
            return NextResponse.json({ success: true, products: [] }, { status: 200, headers: corsHeaders() });
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const q = searchParams.get("q");
        const available = searchParams.get("available"); // "true" | "false" | undefined

        const filter = { sellerId: profile._id };
        if (category) filter.category = category;
        if (available !== null && available !== undefined) filter.isAvailable = available === "true";
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
                { tags: { $elemMatch: { $regex: q, $options: "i" } } },
            ];
        }

        const products = await SellerProductModel.find(filter).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, products }, { status: 200, headers: corsHeaders() });
    } catch (error) {
        console.error("GET /api/seller/products error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
    }
}

export async function POST(req) {
    try {
        await connectDb();
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const profile = await SellerProfileModel.findOne({ userId }).lean();
        if (!profile) {
            return NextResponse.json({ success: false, message: "Seller profile required" }, { status: 400, headers: corsHeaders() });
        }

        // ── Plan: enforce product limit ────────────────────────────
        const user = await UserModel.findById(userId).select("paxAI").lean();
        const productsLimit = user?.paxAI?.productsLimit ?? 20; // 0 = unlimited — Free:20, Starter:100, Business:500, Enterprise:0

        if (productsLimit > 0) {
            const currentCount = await SellerProductModel.countDocuments({ sellerId: profile._id });
            if (currentCount >= productsLimit) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `You have reached your plan's product limit of ${productsLimit}. Upgrade your plan to add more products.`,
                        limitReached: true,
                        currentCount,
                        productsLimit,
                    },
                    { status: 403, headers: corsHeaders() }
                );
            }
        }

        const data = await req.json();
        const { images, ...productData } = data;

        // Auto-generate slug from name if not provided
        let slug = productData.slug ? generateSlug(productData.slug) : generateSlug(productData.name || "");

        // Ensure slug is unique within this seller's catalogue
        if (slug) {
            const exists = await SellerProductModel.findOne({ sellerId: profile._id, slug }).lean();
            if (exists) {
                slug = makeUniqueSlug(productData.name || slug, { appendSuffix: true });
            }
        }

        const product = await SellerProductModel.create({
            ...productData,
            slug: slug || undefined,
            sellerId: profile._id,
        });

        // Handle images — store in product.images (inline) so the AI prompt can access them
        if (images && images.length > 0) {
            await SellerProductModel.findByIdAndUpdate(product._id, {
                $set: { images: images.map(img => ({ url: img.url, publicId: img.publicId })) },
            });
            // Also write to SellerMediaModel for Cloudinary visual search
            await Promise.all(images.map((img, index) =>
                SellerMediaModel.create({
                    sellerId: profile._id,
                    productId: product._id,
                    url: img.url,
                    publicId: img.publicId,
                    isPrimary: index === 0,
                    type: "image",
                })
            ));
        }

        const saved = await SellerProductModel.findById(product._id).lean();
        return NextResponse.json({ success: true, product: saved }, { status: 201, headers: corsHeaders() });
    } catch (error) {
        console.error("POST /api/seller/products error:", error);
        return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500, headers: corsHeaders() });
    }
}
