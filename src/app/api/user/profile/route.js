import { verifyToken } from "../../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { buildFullUserProfile } from "../../helper/buildFullUserProfile";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        // Return 401 (not 404) so mobile Axios interceptor detects auth failure
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const userObj = await buildFullUserProfile(userId);
        if (!userObj) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 401, headers: corsHeaders() }
            );
        }

        return NextResponse.json({ success: true, profile: userObj }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.log("FetchingUserErr: ", error.message);
        return NextResponse.json(
            { success: false, message: "An error occurred" },
            { status: 500, headers: corsHeaders() }
        );
    }
}