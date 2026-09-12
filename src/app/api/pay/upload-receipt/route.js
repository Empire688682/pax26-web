import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import mongoose from "mongoose";

import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import { sendSalesNotification } from "@/app/lib/salesNotificationService";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
    await connectDb();
    try {
        const body = await req.json();
        const { orderId, orderCode, receiptUrl, publicId } = body;

        const codeOrId = orderId || orderCode;
        if (!codeOrId || !receiptUrl) {
            return NextResponse.json(
                { success: false, message: "Order identifier and receipt URL are required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(codeOrId);
        const query = isObjectId ? { $or: [{ _id: codeOrId }, { orderCode: codeOrId }] } : { orderCode: codeOrId };

        const order = await SellerOrderModel.findOneAndUpdate(
            query,
            {
                $set: {
                    paymentReceiptUrl: receiptUrl,
                    paymentReceiptPublicId: publicId || "",
                    paymentReceiptSubmittedAt: new Date(),
                    status: "pending",
                },
            },
            { new: true }
        );

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404, headers: corsHeaders() }
            );
        }

        // Trigger notification to seller mobile app & channels
        if (order.sellerId) {
            const sellerProfile = await SellerProfileModel.findById(order.sellerId).lean();
            if (sellerProfile?.userId) {
                const prodSummary = order.items?.length
                    ? order.items.map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`).join(", ")
                    : "Order Item";

                sendSalesNotification(sellerProfile.userId, {
                    orderId: order._id.toString(),
                    customerName: order.customerName || order.customerPhone,
                    productName: prodSummary,
                    amountPaid: order.totalPrice,
                    deliveryFee: order.deliveryFee,
                    deliveryLocation: order.deliveryLocation || order.deliveryAddress || "",
                    isConfirmed: false,
                }).catch(err => console.warn("Receipt push notification error:", err?.message));
            }
        }

        return NextResponse.json(
            { success: true, message: "Payment receipt uploaded successfully", order },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Error uploading receipt:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500, headers: corsHeaders() }
        );
    }
}