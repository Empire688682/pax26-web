import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import BusinessProfileModel from "@/app/ults/models/BusinessProfileModel";
import { verifyToken } from "../../helper/VerifyToken";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "Unauthorized" }),
                { status: 401, headers: corsHeaders() }
            );
        }
        const profile = await BusinessProfileModel.findOne({ userId });
        if (!profile) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "Profile not found" }),
                { status: 404, headers: corsHeaders() }
            );
        }
        return new NextResponse(
            JSON.stringify({ success: true, profile }),
            { status: 200, headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Error verifying token:", error);
        return new NextResponse(
            JSON.stringify({ success: false, message: "An error occured" }),
            { status: 401, headers: corsHeaders() }
        );
    }
}