import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import { sendSalesNotification } from "@/app/lib/salesNotificationService";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const { productId, customerPhone, customerName, quantity, totalPrice, deliveryFee, deliveryAddress, status } = await req.json();

        if (!productId || !customerPhone) {
            return NextResponse.json({ success: false, message: "Product and Customer Phone are required" }, { status: 400, headers: corsHeaders() });
        }

        const sellerProfile = await SellerProfileModel.findOne({ userId });
        if (!sellerProfile) {
            return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404, headers: corsHeaders() });
        }

        const newOrder = await SellerOrderModel.create({
            sellerId: sellerProfile._id,
            productId,
            customerPhone,
            customerName,
            quantity: quantity || 1,
            totalPrice: totalPrice || 0,
            deliveryFee: deliveryFee || 0,
            status: status || "pending",
            deliveryAddress: deliveryAddress || "",
        });

        const productSummary = (newOrder.items && newOrder.items.length > 0)
            ? newOrder.items.map(i => `${i.name}${i.quantity > 1 ? ` (${i.quantity}x)` : ''}`).join(", ")
            : "Product Order";

        // Update total sales metrics if the order is confirmed/paid
        if (["confirmed", "paid", "delivered"].includes(newOrder.status)) {
            sellerProfile.totalSalesCount = (sellerProfile.totalSalesCount || 0) + 1;
            sellerProfile.totalSalesAmount = (sellerProfile.totalSalesAmount || 0) + (newOrder.totalPrice || 0);
            await sellerProfile.save();

            // Trigger confirmed sale notification
            await sendSalesNotification(userId, {
                orderId: newOrder._id.toString(),
                customerName: newOrder.customerName || newOrder.customerPhone,
                productName: productSummary,
                amountPaid: newOrder.totalPrice,
                deliveryFee: newOrder.deliveryFee,
                isConfirmed: true,
            });
        } else {
            // Trigger potential sale notification (notifying seller to log in & confirm)
            await sendSalesNotification(userId, {
                orderId: newOrder._id.toString(),
                customerName: newOrder.customerName || newOrder.customerPhone,
                productName: productSummary,
                amountPaid: newOrder.totalPrice,
                deliveryFee: newOrder.deliveryFee,
                isConfirmed: false,
            });
        }

        return NextResponse.json({ success: true, order: newOrder }, { status: 201, headers: corsHeaders() });
    } catch (error) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500, headers: corsHeaders() });
    }
}
