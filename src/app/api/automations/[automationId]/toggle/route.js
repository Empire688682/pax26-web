import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";
import BusinessProfileModel from "@/app/ults/models/BusinessProfileModel";

export async function OPTIONS() {
    return new NextResponse(null, {status: 200, headers: corsHeaders()});
}

export async function PATCH(req, { params }) {
  try {
    await connectDb();

    const { automationId } = await params;

    // 🔐 Get user from token
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 401, headers: corsHeaders() }
      );
    };

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    };

    const userBussinessProfile = await BusinessProfileModel.findOne({ userId: user._id });

    if(!userBussinessProfile){
      return NextResponse.json(
        { success: false, message: "Business profile not found. Please create a business profile by train PaxAI to use automations." },
        { status: 404, headers: corsHeaders() }
      );
    }
    
    if (!userBussinessProfile.aiTrained) {
      return NextResponse.json(
        { success: false, message: "PaxAI not trained. Please train PaxAI to use automations." },
        { status: 403, headers: corsHeaders() }
      );
    }

    const userAutomation = await UserAutomationModel.findOne({
      userId: user._id,
    });

    if (!userAutomation) {
      return NextResponse.json(
        { success: false, message: "User automation config not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const automation = userAutomation.automations.find(
      (a) => a.automationId === automationId
    );

    if (!automation) {
      return NextResponse.json(
        { success: false, message: "Automation not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 🔄 Toggle
    automation.enabled = !automation.enabled;

    await userAutomation.save();

    return NextResponse.json({
      success: true,
      message: `Automation ${
        automation.enabled ? "enabled" : "disabled"
      } successfully`,
      data: automation,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
