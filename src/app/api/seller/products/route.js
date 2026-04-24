import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
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

        const profile = await SellerProfileModel.findOne({ userId });
        if (!profile) {
            return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404, headers: corsHeaders() });
        }

        const products = await SellerProductModel.find({ sellerId: profile._id }).sort({ createdAt: -1 });

        // For each product, we might want to attach its primary image if we were using SellerMediaModel separately,
        // but the current frontend seems to expect images inside the product object based on StepRenderer.
        // Let's check how the frontend handles it.
        
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

        const profile = await SellerProfileModel.findOne({ userId });
        if (!profile) {
            return NextResponse.json({ success: false, message: "Seller profile required" }, { status: 400, headers: corsHeaders() });
        }

        const data = await req.json();
        const { images, ...productData } = data;

        const product = await SellerProductModel.create({
            ...productData,
            sellerId: profile._id
        });

        // Handle images if provided
        if (images && images.length > 0) {
            await Promise.all(images.map((img, index) => 
                SellerMediaModel.create({
                    sellerId: profile._id,
                    productId: product._id,
                    url: img.url,
                    publicId: img.publicId,
                    isPrimary: index === 0,
                    type: "image"
                })
            ));
        }

        return NextResponse.json({ success: true, product }, { status: 201, headers: corsHeaders() });
    } catch (error) {
        console.error("POST /api/seller/products error:", error);
        return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500, headers: corsHeaders() });
    }
}
