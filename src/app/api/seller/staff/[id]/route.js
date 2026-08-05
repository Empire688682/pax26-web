import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import StaffModel from "@/app/ults/models/StaffModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function DELETE(req, { params }) {
  await connectDb();

  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { id } = params;
    const deleted = await StaffModel.findOneAndDelete({ _id: id, ownerId: userId });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Staff member not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, message: `Staff member "${deleted.name}" removed.` },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("DELETE /api/seller/staff/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
