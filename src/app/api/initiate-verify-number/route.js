import { connectDb } from "@/app/ults/db/ConnectDb";
import { UserModel } from "@/app/ults/models/UserModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { verifyToken } from "../../helper/VerifyToken";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
};

export async function POST(req) {
    await connectDb();
    try {
        const reqBody = await req.json();
        const {phoneNumber} = reqBody;
        if (!phoneNumber) {
          return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400, headers: corsHeaders() });
        }
        const userId = await verifyToken(req);
        if (!userId) {
          return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }
    } catch (error) {
        console.error("Initiate Verify Number Error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Initiate verify number failed",
          },
          { status: 500, headers: corsHeaders() }
        );
    }
}