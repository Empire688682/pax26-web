import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import AdminAutomationModel from "@/app/ults/models/AdminAutomationModel";
import { NextResponse } from "next/server";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";
import { verifyToken } from "../../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";


export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}


export async function GET(req) {
  console.log("Get: ", "get all automations")
  await connectDb();
console.log("Get: ", "after DB")
  try {
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

    // ✅ Get user's automation doc
    let userAutomation = await UserAutomationModel.findOne({ userId });

    // ✅ If first time, create empty doc
    if (!userAutomation) {
      userAutomation = await UserAutomationModel.create({
        userId,
        automations: []
      });
    }

    console.log("userAutomation: ", userAutomation.automations)

    // ✅ Get admin automations
    const adminAutomations = await AdminAutomationModel.find({ active: true });

    // --- SYNC LOGIC ---

    const userAutoIds = userAutomation.automations.map(a => a.automationId);

    // 1️⃣ Add missing automations
    const missing = adminAutomations.filter(
      a => !userAutoIds.includes(a._id.toString())
    );

    if (missing.length > 0) {
      userAutomation.automations.push(
        ...missing.map(a => ({
          automationId: a._id.toString(),
          type: a.type,
          enabled: a.defaultEnabled || false
        }))
      );
    }

    // 2️⃣ Remove deleted automations
    const validAdminIds = adminAutomations.map(a => a._id.toString());

    userAutomation.automations =
      userAutomation.automations.filter(a =>
        validAdminIds.includes(a.automationId)
      );

    await userAutomation.save();

    // --- MERGE RESPONSE ---

    const merged = adminAutomations.map(admin => {
      const userState = userAutomation.automations.find(
        u => u.automationId === admin._id.toString()
      );

      return {
        automationId: admin._id,
        type: admin.type,
        name: admin.name,
        description: admin.description,
        enabled: userState?.enabled || false,
        runCount: userState?.runCount || 0
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: merged.length,
        automations: merged,
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
