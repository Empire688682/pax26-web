import { verifyToken } from "../../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { buildFullUserProfile } from "../../helper/buildFullUserProfile";


export async function POST() {
    return new NextResponse(null, ({ status: 200, headers: corsHeaders() }))
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "No Id found" }, { status: 404, headers: corsHeaders() })
        }

        const userObj = await buildFullUserProfile(userId);
        if (!userObj) {
            return NextResponse.json({ success: false, message: "Not authorized" }, { status: 404, headers: corsHeaders() })
        }

        return NextResponse.json({ success: true, profile: userObj }, { status: 200, headers: corsHeaders() })

    } catch (error) {
        console.log("FtechingUserErr: ", error.message);
        return NextResponse.json({ success: false, message: "An error occured" }, { status: 500, headers: corsHeaders() })
    }
}