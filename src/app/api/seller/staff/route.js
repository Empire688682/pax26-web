import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import PlanModel from "@/app/ults/models/PlanModel";
import StaffModel from "@/app/ults/models/StaffModel";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).select("paxAI").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const paxAI = user.paxAI || {};
    const planKey = paxAI.plan || "free";
    const planMeta = await PlanModel.findOne({ key: planKey }).lean();

    const isEnterprise = planKey === "enterprise";
    const isBusiness = planKey === "business";
    const multiStaffLimit = planMeta?.multiStaff ?? paxAI.multiStaff ?? (isEnterprise ? 10 : isBusiness ? 5 : 0);

    const staffList = await StaffModel.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        data: staffList,
        limit: multiStaffLimit,
        used: staffList.length,
        canInviteMore: multiStaffLimit > 0 && staffList.length < multiStaffLimit,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("GET /api/seller/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req) {
  await connectDb();

  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).select("paxAI").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const paxAI = user.paxAI || {};
    const planKey = paxAI.plan || "free";
    const planMeta = await PlanModel.findOne({ key: planKey }).lean();

    const isEnterprise = planKey === "enterprise";
    const isBusiness = planKey === "business";
    const multiStaffLimit = planMeta?.multiStaff ?? paxAI.multiStaff ?? (isEnterprise ? 10 : isBusiness ? 5 : 0);

    if (multiStaffLimit <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Multi-Staff Team Inboxes are only available on Business and Enterprise plans. Upgrade your workspace to add team members.",
          code: "UPGRADE_REQUIRED",
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    const currentStaffCount = await StaffModel.countDocuments({ ownerId: userId });
    if (currentStaffCount >= multiStaffLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `You have reached your plan limit of ${multiStaffLimit} staff inboxes. Upgrade to Enterprise to add more staff members.`,
          code: "LIMIT_REACHED",
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { name, email, phone, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Staff name and email are required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const newStaff = await StaffModel.create({
      ownerId: userId,
      name,
      email,
      phone: phone || "",
      role: role === "manager" ? "manager" : "agent",
      status: "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: `Staff member "${name}" added to your workspace inbox team!`,
        staff: newStaff,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("POST /api/seller/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
