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
      customerPhone,
      customerName,
      items,
      deliveryAddress,
      deliveryLocation,
      fulfillmentMethod = "delivery",
      pickupDetails,
      deliveryFee = 0,
      selectedZoneName = "",
      deliveryZoneTimeframe = "",
      sessionToken,
    } = body;

    console.log(`[checkout] 📦 New checkout request | store=${slug} | items=${items?.length ?? 0} | fulfillment=${fulfillmentMethod} | deliveryFee=${deliveryFee} | sessionToken=${sessionToken ? "present" : "none"}`);

    // ── Resolve customer phone from session token ─────────────────────────────
    let resolvedPhone = customerPhone || "";
    if (!resolvedPhone && sessionToken) {
      try {
        const sessionPayload = verifySessionToken(sessionToken);
        if (sessionPayload?.customerPhone) {
          resolvedPhone = sessionPayload.customerPhone;
          console.log(`[checkout] ✅ Phone resolved from session token: ${resolvedPhone}`);
        } else {
          console.log(`[checkout] ⚠️ Session token verified but no customerPhone in payload`);
        }
      } catch (tokenErr) {
        console.warn(`[checkout] ⚠️ Session token verification failed: ${tokenErr.message}`);
      }
    }

    if (!resolvedPhone && sessionToken) {
      try {
        const dbSession = await StorefrontSessionModel.findOne({
          token: sessionToken,
          storeSlug: slug.toLowerCase().trim(),
        }).lean();
        if (dbSession?.customerPhone) {
          resolvedPhone = dbSession.customerPhone;
          console.log(`[checkout] ✅ Phone resolved from DB session: ${resolvedPhone}`);
        } else {
          console.log(`[checkout] ⚠️ DB session found but no customerPhone stored`);
        }
      } catch (dbErr) {
        console.warn(`[checkout] ⚠️ DB session lookup failed: ${dbErr.message}`);
      }
    }

    if (!resolvedPhone) {
      console.log(`[checkout] ℹ️ No phone resolved — order will be linked when WhatsApp message arrives`);
    }

    // ── Basic validation ──────────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn(`[checkout] ❌ Validation failed: cart is empty`);
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400, headers: publicHeaders() });
    }
    if (fulfillmentMethod === "delivery" && !deliveryAddress?.trim()) {
      console.warn(`[checkout] ❌ Validation failed: delivery address missing`);
      return NextResponse.json({ success: false, message: "Delivery address is required" }, { status: 400, headers: publicHeaders() });
    }

    // ── Load seller profile ───────────────────────────────────────────────────
    const profile = await SellerProfileModel.findOne({ slug: slug.toLowerCase().trim() }).lean();
    if (!profile) {
      console.warn(`[checkout] ❌ Store not found: slug=${slug}`);
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404, headers: publicHeaders() });
    }
    console.log(`[checkout] ✅ Store loaded: ${profile.businessName} (${profile._id})`);

    // ── Validate & enrich each cart item against the live product catalogue ───
    const productIds = items.map(i => i.productId).filter(Boolean);
    const dbProducts = await SellerProductModel.find({
      _id: { $in: productIds },
      sellerId: profile._id,
      isAvailable: true,
    }).lean();

    console.log(`[checkout] 🔍 Product lookup: requested=${productIds.length} | found=${dbProducts.length}`);
    const productMap = Object.fromEntries(dbProducts.map(p => [p._id.toString(), p]));

    const validatedItems = [];
    for (const item of items) {
      const dbProd = productMap[item.productId];
      if (!dbProd) {
        console.warn(`[checkout] ❌ Product unavailable: "${item.name || item.productId}"`);
        return NextResponse.json({
          success: false,
          message: `Product "${item.name || item.productId}" is no longer available`,
        }, { status: 400, headers: publicHeaders() });
      }

      const basePrice = dbProd.discountPrice || dbProd.price;
      const selectedVariants = Array.isArray(item.selectedVariants) ? item.selectedVariants : [];
      const variantPriceAdj = selectedVariants.reduce((sum, sel) => {
        const variantDef = (dbProd.variants || []).find(v => v.label === sel.label);
        const optionDef = variantDef?.options?.find(o => o.value === sel.value);
        return sum + (optionDef?.priceAdjustment || 0);
      }, 0);
      const unitPrice = basePrice + variantPriceAdj;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      const variantSummary = selectedVariants.length > 0
        ? ` [${selectedVariants.map(v => `${v.label}: ${v.value}`).join(", ")}]`
        : "";
      console.log(`[checkout]   ✔ Item: "${dbProd.name}"${variantSummary} | qty=${quantity} | unitPrice=₦${unitPrice.toLocaleString()}`);

      validatedItems.push({
        productId: dbProd._id,
        name: dbProd.name,
        price: unitPrice,
        quantity,
        imageUrl: dbProd.images?.[0]?.url || "",
        selectedVariants,
      });
    }

    // ── Calculate totals ──────────────────────────────────────────────────────
    const itemsSubtotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFeeNum = Number(deliveryFee) || 0;
    const totalPrice = itemsSubtotal + deliveryFeeNum;

    console.log(`[checkout] 💰 Totals | subtotal=₦${itemsSubtotal.toLocaleString()} | deliveryFee=₦${deliveryFeeNum.toLocaleString()} | total=₦${totalPrice.toLocaleString()} | zone="${selectedZoneName || "none"}"`);

    // ── Normalise phone ───────────────────────────────────────────────────────
    const normPhone = resolvedPhone ? resolvedPhone.replace(/\D/g, "") : "";
    const formattedPhone = normPhone
      ? (normPhone.startsWith("+") ? normPhone : `+${normPhone}`)
      : "";

    console.log(`[checkout] 📱 Customer phone: "${formattedPhone || "(not resolved yet)"}" | address="${deliveryAddress || "(pickup)"}"`);

    // ── Generate order code ───────────────────────────────────────────────────
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let orderCode = "";
    for (let i = 0; i < 8; i++) orderCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // ── Cancel any existing awaiting_payment order for this phone+seller ─────
    if (formattedPhone) {
      const cancelResult = await SellerOrderModel.updateMany(
        { sellerId: profile._id, customerPhone: formattedPhone, status: "awaiting_payment" },
        { $set: { status: "cancelled" } }
      );
      if (cancelResult.modifiedCount > 0) {
        console.log(`[checkout] 🗑️ Cancelled ${cancelResult.modifiedCount} existing awaiting_payment order(s) for ${formattedPhone}`);
      }
    }

    // ── Create the order ──────────────────────────────────────────────────────
    console.log(`[checkout] 💾 Creating order #${orderCode} in DB...`);

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

    console.log(`[checkout] ✅ Order created | orderCode=${order.orderCode} | _id=${order._id} | phone="${formattedPhone || "pending"}" | items=${validatedItems.length} | total=₦${totalPrice.toLocaleString()} | store=${profile.businessName}`);

    // ── Load payment details ──────────────────────────────────────────────────
    const activePayments = (profile.paymentDetails || []).filter(p => p.active !== false);
    const primaryPayment = activePayments[0] || null;

    if (!primaryPayment) {
      console.warn(`[checkout] ⚠️ No active payment accounts configured for seller ${profile._id}`);
    }

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
    console.error(`[checkout] 💥 POST /checkout error: ${err.message}`, err.stack);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: publicHeaders() });
  }
}
