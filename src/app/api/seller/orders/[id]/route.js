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

        const order = await SellerOrderModel.findOne({ _id: id, sellerId: sellerProfile._id });
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404, headers: corsHeaders() });
        }

        if (status === "confirmed" && !order.paymentReceiptUrl) {
            return NextResponse.json(
                { success: false, message: "Cannot confirm order without a customer payment receipt." },
                { status: 400, headers: corsHeaders() }
            );
        }

        const previousStatus = order.status;
        order.status = status;

        if (["confirmed", "paid", "delivered"].includes(status) && !order.confirmedAt) {
            order.confirmedAt = new Date();
            order.confirmedBy = userId;
        }

        await order.save();

        if (
            ["confirmed", "paid", "delivered"].includes(status) &&
            !["confirmed", "paid", "delivered"].includes(previousStatus)
        ) {
            sellerProfile.totalSalesCount += 1;
            sellerProfile.totalSalesAmount += order.totalPrice || 0;
            await sellerProfile.save();

            await sendSalesNotification(userId, {
                orderId: order._id.toString(),
                customerName: order.customerName || order.customerPhone,
                productName: "Order confirmed",
                amountPaid: order.totalPrice,
            });
        }

        return NextResponse.json({ success: true, order }, { headers: corsHeaders() });
    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500, headers: corsHeaders() });
    }
}
