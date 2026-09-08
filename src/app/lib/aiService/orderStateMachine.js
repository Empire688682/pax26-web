import SellerOrderModel from "../../ults/models/SellerOrderModel.js";
import SessionModel from "../../ults/models/SessionModel.js";

export const ORDER_STAGES = {
  DRAFT: "DRAFT",
  CHECKOUT: "CHECKOUT",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PAYMENT_PROOF_RECEIVED: "PAYMENT_PROOF_RECEIVED",
  AWAITING_SELLER_VERIFICATION: "AWAITING_SELLER_VERIFICATION",
  PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  CANCELLED: "CANCELLED",
  REFUND_REQUESTED: "REFUND_REQUESTED",
};

/**
 * Ensures message processing idempotency.
 * Returns true if the messageId has already been processed for this session.
 */
export async function isMessageAlreadyProcessed(session, messageId) {
  if (!messageId || !session?._id) return false;

  const found = await SessionModel.findOne({
    _id: session._id,
    processedMessageIds: messageId,
  }).lean();

  return Boolean(found);
}

/**
 * Marks a messageId as processed on the session atomically.
 */
export async function markMessageProcessed(sessionId, messageId) {
  if (!sessionId || !messageId) return;

  await SessionModel.updateOne(
    { sessionId },
    { $addToSet: { processedMessageIds: messageId } }
  );
}

/**
 * Gets or creates the active draft order for a seller + customer session.
 */
export async function getOrCreateActiveOrder({ sellerId, customerPhone, customerName, sessionId }) {
  let session = await SessionModel.findOne({ sessionId }).lean();
  let order = null;

  if (session?.activeOrderId) {
    order = await SellerOrderModel.findById(session.activeOrderId);
    // If order was cancelled or confirmed, create a new draft order
    if (order && ["confirmed", "cancelled"].includes(order.status)) {
      order = null;
    }
  }

  if (!order) {
    // Search for existing pending/draft order
    order = await SellerOrderModel.findOne({
      sellerId,
      customerPhone,
      status: { $in: ["pending"] },
      orderStage: { $in: [ORDER_STAGES.DRAFT, ORDER_STAGES.CHECKOUT, ORDER_STAGES.AWAITING_PAYMENT, ORDER_STAGES.PAYMENT_PROOF_RECEIVED] },
    }).sort({ createdAt: -1 });
  }

  if (!order) {
    order = await SellerOrderModel.create({
      sellerId,
      customerPhone,
      customerName: customerName || "WhatsApp Customer",
      orderStage: ORDER_STAGES.DRAFT,
      isSnapshotLocked: false,
      items: [],
      totalPrice: 0,
      deliveryFee: 0,
      status: "pending",
    });

    if (session) {
      await SessionModel.updateOne(
        { _id: session._id },
        { $set: { activeOrderId: order._id } }
      );
    }
  }

  return order;
}

/**
 * Transitions order state deterministically.
 */
export async function transitionOrderState(orderId, newStage, payload = {}) {
  const order = await SellerOrderModel.findById(orderId);
  if (!order) return null;

  const currentStage = order.orderStage || ORDER_STAGES.DRAFT;

  // Snapshot locking check
  const shouldLock = [
    ORDER_STAGES.AWAITING_PAYMENT,
    ORDER_STAGES.PAYMENT_PROOF_RECEIVED,
    ORDER_STAGES.AWAITING_SELLER_VERIFICATION,
    ORDER_STAGES.PAYMENT_VERIFIED,
    ORDER_STAGES.ORDER_CONFIRMED,
  ].includes(newStage);

  // If items are passed during transition to lock state, save snapshot fields
  if (payload.items && Array.isArray(payload.items)) {
    order.items = payload.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      nameSnapshot: item.nameSnapshot || item.name,
      price: item.price,
      unitPriceSnapshot: item.unitPriceSnapshot || item.price,
      quantity: item.quantity || 1,
      imageUrl: item.imageUrl || item.imageSnapshot || "",
      imageSnapshot: item.imageSnapshot || item.imageUrl || "",
      selectedVariant: item.selectedVariant || {},
    }));
  }

  if (payload.totalPrice !== undefined) order.totalPrice = payload.totalPrice;
  if (payload.deliveryFee !== undefined) order.deliveryFee = payload.deliveryFee;
  if (payload.deliveryLocation !== undefined) order.deliveryLocation = payload.deliveryLocation;
  if (payload.deliveryAddress !== undefined) order.deliveryAddress = payload.deliveryAddress;
  if (payload.paymentReceiptUrl !== undefined) order.paymentReceiptUrl = payload.paymentReceiptUrl;
  if (payload.paymentReceiptPublicId !== undefined) order.paymentReceiptPublicId = payload.paymentReceiptPublicId;

  order.orderStage = newStage;
  if (shouldLock) {
    order.isSnapshotLocked = true;
  }

  if (newStage === ORDER_STAGES.PAYMENT_VERIFIED || newStage === ORDER_STAGES.ORDER_CONFIRMED) {
    order.status = "confirmed";
    order.confirmedAt = new Date();
  }

  await order.save();
  return order;
}
