/**
 * POST /api/store/[slug]/checkout
 *
 * Creates (or replaces) an "awaiting_payment" order from the storefront cart.
 * This is the single source of truth for all orders — no order data is
 * reconstructed from WhatsApp conversation text.
 *
 * Flow:
 *   1. Validate cart items against live product catalogue (prices, availability)
 *   2. Cancel any existing "awaiting_payment" order for the same phone+seller
 *   3. Create new SellerOrder with status "awaiting_payment"
 *   4. Return orderCode + paymentDetails so the storefront can redirect to WhatsApp
 *
 * GET /api/store/[slug]/checkout?order=CODE
 *   Returns order data for cart pre-fill when customer wants to edit their order.
 */

import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import UserModel from "@/app/ults/models/UserModel";
import StorefrontSessionModel from "@/app/ults/models/StorefrontSessionModel";
import { verifySessionToken } from "@/app/lib/store/signSession";

const publicHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: publicHeaders() });
}

// ── GET: load existing order for cart pre-fill ────────────────────────────────
export async function GET(req, { params }) {
  try {
    await connectDb();
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const orderCode = searchParams.get("order");

    if (!orderCode) {
      return NextResponse.json({ success: false, message: "order param required" }, { status: 400, headers: publicHeaders() });
    }

    const profile = await SellerProfileModel.findOne({ slug: slug.toLowerCase().trim() }).lean();
    if (!profile) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404, headers: publicHeaders() });
    }

    const order = await SellerOrderModel.findOne({
      sellerId: profile._id,
      orderCode: orderCode.toUpperCase(),
      status: { $in: ["awaiting_payment", "pending"] },
    }).lean();

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found or already processed" }, { status: 404, headers: publicHeaders() });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderCode: order.orderCode,
        items: order.items,
        deliveryAddress: order.deliveryAddress || order.deliveryLocation || "",
        fulfillmentMethod: order.fulfillmentMethod || "delivery",
        totalPrice: order.totalPrice,
        deliveryFee: order.deliveryFee,
        status: order.status,
      },
    }, { status: 200, headers: publicHeaders() });

  } catch (err) {
    console.error("GET /checkout error:", err.message);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: publicHeaders() });
  }
}

// ── POST: create or replace order from storefront cart ────────────────────────
export async function POST(req, { params }) {
  try {
    await connectDb();
    const { slug } = await params;

    const body = await req.json();
    const {
      customerPhone,    // optional — extracted from WhatsApp when order arrives
      customerName,
      items,            // array of cart items with selectedVariants
      deliveryAddress,  // full delivery address string
      deliveryLocation, // city/area for fee calculation
      fulfillmentMethod = "delivery",
      pickupDetails,
      deliveryFee = 0,
      selectedZoneName = "",
      deliveryZoneTimeframe = "",
      sessionToken,     // optional — storefront session token to resolve customer phone
    } = body;

    // ── Resolve customer phone from session token if available ───────────────
    // The storefront link sent to the customer includes ?session=TOKEN which
    // encodes their WhatsApp phone. We verify and extract it here so the
    // customer never has to type their phone number manually.
    let resolvedPhone = customerPhone || "";
    if (!resolvedPhone && sessionToken) {
      try {
        const sessionPayload = verifySessionToken(sessionToken);
        if (sessionPayload?.customerPhone) {
          resolvedPhone = sessionPayload.customerPhone;
          console.log(`[checkout] ✅ Phone resolved from session token: ${resolvedPhone}`);
        }
      } catch (tokenErr) {
        console.warn("[checkout] Session token verification failed (non-fatal):", tokenErr.message);
      }
    }

    // If still no phone from token, try to look up by DB session record
    if (!resolvedPhone && sessionToken) {
      try {
        const dbSession = await StorefrontSessionModel.findOne({
          token: sessionToken,
          storeSlug: slug.toLowerCase().trim(),
        }).lean();
        if (dbSession?.customerPhone) {
          resolvedPhone = dbSession.customerPhone;
          console.log(`[checkout] ✅ Phone resolved from DB session: ${resolvedPhone}`);
        }
      } catch (dbErr) {
        console.warn("[checkout] DB session lookup failed (non-fatal):", dbErr.message);
      }
    }

    // ── Basic validation ──────────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400, headers: publicHeaders() });
    }
    if (fulfillmentMethod === "delivery" && !deliveryAddress?.trim()) {
      return NextResponse.json({ success: false, message: "Delivery address is required" }, { status: 400, headers: publicHeaders() });
    }

    // ── Load seller profile ───────────────────────────────────────────────────
    const profile = await SellerProfileModel.findOne({ slug: slug.toLowerCase().trim() }).lean();
    if (!profile) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404, headers: publicHeaders() });
    }

    // ── Validate & enrich each cart item against the live product catalogue ───
    const productIds = items.map(i => i.productId).filter(Boolean);
    const dbProducts = await SellerProductModel.find({
      _id: { $in: productIds },
      sellerId: profile._id,
      isAvailable: true,
    }).lean();

    const productMap = Object.fromEntries(dbProducts.map(p => [p._id.toString(), p]));

    const validatedItems = [];
    for (const item of items) {
      const dbProd = productMap[item.productId];
      if (!dbProd) {
        return NextResponse.json({
          success: false,
          message: `Product "${item.name || item.productId}" is no longer available`,
        }, { status: 400, headers: publicHeaders() });
      }

      // Calculate authoritative price from DB (not client-submitted price)
      const basePrice = dbProd.discountPrice || dbProd.price;
      const selectedVariants = Array.isArray(item.selectedVariants) ? item.selectedVariants : [];
      const variantPriceAdj = selectedVariants.reduce((sum, sel) => {
        const variantDef = (dbProd.variants || []).find(v => v.label === sel.label);
        const optionDef = variantDef?.options?.find(o => o.value === sel.value);
        return sum + (optionDef?.priceAdjustment || 0);
      }, 0);
      const unitPrice = basePrice + variantPriceAdj;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      validatedItems.push({
        productId: dbProd._id,
        name: dbProd.name,
        price: unitPrice,
        quantity,
        imageUrl: dbProd.images?.[0]?.url || "",
        selectedVariants,
      });
    }

    // ── Calculate total from validated items ──────────────────────────────────
    const itemsSubtotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFeeNum = Number(deliveryFee) || 0;
    const totalPrice = itemsSubtotal + deliveryFeeNum;

    // ── Normalise phone (optional — will be set when WhatsApp message arrives) ─
    const normPhone = resolvedPhone ? resolvedPhone.replace(/\D/g, "") : "";
    const formattedPhone = normPhone
      ? (normPhone.startsWith("+") ? normPhone : `+${normPhone}`)
      : ""; // empty until linked from WhatsApp

    // ── Generate order code ───────────────────────────────────────────────────
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let orderCode = "";
    for (let i = 0; i < 8; i++) orderCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // ── Cancel any existing awaiting_payment order for this phone+seller ─────
    // Only cancel if we have a phone — otherwise we can't safely match
    if (formattedPhone) {
      await SellerOrderModel.updateMany(
        {
          sellerId: profile._id,
          customerPhone: formattedPhone,
          status: "awaiting_payment",
        },
        { $set: { status: "cancelled" } }
      );
    }

    // ── Create the new order ──────────────────────────────────────────────────
    const order = await SellerOrderModel.create({
      sellerId: profile._id,
      productId: validatedItems[0]?.productId || null,
      customerPhone: formattedPhone,
      customerName: customerName || "Storefront Customer",
      quantity: validatedItems.reduce((sum, i) => sum + i.quantity, 0),
      items: validatedItems,
      totalPrice,
      deliveryFee: deliveryFeeNum,
      deliveryAddress: fulfillmentMethod === "delivery" ? deliveryAddress.trim() : "",
      deliveryLocation: fulfillmentMethod === "delivery" ? (deliveryLocation || deliveryAddress).trim() : "",
      selectedZoneName: selectedZoneName || "",
      fulfillmentMethod,
      pickupDetails: fulfillmentMethod === "pickup" ? (pickupDetails || "") : "",
      status: "awaiting_payment",
      orderCode,
      orderSource: "storefront",
    });

    // ── Load payment details to return to storefront ──────────────────────────
    // We load the user record to get payment account details
    const user = await UserModel.findById(profile.userId)
      .select("paxAI.plan")
      .lean();

    const activePayments = (profile.paymentDetails || []).filter(p => p.active !== false);
    const primaryPayment = activePayments[0] || null;

    console.log(`[checkout] ✅ Order ${orderCode} created for ${formattedPhone} | ${validatedItems.length} items | ₦${totalPrice.toLocaleString()} | seller=${profile._id}`);

    return NextResponse.json({
      success: true,
      orderCode: order.orderCode,
      orderId: order._id.toString(),
      totalPrice,
      deliveryFee: deliveryFeeNum,
      itemsSubtotal,
      itemCount: validatedItems.length,
      payment: primaryPayment ? {
        bankName: primaryPayment.bankName,
        accountNumber: primaryPayment.accountNumber,
        accountName: primaryPayment.accountName,
        label: primaryPayment.label,
      } : null,
      businessName: profile.businessName,
    }, { status: 201, headers: publicHeaders() });

  } catch (err) {
    console.error("POST /checkout error:", err.message, err.stack);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: publicHeaders() });
  }
}
