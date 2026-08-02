import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../../helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
import { generateSlug } from "@/app/lib/store/generateSlug";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req, { params }) {
    try {
        await connectDb();
        const { id } = params;
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const product = await SellerProductModel.findById(id).lean();
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404, headers: corsHeaders() });
        }

        return NextResponse.json({ success: true, product }, { status: 200, headers: corsHeaders() });
    } catch (error) {
        console.error("GET /api/seller/products/[id] error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDb();
        const { id } = params;
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const data = await req.json();
        const { images, ...productData } = data;

        // Normalise slug if provided
        if (productData.slug) {
            productData.slug = generateSlug(productData.slug);
        }

        const updatePayload = { ...productData };

        // If images array is provided, replace inline images on the product doc
        if (Array.isArray(images)) {
            updatePayload.images = images.map(img => ({ url: img.url, publicId: img.publicId }));
        }

        const product = await SellerProductModel.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true }
        ).lean();

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404, headers: corsHeaders() });
        }

        // Sync SellerMediaModel (for Cloudinary visual search)
        if (Array.isArray(images)) {
            await SellerMediaModel.deleteMany({ productId: id });
            if (images.length > 0) {
                await Promise.all(images.map((img, index) =>
                    SellerMediaModel.create({
                        sellerId: product.sellerId,
                        productId: product._id,
                        url: img.url,
                        publicId: img.publicId,
                        isPrimary: index === 0,
                        type: "image",
                    })
                ));
            }
        }

        return NextResponse.json({ success: true, product }, { status: 200, headers: corsHeaders() });
    } catch (error) {
        console.error("PUT /api/seller/products/[id] error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDb();
        const { id } = params;
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const product = await SellerProductModel.findByIdAndDelete(id).lean();
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404, headers: corsHeaders() });
        }

        // Clean up associated media
        await SellerMediaModel.deleteMany({ productId: id });

        return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200, headers: corsHeaders() });
    } catch (error) {
        console.error("DELETE /api/seller/products/[id] error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
    }
}
