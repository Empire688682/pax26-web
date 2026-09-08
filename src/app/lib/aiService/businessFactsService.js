import SellerProductModel from "../../ults/models/SellerProductModel.js";
import { getOrCreateActiveOrder, transitionOrderState, ORDER_STAGES } from "./orderStateMachine.js";
import { buildStorefrontUrl } from "../store/buildStorefrontUrl.js";

/**
 * Single Price Authority
 * Evaluates current selling price deterministically from backend product record.
 */
export function getEffectiveProductPrice(product, currency = "NGN") {
  if (!product) {
    return { regularPrice: 0, currentPrice: 0, hasDiscount: false, currency };
  }

  const regularPrice = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < regularPrice;
  const currentPrice = hasDiscount ? discountPrice : regularPrice;

  return {
    regularPrice,
    currentPrice,
    hasDiscount,
    currency: product.currency || currency || "NGN",
  };
}

/**
 * Filter messages to use ONLY trusted sources for business state decisions.
 * Previous AI message text is EXCLUDED from authoritative fact extraction.
 */
export function filterTrustedMessages(messages = []) {
  return messages.filter((m) => {
    // If explicit trustLevel exists
    if (m.trustLevel) {
      return m.trustLevel !== "AI_MESSAGE";
    }
    // Fallback checks
    const sender = m.senderType || (m.role === "user" ? "visitor" : "ai");
    return sender !== "ai" && sender !== "assistant";
  });
}

/**
 * Validates delivery address completeness and coverage deterministically.
 */
export function validateDeliveryAddress(rawAddress, sellerProfile) {
  if (!rawAddress || typeof rawAddress !== "string") {
    return { isComplete: false, isCovered: false, deliveryFee: 0, reason: "NO_ADDRESS" };
  }

  const address = rawAddress.trim();
  const lowerAddress = address.toLowerCase();

  // Address completeness check: Needs Area/State + Street/Building detail (or at least 12 chars with spaces)
  const isVagueCityOnly = /^(lagos|abuja|ibadan|kano|port harcourt|enugu|benin|calabar|asaba|uyo)$/i.test(address);
  const wordCount = address.split(/\s+/).length;
  const isComplete = !isVagueCityOnly && wordCount >= 2 && address.length >= 10;

  if (!isComplete) {
    return { isComplete: false, isCovered: true, deliveryFee: 0, reason: "INCOMPLETE_ADDRESS" };
  }

  // Delivery Coverage Check
  const coverageText = (sellerProfile?.deliveryCoverage || sellerProfile?.liveLocation || "").toLowerCase();
  let isCovered = true;

  if (coverageText && coverageText !== "not specified") {
    // Check if seller's coverage specifies restricted states/cities
    const coverageAreas = coverageText.split(/[,;\n]+/).map((a) => a.trim()).filter(Boolean);
    if (coverageAreas.length > 0) {
      isCovered = coverageAreas.some((area) => lowerAddress.includes(area) || area.includes(lowerAddress));
    }
  }

  if (!isCovered) {
    return { isComplete: true, isCovered: false, deliveryFee: 0, reason: "OUTSIDE_COVERAGE" };
  }

  // Delivery Fee Calculation (Flat rate vs Zones vs Highest item fee)
  const fulfillment = sellerProfile?.fulfillmentSettings || {};
  const deliveryModel = fulfillment.deliveryModel || "flat";
  let deliveryFee = 0;

  if (deliveryModel === "zones" && Array.isArray(fulfillment.deliveryZones)) {
    const matchedZone = fulfillment.deliveryZones.find((z) => {
      const zName = (z.name || "").toLowerCase();
      const zAreas = (z.areas || "").toLowerCase();
      return lowerAddress.includes(zName) || (zAreas && lowerAddress.includes(zAreas));
    });

    if (matchedZone) {
      deliveryFee = Number(matchedZone.fee) || 0;
    }
  }

  return { isComplete: true, isCovered: true, deliveryFee, reason: "OK" };
}

/**
 * Single package delivery fee calculation rule:
 * Charged ONCE per package/order using the highest applicable fee among items.
 */
export function calculatePackageDeliveryFee(items = [], sellerProfile, validatedAddressFee = 0) {
  if (validatedAddressFee > 0) return validatedAddressFee;
  if (!items || items.length === 0) return 0;

  const itemFees = items.map((i) => Number(i.deliveryFee) || 0);
  const maxItemFee = itemFees.length > 0 ? Math.max(...itemFees) : 0;

  return maxItemFee;
}

/**
 * Main Backend Business Facts Resolver
 */
export async function resolveBusinessFacts({
  sellerProfile,
  intentResult,
  customerPhone,
  customerName,
  session,
  inboundText,
  messagesHistory = [],
}) {
  const sellerId = sellerProfile._id;
  const currency = sellerProfile.currency || "NGN";

  // Build Pax26 storefront URL for browsing
  const storefrontUrl = sellerProfile.slug
    ? await buildStorefrontUrl({ sellerProfile, customerPhone }).catch(() => null)
    : null;

  // Filter trusted customer messages
  const trustedMessages = filterTrustedMessages(messagesHistory);

  // Load existing or draft active order
  const order = await getOrCreateActiveOrder({
    sellerId,
    customerPhone,
    customerName,
    sessionId: session.sessionId,
  });

  const intent = intentResult?.intent || "UNKNOWN";
  const productQuery = intentResult?.productQuery;

  // FETCH ALL AVAILABLE PRODUCTS FOR THIS SELLER ONCE (strictly scoped by sellerId)
  const allSellerProducts = await SellerProductModel.find({
    sellerId,
    isAvailable: true,
  }).lean();

  const availableProductsCatalogue = allSellerProducts.slice(0, 30).map((p) => {
    const pPriceInfo = getEffectiveProductPrice(p, currency);
    return {
      id: p._id.toString(),
      name: p.name,
      category: p.category || "General",
      price: pPriceInfo.currentPrice,
      regularPrice: pPriceInfo.regularPrice,
      hasDiscount: pPriceInfo.hasDiscount,
      currency: pPriceInfo.currency,
      imageUrl: p.images?.[0]?.url || null,
      description: p.description || null,
      stockStatus: p.isAvailable !== false && (p.stock === undefined || p.stock > 0) ? "In Stock" : "Out of Stock",
    };
  });

  let approvedAction = "INFORM_GENERAL";
  let matchedProducts = [];
  let factFlags = {
    productFound: false,
    isStockAvailable: true,
    addressVerified: false,
    paymentDetailsAuthorized: false,
    isOrderLocked: order?.isSnapshotLocked || false,
    requiresClarification: false,
  };

  // 0. STOREFRONT MULTI-ITEM CART SHARE PARSER
  const isStorefrontCartShare = /interested in ordering|Products Total:|Estimated Total:|•\s*\d+x/i.test(inboundText);

  if (isStorefrontCartShare && allSellerProducts.length > 0) {
    const itemsToAdd = [];
    for (const prod of allSellerProducts) {
      const prodNameLower = prod.name.toLowerCase();
      if (inboundText.toLowerCase().includes(prodNameLower)) {
        // Extract quantity if specified (e.g. "2x Product")
        const qtyRegex = new RegExp(`(\\d+)\\s*x\\s*\\*?${prodNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, "i");
        const qtyMatch = inboundText.match(qtyRegex);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

        const priceInfo = getEffectiveProductPrice(prod, currency);
        itemsToAdd.push({
          productId: prod._id,
          name: prod.name,
          nameSnapshot: prod.name,
          price: priceInfo.currentPrice,
          unitPriceSnapshot: priceInfo.currentPrice,
          quantity: qty,
          imageUrl: prod.images?.[0]?.url || "",
          imageSnapshot: prod.images?.[0]?.url || "",
          selectedVariant: {},
        });
      }
    }

    if (itemsToAdd.length > 0) {
      const deliveryFeeMatch = inboundText.match(/(?:Delivery Fee|Fulfillment Fee):\s*(?:₦|N|NGN)?\s*([\d,]+)/i);
      let parsedDeliveryFee = deliveryFeeMatch ? parseFloat(deliveryFeeMatch[1].replace(/,/g, "")) : 0;

      const productsTotal = itemsToAdd.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = calculatePackageDeliveryFee(itemsToAdd, sellerProfile, parsedDeliveryFee || order.deliveryFee);
      const grandTotal = productsTotal + deliveryFee;

      await transitionOrderState(order._id, ORDER_STAGES.CHECKOUT, {
        items: itemsToAdd,
        totalPrice: grandTotal,
        deliveryFee,
      });

      approvedAction = "ORDER_ITEM_ADDED";
      matchedProducts = itemsToAdd.map((i) => ({ _id: i.productId, name: i.name, price: i.price, isAvailable: true }));
      factFlags.productFound = true;
    }
  }

  // 1. PRODUCT SEARCH & MATCHING (Strictly scoped by sellerId)
  if (!factFlags.productFound && (productQuery || ["PRODUCT_SEARCH", "PRODUCT_PRICE", "PRODUCT_AVAILABILITY", "PRODUCT_DETAILS", "PRODUCT_IMAGE", "SELECT_PRODUCT", "ADD_TO_ORDER"].includes(intent))) {
    if (productQuery) {
      const queryLower = productQuery.toLowerCase();
      matchedProducts = allSellerProducts.filter((p) => {
        const nameLower = (p.name || "").toLowerCase();
        const catLower = (p.category || "").toLowerCase();
        const descLower = (p.description || "").toLowerCase();
        return nameLower.includes(queryLower) || queryLower.includes(nameLower) || catLower.includes(queryLower) || descLower.includes(queryLower);
      });

      if (matchedProducts.length > 0) {
        factFlags.productFound = true;

        if (matchedProducts.length > 1) {
          factFlags.requiresClarification = true;
          approvedAction = "ASK_PRODUCT_SELECTION";
        } else {
          const prod = matchedProducts[0];
          factFlags.isStockAvailable = prod.isAvailable !== false && (prod.stock === undefined || prod.stock > 0);
          if (!factFlags.isStockAvailable) {
            approvedAction = "INFORM_OUT_OF_STOCK";
          } else if (intent === "PRODUCT_PRICE") {
            approvedAction = "INFORM_PRODUCT_PRICE";
          } else if (intent === "PRODUCT_IMAGE" || intentResult?.customerWantsImage) {
            approvedAction = "PROVIDE_PRODUCT_IMAGE";
          } else {
            approvedAction = "INFORM_PRODUCT_DETAILS";
          }
        }
      } else {
        factFlags.productFound = false;
        approvedAction = "INFORM_PRODUCT_NOT_FOUND";
      }
    }
  }

  // 2. ORDER MUTATION & STATE MACHINE HANDLER (Safeguard 1: AI Proposes, Backend Validates & Executes)
  if (["ADD_TO_ORDER", "SELECT_PRODUCT"].includes(intent) && factFlags.productFound && matchedProducts.length === 1) {
    const selectedProd = matchedProducts[0];
    const priceInfo = getEffectiveProductPrice(selectedProd, currency);
    const quantity = intentResult.quantity || 1;

    // Check Snapshot Locking (Safeguard 3 & Safeguard 8 Test N)
    if (order.isSnapshotLocked && order.orderStage === ORDER_STAGES.AWAITING_PAYMENT) {
      // Order is locked! Require explicit order amendment flow
      approvedAction = "PROMPT_ORDER_AMENDMENT";
    } else {
      // Update draft items
      const existingItemIndex = order.items.findIndex(
        (i) => i.productId && i.productId.toString() === selectedProd._id.toString()
      );

      let updatedItems = [...order.items];
      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        updatedItems.push({
          productId: selectedProd._id,
          name: selectedProd.name,
          nameSnapshot: selectedProd.name,
          price: priceInfo.currentPrice,
          unitPriceSnapshot: priceInfo.currentPrice,
          quantity,
          imageUrl: selectedProd.images?.[0]?.url || "",
          imageSnapshot: selectedProd.images?.[0]?.url || "",
          selectedVariant: intentResult.requestedVariant || {},
        });
      }

      const productsTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = calculatePackageDeliveryFee(updatedItems, sellerProfile, order.deliveryFee);
      const grandTotal = productsTotal + deliveryFee;

      await transitionOrderState(order._id, ORDER_STAGES.CHECKOUT, {
        items: updatedItems,
        totalPrice: grandTotal,
        deliveryFee,
      });

      approvedAction = "ORDER_ITEM_ADDED";
    }
  } else if (["ADD_TO_ORDER", "SELECT_PRODUCT"].includes(intent) && (!factFlags.productFound || factFlags.requiresClarification)) {
    // Safeguard 8 (Test P): AI Action Hallucination -> Reject mutation and ask clarification
    approvedAction = factFlags.requiresClarification ? "ASK_PRODUCT_SELECTION" : "INFORM_PRODUCT_NOT_FOUND";
  }

  // 3. ADDRESS & DELIVERY COVERAGE VALIDATION
  if (intent === "PROVIDE_DELIVERY_ADDRESS" || intentResult.requestedLocation) {
    const addressToTest = intentResult.requestedLocation || inboundText;
    const addrResult = validateDeliveryAddress(addressToTest, sellerProfile);

    if (!addrResult.isComplete) {
      approvedAction = "REQUEST_ADDRESS_DETAILS";
    } else if (!addrResult.isCovered) {
      approvedAction = "DELIVERY_NOT_AVAILABLE";
    } else {
      factFlags.addressVerified = true;
      const productsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = calculatePackageDeliveryFee(order.items, sellerProfile, addrResult.deliveryFee);
      const grandTotal = productsTotal + deliveryFee;

      await transitionOrderState(order._id, ORDER_STAGES.CHECKOUT, {
        deliveryAddress: addressToTest,
        deliveryLocation: addressToTest,
        deliveryFee,
        totalPrice: grandTotal,
      });

      approvedAction = "ADDRESS_RECEIVED_CALCULATED";
    }
  }

  // 4. PAYMENT DETAILS REQUEST & AUTHORIZATION (Part 9)
  if (intent === "REQUEST_PAYMENT_DETAILS" || (intentResult.customerWantsPurchase && order.items.length > 0)) {
    if (!order.deliveryAddress) {
      approvedAction = "REQUEST_ADDRESS_DETAILS";
    } else {
      // Transition to AWAITING_PAYMENT and LOCK SNAPSHOT (Safeguard 3)
      const productsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = calculatePackageDeliveryFee(order.items, sellerProfile, order.deliveryFee);
      const grandTotal = productsTotal + deliveryFee;

      await transitionOrderState(order._id, ORDER_STAGES.AWAITING_PAYMENT, {
        totalPrice: grandTotal,
        deliveryFee,
      });

      factFlags.paymentDetailsAuthorized = true;
      approvedAction = "SHARE_PAYMENT_DETAILS";
    }
  }

  // 5. PAYMENT CLAIM (TEXT STATEMENTS ONLY: "I have paid") (Part 10 & Safeguard 4)
  if (intent === "PAYMENT_CLAIM") {
    // Text statement is NOT payment verification! Prompt for image proof.
    approvedAction = "PROMPT_PAYMENT_PROOF_IMAGE";
  }

  // 6. REFUND OR COMPLAINT REQUEST (Part 15 & Test H)
  if (intent === "REFUND_REQUEST" || intent === "COMPLAINT") {
    approvedAction = "ESCALATE_COMPLAINT_TO_HUMAN";
  }

  // Prepare verified products output for AI response writer
  const verifiedProducts = matchedProducts.map((p) => {
    const priceInfo = getEffectiveProductPrice(p, currency);
    return {
      id: p._id.toString(),
      name: p.name,
      regularPrice: priceInfo.regularPrice,
      currentPrice: priceInfo.currentPrice,
      hasDiscount: priceInfo.hasDiscount,
      currency: priceInfo.currency,
      imageUrl: p.images?.[0]?.url || null,
      isAvailable: p.isAvailable !== false && (p.stock === undefined || p.stock > 0),
    };
  });

  // Calculate order totals safely from locked database order snapshot
  const orderItemsSnapshot = (order.items || []).map((i) => ({
    productId: i.productId?.toString(),
    name: i.nameSnapshot || i.name,
    unitPrice: i.unitPriceSnapshot || i.price,
    quantity: i.quantity || 1,
    lineTotal: (i.unitPriceSnapshot || i.price) * (i.quantity || 1),
    imageUrl: i.imageSnapshot || i.imageUrl || "",
  }));

  const productsTotal = orderItemsSnapshot.reduce((sum, i) => sum + i.lineTotal, 0);
  const deliveryFee = Number(order.deliveryFee) || 0;
  const grandTotal = productsTotal + deliveryFee;

  // Payment Accounts (only included if paymentDetailsAuthorized === true)
  const activePayments = sellerProfile.paymentDetails?.filter((p) => p.active !== false) || [];
  const authorizedPaymentAccounts = factFlags.paymentDetailsAuthorized
    ? activePayments.map((p) => ({
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        accountName: p.accountName || "",
      }))
    : [];

  return {
    intent,
    approvedAction,
    seller: {
      id: sellerId.toString(),
      businessName: sellerProfile.businessName,
      businessDescription: sellerProfile.businessDescription || sellerProfile.description || sellerProfile.bio || null,
      industry: sellerProfile.industry || sellerProfile.category || null,
      liveLocation: sellerProfile.liveLocation || sellerProfile.city || null,
      deliveryCoverage: sellerProfile.deliveryCoverage || null,
      workingHours: sellerProfile.workingHours || null,
      services: sellerProfile.services || [],
      faqs: sellerProfile.faqs || [],
      knowledgeBase: sellerProfile.knowledgeBase || null,
      currency,
      storefrontUrl,
      availableProductsCatalogue,
    },
    products: verifiedProducts,
    order: {
      id: order._id.toString(),
      orderStage: order.orderStage,
      isSnapshotLocked: order.isSnapshotLocked,
      items: orderItemsSnapshot,
      productsTotal,
      deliveryFee,
      grandTotal,
      deliveryAddress: order.deliveryAddress || null,
      paymentReceiptUrl: order.paymentReceiptUrl || null,
    },
    authorizedPaymentAccounts,
    facts: factFlags,
  };
}
