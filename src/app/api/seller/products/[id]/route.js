import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../../helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
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

        const product = await SellerProductModel.findById(id);
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404, headers: corsHeaders() });
        }

        const images = await SellerMediaModel.find({ productId: id });

        return NextResponse.json({ 
            success: true, 
            product: {
                ...product.toObject(),
                images: images
            } 
        }, { status: 200, headers: corsHeaders() });
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

        const product = await SellerProductModel.findByIdAndUpdate(id, productData, { new: true });
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404, headers: corsHeaders() });
        }

        // Handle images update
        if (images) {
            // Simple strategy: delete old and create new, or just manage based on what's provided
            // For now, let's just update the media records if they are different
            // Actually, a simpler way for a "little dashboard" is to just replace them if provided
            await SellerMediaModel.deleteMany({ productId: id });
            await Promise.all(images.map((img, index) => 
                SellerMediaModel.create({
                    sellerId: product.sellerId,
                    productId: product._id,
                    url: img.url,
                    publicId: img.publicId,
                    isPrimary: index === 0,
                    type: "image"
                })
            ));
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

        const product = await SellerProductModel.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404, headers: corsHeaders() });
        }

        // Delete associated media
        await SellerMediaModel.deleteMany({ productId: id });

        return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200, headers: corsHeaders() });
    } catch (error) {
        console.error("DELETE /api/seller/products/[id] error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders() });
    }
}
