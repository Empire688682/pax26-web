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
      customerPhone1,
      customerPhone2,
      items,
      deliveryAddress,
      deliveryLocation,
      fulfillmentMethod = "delivery",
      pickupDetails,
      deliveryFee = 0,
      selectedZoneName = "",
      deliveryZoneTimeframe = "",
      sessionToken,
      additionalInfo = "",
    } = body;

    // Resolve the primary phone: customerPhone1 is the delivery form phone ONLY.
    // Session token / DB session phone is the WhatsApp identity — stored separately as whatsappPhone.
    const primaryPhone = customerPhone1 || customerPhone || ""; // delivery form phone

    // ── Resolve WhatsApp identity phone from session token ────────────────────
    // This is separate from the delivery phone. It goes to order.whatsappPhone, never order.customerPhone.
    let sessionWaPhone = "";
    if (sessionToken) {
      try {
        const sessionPayload = verifySessionToken(sessionToken);
        if (sessionPayload?.customerPhone) {
          sessionWaPhone = sessionPayload.customerPhone;
          console.log(`[checkout] ✅ WhatsApp phone resolved from session token: ${sessionWaPhone}`);
        }
      } catch (tokenErr) {
        console.warn(`[checkout] ⚠️ Session token verification failed: ${tokenErr.message}`);
      }
    }

    if (!sessionWaPhone && sessionToken) {
      try {
        const dbSession = await StorefrontSessionModel.findOne({
          token: sessionToken,
          storeSlug: slug.toLowerCase().trim(),
        }).lean();
        if (dbSession?.customerPhone) {
          sessionWaPhone = dbSession.customerPhone;
          console.log(`[checkout] ✅ WhatsApp phone resolved from DB session: ${sessionWaPhone}`);
        }
      } catch (dbErr) {
        console.warn(`[checkout] ⚠️ DB session lookup failed: ${dbErr.message}`);
      }
    }

    console.log(`[checkout] 📦 New checkout request | store=${slug} | items=${items?.length ?? 0} | fulfillment=${fulfillmentMethod} | deliveryFee=${deliveryFee} | sessionToken=${sessionToken ? "present" : "none"}`);

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

    // ── Server-side delivery coverage validation ──────────────────────────────
    // This mirrors the client-side check in AddressStage — but here it's the authoritative gate.
    // A customer cannot bypass it via devtools or direct API call.
    if (fulfillmentMethod === "delivery" && deliveryAddress?.trim()) {
      const fs = profile.fulfillmentSettings || {};
      const deliveryModel = fs.deliveryModel || "flat";
      const deliveryZones = fs.deliveryZones || [];

      if (deliveryModel === "zones" && selectedZoneName) {
        const zone = deliveryZones.find(z => z.name === selectedZoneName);
        if (zone?.areas?.trim()) {
          const areaList = zone.areas.toLowerCase().split(",").map(a => a.trim()).filter(Boolean);
          const enteredText = deliveryAddress.toLowerCase();
          const covered = areaList.some(area => enteredText.includes(area));
          if (!covered) {
            console.warn(`[checkout] ❌ Address "${deliveryAddress}" not in zone "${selectedZoneName}" areas: ${zone.areas}`);
            return NextResponse.json({
              success: false,
              message: `Your address doesn't appear to be within the "${zone.name}" zone (covers: ${zone.areas}). Please check your address.`,
            }, { status: 400, headers: publicHeaders() });
          }
        }
      } else if (deliveryModel === "flat" && profile.deliveryCoverage?.trim()) {
        const coverage = profile.deliveryCoverage.toLowerCase();
        const isNationwide = /nationwide|all\s*state|everywhere|any.*where/i.test(coverage);
        if (!isNationwide) {
          const coveredAreas = coverage.split(/[,;\/\n]/).map(a => a.trim()).filter(a => a.length > 2);
          if (coveredAreas.length > 0) {
            const enteredText = deliveryAddress.toLowerCase();
            const covered = coveredAreas.some(area => enteredText.includes(area));
            if (!covered) {
              console.warn(`[checkout] ❌ Address "${deliveryAddress}" outside coverage: ${profile.deliveryCoverage}`);
              return NextResponse.json({
                success: false,
                message: `Sorry, we don't currently deliver to your location. We cover: ${profile.deliveryCoverage}. Contact us on WhatsApp for assistance.`,
              }, { status: 400, headers: publicHeaders() });
            }
          }
        }
      }
      // quote model: no server gate — seller quotes manually on WhatsApp
    }

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

    // ── Normalise delivery form phone ────────────────────────────────────────
    const normPhone = primaryPhone ? primaryPhone.replace(/\D/g, "") : "";
    const formattedPhone = normPhone
      ? (normPhone.startsWith("+") ? normPhone : `+${normPhone}`)
      : "";

    // ── Normalise WhatsApp identity phone (from session token) ───────────────
    const normWaPhone = sessionWaPhone ? sessionWaPhone.replace(/\D/g, "") : "";
    const formattedWaPhone = normWaPhone
      ? (normWaPhone.startsWith("+") ? normWaPhone : `+${normWaPhone}`)
      : "";

    console.log(`[checkout] 📱 Delivery phone: "${formattedPhone || "(not provided)"}" | WhatsApp phone: "${formattedWaPhone || "(not yet known)"}" | address="${deliveryAddress || "(pickup)"}"`);

    // ── Generate order code ───────────────────────────────────────────────────
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let orderCode = "";
    for (let i = 0; i < 8; i++) orderCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // ── Cancel any existing awaiting_payment orders for this customer ────────
    const cancelConditions = [];
    if (formattedPhone) cancelConditions.push({ customerPhone: formattedPhone });
    if (formattedWaPhone) cancelConditions.push({ whatsappPhone: formattedWaPhone });
    if (cancelConditions.length > 0) {
      const cancelResult = await SellerOrderModel.updateMany(
        { sellerId: profile._id, $or: cancelConditions, status: "awaiting_payment" },
        { $set: { status: "cancelled", awaitingPaymentExpiresAt: null } }
      );
      if (cancelResult.modifiedCount > 0) {
        console.log(`[checkout] 🗑️ Cancelled ${cancelResult.modifiedCount} existing awaiting_payment order(s)`);
      }
    }

    // ── Create the order ──────────────────────────────────────────────────────
    console.log(`[checkout] 💾 Creating order #${orderCode} in DB...`);

    const AWAITING_PAYMENT_TTL_HOURS = 48;

    const order = await SellerOrderModel.create({
      sellerId: profile._id,
      productId: validatedItems[0]?.productId || null,
      customerPhone: formattedPhone,           // delivery form phone — seller logistics only
      customerPhone2: customerPhone2 ? `+${(customerPhone2).replace(/\D/g, "")}` : "",
      whatsappPhone: formattedWaPhone || "",   // Meta inbound identity — set from session token if available
      customerName: customerName || "Storefront Customer",
      quantity: validatedItems.reduce((sum, i) => sum + i.quantity, 0),
      items: validatedItems,
      totalPrice,
      deliveryFee: deliveryFeeNum,
      deliveryAddress: fulfillmentMethod === "delivery" ? deliveryAddress.trim() : "",
      deliveryLocation: fulfillmentMethod === "delivery" ? (deliveryLocation || deliveryAddress).trim() : "",
      selectedZoneName: selectedZoneName || "",
      deliveryZoneTimeframe: deliveryZoneTimeframe || "",
      fulfillmentMethod,
      pickupDetails: fulfillmentMethod === "pickup" ? (pickupDetails || "") : "",
      additionalInfo: additionalInfo || "",
      status: "awaiting_payment",
      // TTL: auto-delete this order if it stays awaiting_payment for 48 hours
      awaitingPaymentExpiresAt: new Date(Date.now() + AWAITING_PAYMENT_TTL_HOURS * 60 * 60 * 1000),
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
