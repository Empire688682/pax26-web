import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import mongoose from "mongoose";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req, { params }) {
    await connectDb();
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.json({ success: false, message: "Order code required" }, { status: 400, headers: corsHeaders() });
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(code);
        const query = isObjectId ? { $or: [{ orderCode: code }, { _id: code }] } : { orderCode: code };

        const order = await SellerOrderModel.findOne(query)
            .populate({
                path: "productId",
                model: SellerProductModel,
                select: "name price images",
                strictPopulate: false,
            })
            .lean();

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404, headers: corsHeaders() });
        }

        const sellerProfile = await SellerProfileModel.findById(order.sellerId)
            .select("businessName currency paymentDetails logoUrl slug")
            .lean();

        const activePayments = (sellerProfile?.paymentDetails || []).filter((p) => p.active !== false);

        // Standardize items array
        let items = order.items && order.items.length > 0 ? order.items : [];
        if (items.length === 0 && order.productId) {
            items = [{
                name: order.productId.name,
                price: order.productId.price || order.totalPrice,
                quantity: order.quantity || 1,
                imageUrl: order.productId.images?.[0]?.url || "",
            }];
        }

        return NextResponse.json({
            success: true,
            order: {
                _id: order._id.toString(),
                orderCode: order.orderCode || order._id.toString().slice(-6).toUpperCase(),
                customerName: order.customerName || "Customer",
                customerPhone: order.customerPhone,
                totalPrice: order.totalPrice || 0,
                items,
                deliveryLocation: order.deliveryLocation || "",
                status: order.status,
                paymentReceiptUrl: order.paymentReceiptUrl || null,
                paymentReceiptSubmittedAt: order.paymentReceiptSubmittedAt || null,
                createdAt: order.createdAt,
            },
            seller: {
                businessName: sellerProfile?.businessName || "Store",
                currency: sellerProfile?.currency || "NGN",
                logoUrl: sellerProfile?.logoUrl || null,
                paymentDetails: activePayments.map(p => ({
                    bankName: p.bankName,
                    accountNumber: p.accountNumber,
                    accountName: p.accountName,
                    label: p.label || "",
                })),
            },
        }, { headers: corsHeaders() });

    } catch (error) {
        console.error("Error fetching public order for payment:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500, headers: corsHeaders() });
    }
}
