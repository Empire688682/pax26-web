import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const [user, profile] = await Promise.all([
      UserModel.findById(userId).select("whatsapp.displayPhone whatsapp.connected").lean(),
      ServiceProfileModel.findOne({ userId }).lean(),
    ]);

    if (!profile) {
      return NextResponse.json(
        {
          success: true,
          profile: {
            businessName: "",
            industry: "",
            description: "",
            businessDescription: "",
            tone: "friendly",
            autoReplyEnabled: true,
            followUpEnabled: true,
            followUpDelayMinutes: 30,
            currency: "NGN",
            workingHours: "",
            paymentDetails: [],
            services: [],
            faqs: [],
            whatsappNumber: user?.whatsapp?.displayPhone || "",
          },
        },
        { status: 200, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: {
          ...profile,
          businessDescription: profile.description || "",
          whatsappNumber: user?.whatsapp?.displayPhone || profile.whatsappNumber || "",
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("GET /api/automations/general-train error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDb();

    // Get user ID from token
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Verify user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Parse request body
    const data = await req.json();

    // Validate required fields (Property 9)
    const hasBusinessName = typeof data.businessName === "string" && data.businessName.trim() !== "";
    const hasIndustry = typeof data.industry === "string" && data.industry.trim() !== "";
    const hasServices = Array.isArray(data.services) && data.services.some(s => typeof s === "string" && s.trim() !== "");
    const hasFaqs = Array.isArray(data.faqs) && data.faqs.some(f => f && (f.question?.trim() || f.answer?.trim()));

    if (!hasBusinessName || !hasIndustry || (!hasServices && !hasFaqs)) {
      return NextResponse.json(
        { message: "Business name, industry, and at least one service or FAQ are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // One-type enforcement: deactivate seller profile when activating as service provider
    await SellerProfileModel.updateOne({ userId }, { $set: { isActive: false } });

    // Update or create ServiceProfile (BusinessProfile collection)
    const profile = await ServiceProfileModel.findOneAndUpdate(
      { userId },
      {
        ...data,
        aiTrained: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    user.paxAI.enabled = true;
    user.paxAI.trained = true;
    user.paxAI.businessType = "service"; // track active type
    user.paxAI.lastUpdated = new Date();
    // Set planStartedAt only the first time AI is activated (free plan start)
    if (!user.paxAI.planStartedAt) {
      user.paxAI.planStartedAt = new Date();
    }

    await user.save();

    return NextResponse.json(
      { success: true, profile },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error in POST /ai-train:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
