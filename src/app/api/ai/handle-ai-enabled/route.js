
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() })
};

export async function PUT(req) {
    await connectDb();
    try {
        const userId  = await verifyToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID required" },
                { status: 400, headers: corsHeaders() },
            );
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 400, headers: corsHeaders() },
            );
        };

        // 🔁 Toggle AI status
        user.paxAI.enabled = !user.paxAI.enabled;

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: `AI ${user.paxAI.enabled ? "enabled" : "disabled"} successfully`,
                aiEnabled: user.paxAI.enabled,
            },
            { status: 200, headers: corsHeaders() }
        );

    } catch (error) {
        console.log("ERROR:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred" },
            { status: 500, headers: corsHeaders() },
        );
    }
}

