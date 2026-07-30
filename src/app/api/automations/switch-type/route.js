import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerMediaModel from "@/app/ults/models/SellerMediaModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    await connectDb();

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const oldType = user.paxAI?.businessType;

    // Delete all data tied to the current type
    if (oldType === "seller") {
      const sellerProfile = await SellerProfileModel.findOne({ userId });
      if (sellerProfile) {
        await SellerProductModel.deleteMany({ sellerId: sellerProfile._id });
        await SellerMediaModel.deleteMany({ sellerId: sellerProfile._id });
        await SellerProfileModel.deleteOne({ userId });
      }
    } else if (oldType === "service") {
      await ServiceProfileModel.deleteOne({ userId });
    }

    // Reset to null — user must re-pick from the type picker
    user.paxAI.businessType = null;
    user.paxAI.enabled = false;
    user.paxAI.trained = false;
    user.paxAI.lastUpdated = new Date();
    await user.save();

    return NextResponse.json(
      { success: true, message: "Business type cleared. Please select a new type." },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error in POST /automations/switch-type:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear business type. Please try again." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
