import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { NextResponse } from "next/server";
import dotenv from "dotenv";
import TransactionModel from "@/app/ults/models/TransactionModel";
import { verifyToken } from "../../helper/VerifyToken";

dotenv.config();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req, { params }) {
  await connectDb();
  const { id } = await params;
    try {
    // Auth user
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authorized" }, { status: 401, headers: corsHeaders() });
    }
    // Fetch transaction by ID
    const transaction = await TransactionModel.findOne({ _id: id, userId });
    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json({ success: true, data: transaction }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.log("Get Transaction By ID Error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong fetching transaction" }, { status: 500, headers: corsHeaders() });
  }
}
