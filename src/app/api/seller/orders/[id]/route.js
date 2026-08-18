import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerNotificationModel from "@/app/ults/models/SellerNotificationModel";
import { sendSalesNotification } from "@/app/lib/salesNotificationService";
import { sendCustomerOrderReceiptWhatsApp } from "@/app/lib/customerReceiptService";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function PATCH(req, { params }) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!["confirmed", "paid", "delivered", "cancelled"].includes(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status. Use confirmed, paid, delivered, or cancelled." },
                { status: 400, headers: corsHeaders() }
            );
        }

        const sellerProfile = await SellerProfileModel.findOne({ userId });
        if (!sellerProfile) {
            return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404, headers: corsHeaders() });
        }

        const order = await SellerOrderModel.findOne({ _id: id, sellerId: sellerProfile._id }).populate({ path: "productId", model: SellerProductModel, select: "name", strictPopulate: false });
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404, headers: corsHeaders() });
        }

        // Allow manual confirmation without a receipt if verified directly by the seller.

        const previousStatus = order.status;
        order.status = status;

        if (["confirmed", "paid", "delivered"].includes(status) && !order.confirmedAt) {
            order.confirmedAt = new Date();
            order.confirmedBy = userId;
        }

        await order.save();

        // Mark associated notifications as read when order is processed
        await SellerNotificationModel.updateMany(
            { userId, $or: [{ orderId: order._id.toString() }, { read: false }] },
            { read: true }
        );

        let customerReceiptResult = null;

        if (
            ["confirmed", "paid", "delivered"].includes(status) &&
            !["confirmed", "paid", "delivered"].includes(previousStatus)
        ) {
            sellerProfile.totalSalesCount = (sellerProfile.totalSalesCount || 0) + 1;
            sellerProfile.totalSalesAmount = (sellerProfile.totalSalesAmount || 0) + (order.totalPrice || 0);
            await sellerProfile.save();

            // Build product summary for notifications (e.g. "Bag 1, Bag 2, Bag 3" or "Bag 1 (2x), Bag 2 (1x)")
            const productSummary = (order.items && order.items.length > 0)
                ? order.items.map(i => `${i.name}${i.quantity > 1 ? ` (${i.quantity}x)` : ''}`).join(", ")
                : (order.productId?.name || "Confirmed Order");

            // 1. Notify seller (in-app, WhatsApp, and email)
            await sendSalesNotification(userId, {
                orderId: order._id.toString(),
                customerName: order.customerName || order.customerPhone,
                productName: productSummary,
                amountPaid: order.totalPrice,
                isConfirmed: true,
            });

            // 2. Send brand receipt confirmation message to customer via WhatsApp
            customerReceiptResult = await sendCustomerOrderReceiptWhatsApp(order._id);
        }

        return NextResponse.json({
            success: true,
            order,
            customerReceiptSent: customerReceiptResult?.success ?? false
        }, { headers: corsHeaders() });
    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500, headers: corsHeaders() });
    }
}
