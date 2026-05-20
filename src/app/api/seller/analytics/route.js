import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerLeadModel from "@/app/ults/models/SellerLeadModel";
import UserModel from "@/app/ults/models/UserModel";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders() });
        }

        const plan = user.paxAI?.plan || "free";
        if (plan === "free") {
            return NextResponse.json({ success: false, message: "Sales Dashboard is not available on Free plan" }, { status: 403, headers: corsHeaders() });
        }

        const sellerProfile = await SellerProfileModel.findOne({ userId });
        if (!sellerProfile) {
            return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404, headers: corsHeaders() });
        }

        const { searchParams } = new URL(req.url);
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");
        const exportFormat = searchParams.get("export"); // e.g. "csv" or "json"

        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30);

        let start = startDateParam ? new Date(startDateParam) : defaultStart;
        let end = endDateParam ? new Date(endDateParam) : new Date();

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return NextResponse.json(
                { success: false, message: "Invalid date range" },
                { status: 400, headers: corsHeaders() }
            );
        }

        end.setHours(23, 59, 59, 999);

        // Fetch orders in date range
        const query = {
            sellerId: sellerProfile._id,
            createdAt: { $gte: start, $lte: end }
        };

        const orders = await SellerOrderModel.find(query)
            .populate({ path: "productId", model: SellerProductModel, select: "name price", strictPopulate: false })
            .sort({ createdAt: -1 })
            .lean();

        // If export requested
        if (exportFormat === "csv") {
            let csvContent = "Order ID,Customer Name,Customer Phone,Product,Quantity,Total Price,Status,Date\n";
            orders.forEach(order => {
                const orderId = order._id.toString();
                const customerName = (order.customerName || "").replace(/,/g, " ");
                const customerPhone = order.customerPhone || "";
                const productName = order.productId ? (order.productId.name || "Product").replace(/,/g, " ") : "Unknown Product";
                const quantity = order.quantity || 1;
                const totalPrice = order.totalPrice || 0;
                const status = order.status || "";
                const date = order.createdAt.toISOString();
                csvContent += `${orderId},${customerName},${customerPhone},${productName},${quantity},${totalPrice},${status},${date}\n`;
            });

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    ...corsHeaders(),
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename=sales_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`
                }
            });
        }

        // Aggregate Metrics:
        // 1. Revenue
        const successfulOrders = orders.filter(o => ["confirmed", "paid", "delivered"].includes(o.status));
        const pendingOrders = orders.filter(o => o.status === "pending");
        const failedOrders = orders.filter(o => o.status === "cancelled");

        const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalOrders = orders.length;

        // Today, Weekly, Monthly Revenue (from all successful orders ever)
        const allSuccessfulOrders = await SellerOrderModel.find({
            sellerId: sellerProfile._id,
            status: { $in: ["confirmed", "paid", "delivered"] }
        });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todaySales = allSuccessfulOrders.filter(o => o.createdAt >= startOfToday).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const weeklySales = allSuccessfulOrders.filter(o => o.createdAt >= startOfWeek).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const monthlySales = allSuccessfulOrders.filter(o => o.createdAt >= startOfMonth).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalSales = allSuccessfulOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        // conversionRate = totalOrders / totalLeads
        const totalLeads = await SellerLeadModel.countDocuments({ sellerId: sellerProfile._id });
        const conversionRate = totalLeads > 0 ? ((successfulOrders.length / totalLeads) * 100).toFixed(1) : 0;

        // averageOrderValue
        const averageOrderValue = successfulOrders.length > 0 ? (totalRevenue / successfulOrders.length).toFixed(2) : 0;

        // repeatCustomers: Count of customers with > 1 successful orders
        const customerOrderCounts = {};
        allSuccessfulOrders.forEach(o => {
            customerOrderCounts[o.customerPhone] = (customerOrderCounts[o.customerPhone] || 0) + 1;
        });
        const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

        // Top Selling Products
        const productSales = {};
        successfulOrders.forEach(o => {
            const product = o.productId;
            const key = product?._id?.toString() || product?.toString() || "Unknown";
            if (!productSales[key]) {
                productSales[key] = {
                    id: key,
                    name: product?.name || "Product",
                    count: 0,
                    revenue: 0,
                };
            }
            productSales[key].count += o.quantity || 1;
            productSales[key].revenue += o.totalPrice || 0;
        });

        // Fetch names for top products
        const topProductsList = Object.values(productSales);
        // Sort by revenue descending
        topProductsList.sort((a, b) => b.revenue - a.revenue);

        // Sales Trend Chart (group by date)
        const trendDataMap = {};
        // Initialize dates in range with 0 to ensure trend line doesn't have gaps
        let tempDate = new Date(start);
        while (tempDate <= end) {
            const dateStr = tempDate.toISOString().split("T")[0];
            trendDataMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
            tempDate.setDate(tempDate.getDate() + 1);
        }

        successfulOrders.forEach(o => {
            const dateStr = o.createdAt.toISOString().split("T")[0];
            if (trendDataMap[dateStr]) {
                trendDataMap[dateStr].revenue += o.totalPrice || 0;
                trendDataMap[dateStr].orders += 1;
            }
        });
        const salesTrend = Object.values(trendDataMap).sort((a, b) => a.date.localeCompare(b.date));

        const pendingOrdersAll = await SellerOrderModel.find({
            sellerId: sellerProfile._id,
            status: "pending",
        })
            .populate({ path: "productId", model: SellerProductModel, select: "name price", strictPopulate: false })
            .sort({ createdAt: -1 })
            .lean();

        const confirmedInRange = orders.filter((o) => o.status !== "pending");
        const recentOrdersMerged = [
            ...pendingOrdersAll,
            ...confirmedInRange.filter(
                (o) => !pendingOrdersAll.some((p) => p._id.toString() === o._id.toString())
            ),
        ].slice(0, 15);

        return NextResponse.json({
            success: true,
            plan,
            metrics: {
                totalRevenue,
                totalOrders,
                successfulOrdersCount: successfulOrders.length,
                pendingOrdersCount: pendingOrders.length,
                failedOrdersCount: failedOrders.length,
                todaySales,
                weeklySales,
                monthlySales,
                totalSales,
                conversionRate,
                averageOrderValue,
                repeatCustomers
            },
            pendingOrders: pendingOrdersAll,
            recentOrders: recentOrdersMerged,
            topProducts: topProductsList.slice(0, 5),
            salesTrend
        }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.error("Sales Analytics API error:", error?.message || error);
        return NextResponse.json(
            { success: false, message: "Internal server error", detail: error?.message },
            { status: 500, headers: corsHeaders() }
        );
    }
}
