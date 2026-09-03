/**
 * GET /api/billing/plans
 *
 * Returns all active plans from the database.
 * Public endpoint — no auth required so the upgrade screen can
 * always load plans even before the user logs in.
 */
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import PlanModel from "@/app/ults/models/PlanModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
    try {
        await connectDb();
        const plans = await PlanModel.find({ isActive: true })
            .sort({ price: 1 })
            .lean();

        return NextResponse.json(
            { success: true, plans },
            { status: 200, headers: corsHeaders() }
        );
    } catch (error) {
        console.error("GET /api/billing/plans error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load plans" },
            { status: 500, headers: corsHeaders() }
        );
    }
}
