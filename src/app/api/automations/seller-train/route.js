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

export async function PUT(req) {
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

    const whatsappNumber = user?.whatsapp?.displayPhone;
    if (!user?.whatsapp?.connected || !whatsappNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Connect WhatsApp before training your seller agent.",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const data = await req.json();
    const products = Array.isArray(data.products) ? data.products : [];

    const businessName = (data.businessName || "").toString().trim();
    const businessDescription = (
      data.businessDescription ||
      data.description ||
      ""
    )
      .toString()
      .trim();
    const industry = (data.industry || "").toString().trim();

    if (!businessName || !businessDescription || !industry) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business name, description, and industry are required before training.",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const isValidProducts =
      products.length > 0 &&
      products.some(
        (p) =>
          typeof p.name === "string" &&
          p.name.trim() !== "" &&
          typeof p.price === "number" &&
          isFinite(p.price)
      );

    if (!isValidProducts) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product with name and price is required",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Sanitize payment details so empty/invalid rows don't fail validators
    const paymentDetails = Array.isArray(data.paymentDetails)
      ? data.paymentDetails
          .filter(
            (p) =>
              p &&
              String(p.bankName || "").trim() &&
              /^\d{10}$/.test(String(p.accountNumber || "").trim())
          )
          .map((p) => ({
            label: p.label || "",
            bankName: String(p.bankName).trim(),
            accountNumber: String(p.accountNumber).trim(),
            accountName: p.accountName || "",
            active: p.active !== false,
          }))
      : [];

    // Upsert seller profile only with known schema fields
    const profile = await SellerProfileModel.findOneAndUpdate(
      { userId },
      {
        userId,
        businessName,
        businessDescription,
        industry,
        whatsappNumber,
        tone: data.tone || "salesy",
        autoReplyEnabled: data.autoReplyEnabled ?? true,
        followUpEnabled: data.followUpEnabled ?? true,
        followUpDelayMinutes: data.followUpDelayMinutes || 30,
        currency: data.currency || "NGN",
        workingHours: data.workingHours || "",
        paymentDetails,
        isActive: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    const sellerId = profile._id;

    // Persist products into SellerProduct (+ media) — not embedded on profile
    const incomingIds = products
      .filter((p) => p._id)
      .map((p) => p._id.toString());

    await SellerProductModel.deleteMany({
      sellerId,
      ...(incomingIds.length > 0 && { _id: { $nin: incomingIds } }),
    });

    const existingProducts = products.filter((p) => p._id);
    const newProducts = products.filter((p) => !p._id);

    const buildProductData = (prod) => ({
      sellerId,
      name: prod.name,
      price: prod.price,
      description: prod.description || "",
      category: prod.category || "",
      tags: Array.isArray(prod.tags) ? prod.tags : [],
      stock: prod.stock ?? 0,
      images: Array.isArray(prod.images)
        ? prod.images.filter((img) => img?.url && img?.publicId)
        : [],
      isAvailable: prod.isAvailable ?? true,
      discountPrice: prod.discountPrice,
      deliveryFee: prod.deliveryFee,
      deliveryTimeFrame: prod.deliveryTimeFrame,
      locationNotes: prod.locationNotes,
      isPhysical: prod.isPhysical ?? true,
    });

    if (existingProducts.length > 0) {
      await SellerProductModel.bulkWrite(
        existingProducts.map((prod) => ({
          updateOne: {
            filter: { _id: prod._id },
            update: { $set: buildProductData(prod) },
            upsert: true,
          },
        })),
        { ordered: false }
      );
    }

    let insertedProducts = [];
    if (newProducts.length > 0) {
      insertedProducts = await SellerProductModel.insertMany(
        newProducts.map(buildProductData),
        { ordered: false }
      );
    }

    const allSavedIds = [
      ...incomingIds,
      ...insertedProducts.map((p) => p._id.toString()),
    ];

    await SellerMediaModel.deleteMany({ productId: { $in: allSavedIds } });

    const mediaDocs = [];
    for (const prod of existingProducts) {
      if (!Array.isArray(prod.images) || prod.images.length === 0) continue;
      prod.images.forEach((img, index) => {
        if (!img?.url || !img?.publicId) return;
        mediaDocs.push({
          sellerId,
          productId: prod._id,
          url: img.url,
          publicId: img.publicId,
          type: "image",
          isPrimary: index === 0,
        });
      });
    }
    newProducts.forEach((prod, i) => {
      if (!Array.isArray(prod.images) || prod.images.length === 0) return;
      const savedDoc = insertedProducts[i];
      if (!savedDoc) return;
      prod.images.forEach((img, index) => {
        if (!img?.url || !img?.publicId) return;
        mediaDocs.push({
          sellerId,
          productId: savedDoc._id,
          url: img.url,
          publicId: img.publicId,
          type: "image",
          isPrimary: index === 0,
        });
      });
    });

    if (mediaDocs.length > 0) {
      await SellerMediaModel.insertMany(mediaDocs, { ordered: false });
    }

    // One-type enforcement
    await ServiceProfileModel.updateOne(
      { userId },
      { $set: { whatsappEnabled: false, aiTrained: false } }
    );

    user.paxAI.businessType = "seller";
    user.paxAI.enabled = true;
    user.paxAI.trained = true;
    user.paxAI.lastUpdated = new Date();
    if (!user.paxAI.planStartedAt) {
      user.paxAI.planStartedAt = new Date();
    }
    await user.save();

    const finalProducts = await SellerProductModel.find({ sellerId }).lean();

    return NextResponse.json(
      {
        success: true,
        profile: { ...profile.toObject(), products: finalProducts },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error in PUT /automations/seller-train:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
