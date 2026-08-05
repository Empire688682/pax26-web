import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import AdminAutomationModel from "@/app/ults/models/AdminAutomationModel";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";

// Map automation types → plan feature flags on user.paxAI
const AUTOMATION_PLAN_GATES = {
  whatsapp_follow_up: "leadFollowupEnabled",
  follow_up:          "leadFollowupEnabled",
  sms_follow_up:      "leadFollowupEnabled",
  // AI chatbox types are gated by aiAgentEnabled (default true for all plans)
  // No explicit gate needed for broadcast — handled separately
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function PATCH(req, { params }) {
  try {
    await connectDb();

    const { automationId } = await params;

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const serviceProfile = await ServiceProfileModel.findOne({ userId: user._id });
    const sellerProfile  = await SellerProfileModel.findOne({ userId: user._id });
    const activeProfile  = serviceProfile || sellerProfile;

    if (!activeProfile) {
      return NextResponse.json(
        { success: false, message: "Business profile not found. Please create a business profile by training PaxAI to use automations." },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (serviceProfile && !serviceProfile.aiTrained && !sellerProfile) {
      return NextResponse.json(
        { success: false, message: "PaxAI not trained. Please train PaxAI to use automations." },
        { status: 403, headers: corsHeaders() }
      );
    }

    // ── Load the admin automation to know its type ─────────────
    const adminAutomation = await AdminAutomationModel.findById(automationId).lean();

    // ── Plan gate check ────────────────────────────────────────
    if (adminAutomation) {
      const automationType   = adminAutomation.type;
      const planFlagKey      = AUTOMATION_PLAN_GATES[automationType];

      if (planFlagKey) {
        const hasAccess = user.paxAI?.[planFlagKey] ?? false;
        if (!hasAccess) {
          // Map flag → human-readable plan name for the error message
          const FLAG_PLAN_MAP = {
            leadFollowupEnabled:      "Starter",
            leadQualificationEnabled: "Business",
            productRecommendations:   "Business",
          };
          const requiredPlan = FLAG_PLAN_MAP[planFlagKey] || "a higher";
          return NextResponse.json(
            {
              success: false,
              message: `"${adminAutomation.name}" requires the ${requiredPlan} plan or higher. Upgrade your plan to enable this automation.`,
              upgradeRequired: true,
              requiredPlan: requiredPlan.toLowerCase(),
            },
            { status: 403, headers: corsHeaders() }
          );
        }
      }
    }

    const userAutomation = await UserAutomationModel.findOne({ userId: user._id });

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

    // Toggle
    automation.enabled = !automation.enabled;
    await userAutomation.save();

    return NextResponse.json({
      success: true,
      message: `Automation ${automation.enabled ? "enabled" : "disabled"} successfully`,
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
