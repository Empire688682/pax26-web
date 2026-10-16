import SellerOrderModel from "../../ults/models/SellerOrderModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import UserModel from "../../ults/models/UserModel.js";
import { uploadCustomerImageToCloudinary } from "./customerImageSearch.js";
import { sendSalesNotification } from "../salesNotificationService.js";
import { sendMobilePush } from "../pushNotificationService.js";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const PAYMENT_KEYWORDS = /payment|paid|transfer|receipt|screenshot|proof|sent|done|completed|txn|transaction|have paid|i paid/i;

const PAYMENT_STAGE_KEYWORDS =
    /account number|bank name|account name|transfer|make payment|pay to|payment details|screenshot of your payment|payment confirmation|once you.?ve transferred|send.*receipt|send.*proof|payment proof|gtbank|zenith|access|kuda|opay|palmpay|moniepoint|firstbank|ubabank|wema|sterling|stanbic|fidelity|fidelitybank|sterlingbank|wemabank|acct|acc\/num|bank:/i;

function normalizePhone(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
}

function isLikelyPaymentReceipt(caption, recentMessages = []) {
    if (caption && PAYMENT_KEYWORDS.test(caption)) return true;

    const recentText = recentMessages
        .slice(-10)
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    return PAYMENT_KEYWORDS.test(recentText);
}

export function isPaymentStage(recentMessages = [], session = null) {
    if (session?.payment?.paymentProofReceived === true) {
        return false;
    }
    if (session?.payment?.expectingPayment === true) {
        return true;
    }

    // Scan backwards: if an official receipt or proof acknowledgement was sent after bank details, stage is closed
    const reversedMessages = [...recentMessages].reverse();

    for (const msg of reversedMessages) {
        const text = msg.content || msg.text || "";
        const isAssistant = msg.role === "assistant" || msg.direction === "outbound" || msg.senderType === "ai";

        if (isAssistant && (text.includes("verifying your payment") || text.includes("OFFICIAL RECEIPT") || text.includes("PAYMENT VERIFIED"))) {
            return false;
        }

        if (isAssistant && (PAYMENT_STAGE_KEYWORDS.test(text) || /\b\d{10}\b/.test(text))) {
            return true;
        }
    }

    return false;
}

function extractOrderTotalFromConversation(recentMessages = []) {
    // Scan messages backwards (newest assistant payment messages first)
    const reversedMessages = [...recentMessages].reverse();
    const assistantMessages = reversedMessages.filter(
        (m) => m.role === "assistant" || m.senderType === "ai" || m.direction === "outbound"
    );

    // Highest priority: Explicit grand total phrasing in assistant messages
    const grandTotalPatterns = [
        /(?:grand\s+total|making\s+your\s+grand\s+total|your\s+total\s+will\s+be|your\s+total\s+is|total\s+is|total\s+amount|making\s+it|updated\s+total)[\s:]*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /once\s+you(?:'|’)?ve\s+transferred\s+(?:the\s+)?(?:₦|N|NGN)?\s*([\d,]+)/i,
        /transferred\s+the\s*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /transferring\s+(?:the\s+sum\s+of\s+)?(?:₦|N|NGN)?\s*([\d,]+)/i,
        /pay\s+the\s+(?:sum\s+of\s+)?(?:₦|N|NGN)?\s*([\d,]+)/i,
    ];

    // Priority 1: Check assistant messages ONE BY ONE in reverse order (newest message first!)
    for (const msg of assistantMessages) {
        const text = msg.content || msg.text || "";
        for (const pattern of grandTotalPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const cleanNum = parseInt(match[1].replace(/,/g, ""), 10);
                if (!isNaN(cleanNum) && cleanNum > 0) {
                    return cleanNum;
                }
            }
        }
    }

    // Priority 2: Fallback to amounts in the single NEWEST assistant message ONLY (never across full history)
    const newestAssistantMsg = assistantMessages[0];
    if (newestAssistantMsg) {
        const text = newestAssistantMsg.content || newestAssistantMsg.text || "";
        const allAmounts = [];
        const amountRegex = /(?:₦|N|NGN)\s*([\d,]+)/gi;
        let match;
        while ((match = amountRegex.exec(text)) !== null) {
            const val = parseInt(match[1].replace(/,/g, ""), 10);
            if (!isNaN(val) && val > 0) {
                allAmounts.push(val);
            }
        }
        if (allAmounts.length > 0) {
            return Math.max(...allAmounts); // Highest amount within the single newest message
        }
    }

    return null;
}

function normalizeSearchText(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .replace(/[’‘`´]/g, "'")
        .replace(/[—–]/g, "-")
        .replace(/[^a-z0-9'\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function findAllProductsFromConversation(sellerId, recentMessages = []) {
    const products = await SellerProductModel.find({ sellerId }).lean();
    if (!products.length) return [];

    const sortedProducts = [...products].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));

    // Priority 1: Check newest AI (assistant) payment messages first to get the exact product quoted to customer
    const assistantMessages = [...recentMessages]
        .reverse()
        .filter((m) => m.role === "assistant" || m.direction === "outbound" || m.senderType === "ai");

    for (const msg of assistantMessages) {
        const normMsgText = normalizeSearchText(msg.content || msg.text || "");
        for (const prod of sortedProducts) {
            if (!prod.name) continue;
            const normProdName = normalizeSearchText(prod.name);
            if (normProdName && normMsgText.includes(normProdName)) {
                return [prod];
            }
        }
    }

    // Priority 2: Fall back to customer messages or full conversation
    const customerMessages = recentMessages.filter(
        (m) => m.role === "user" || m.direction === "inbound" || m.senderType === "customer"
    );
    const messagesToScan = customerMessages.length > 0 ? customerMessages : recentMessages;

    const rawConversationText = messagesToScan
        .map((m) => m.content || m.text || "")
        .join(" ");

    const normalizedConvText = normalizeSearchText(rawConversationText);
    const matchedProducts = [];

    for (const prod of sortedProducts) {
        if (!prod.name) continue;
        const normProdName = normalizeSearchText(prod.name);
        if (!normProdName) continue;

        // 1. Direct containment test
        if (normalizedConvText.includes(normProdName)) {
            matchedProducts.push(prod);
            continue;
        }

        // 2. Singular/Plural stem matching (e.g. "mule heel" matching "mule heels")
        const normProdWithoutS = normProdName.replace(/s\b/g, "");
        const normConvWithoutS = normalizedConvText.replace(/s\b/g, "");

        if (normConvWithoutS.includes(normProdWithoutS)) {
            matchedProducts.push(prod);
            continue;
        }

        // 3. Multi-word overlap check (matching key product words >= 3 chars)
        const prodWords = normProdName.split(" ").filter((w) => w.length >= 3);
        if (prodWords.length >= 2) {
            const matchCount = prodWords.filter((w) => normConvWithoutS.includes(w.replace(/s$/, ""))).length;
            if (matchCount >= Math.min(2, prodWords.length)) {
                matchedProducts.push(prod);
            }
        }
    }

    return matchedProducts;
}

async function findProductFromConversation(sellerId, recentMessages = []) {
    const allMatched = await findAllProductsFromConversation(sellerId, recentMessages);
    return allMatched.length > 0 ? allMatched[0] : null;
}

async function resolveProduct(sellerId, recentMessages) {
    return findProductFromConversation(sellerId, recentMessages);
}

async function verifyReceiptWithGroq({ imageUrl, mediaUrl }) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ GROQ_API_KEY is not set, falling back to text heuristics");
            return true; // Fallback to true to preserve existing behavior if API key is missing
        }

        let buffer;
        let mimeType = "image/jpeg";

        if (imageUrl) {
            console.log("Fetching image from Cloudinary for Groq check:", imageUrl);
            const res = await fetch(imageUrl);
            if (!res.ok) throw new Error(`Failed to fetch Cloudinary image: ${res.statusText}`);
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = res.headers.get("content-type") || "image/jpeg";
        } else if (mediaUrl) {
            console.log("Fetching image from WhatsApp CDN for Groq check:", mediaUrl);
            const res = await fetch(mediaUrl, {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                },
            });
            if (!res.ok) throw new Error(`Failed to fetch WhatsApp media: ${res.statusText}`);
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = res.headers.get("content-type") || "image/jpeg";
        } else {
            console.warn("No imageUrl or mediaUrl provided for Groq check");
            return false;
        }

        const prompt = `Analyze this image. Determine if it is a bank transfer receipt, payment proof, transaction confirmation screenshot, deposit slip, or billing receipt.
Respond with a JSON object containing:
- "isPaymentReceipt": boolean (true if it is a proof of payment, false otherwise)
- "confidence": number (between 0 and 1)
- "reason": string (brief explanation of why)

Return ONLY the raw JSON object, without any markdown formatting blocks (like \`\`\`json) or extra text.`;

        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${buffer.toString("base64")}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 300,
        });

        const text = chatCompletion.choices[0].message.content.trim();
        console.log("Groq Payment Receipt verification response:", text);

        const json = JSON.parse(text);
        return json.isPaymentReceipt === true && json.confidence > 0.65;
    } catch (err) {
        console.error("❌ Error verifying payment receipt with Groq:", err);
        // Fallback: in case of API/parsing failure, we default to true to avoid blocking payment receipt processing
        return true;
    }
}

/**
 * Attach a customer payment receipt to a pending order (or create one).
 */
export async function handlePaymentReceipt({
    sellerId,
    sellerUserId,
    mediaUrl,
    customerPhone,
    customerName,
    caption = "",
    recentMessages = [],
    session = null,
    imageUrl = null,
    imagePublicId = null,
}) {
    const normalizedPhone = normalizePhone(customerPhone);

    // ── Priority 1: Find a storefront-confirmed "awaiting_payment" order ──────
    // This is the clean path — order was created on the storefront with full
    // structured data (items, variants, delivery address). No parsing needed.
    const awaitingOrder = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "awaiting_payment",
        orderSource: "storefront",
    }).sort({ createdAt: -1 });

    if (awaitingOrder) {
        console.log(`✅ Found storefront awaiting_payment order ${awaitingOrder._id} — attaching receipt directly.`);

        let url = imageUrl;
        let publicId = imagePublicId;

        if (!url && mediaUrl) {
            try {
                const uploaded = await uploadCustomerImageToCloudinary(mediaUrl, sellerId, normalizedPhone, "payment-receipts");
                url = uploaded.url;
                publicId = uploaded.publicId;
            } catch (err) {
                console.error("Payment receipt upload failed:", err.message);
                url = "";
                publicId = "";
            }
        }

        awaitingOrder.paymentReceiptUrl = url || "";
        awaitingOrder.paymentReceiptPublicId = publicId || "";
        awaitingOrder.paymentReceiptSubmittedAt = new Date();
        awaitingOrder.status = "pending";
        await awaitingOrder.save();

        const productSummary = (awaitingOrder.items || [])
            .map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ""}${i.name}${i.selectedVariants?.length ? ` (${i.selectedVariants.map(v => v.value).join(", ")})` : ""}`)
            .join(", ") || "Order Item";

        try {
            await sendSalesNotification(sellerUserId, {
                orderId: awaitingOrder._id.toString(),
                customerName: awaitingOrder.customerName || awaitingOrder.customerPhone,
                productName: productSummary,
                amountPaid: awaitingOrder.totalPrice,
                deliveryFee: awaitingOrder.deliveryFee,
                deliveryLocation: awaitingOrder.deliveryAddress || awaitingOrder.deliveryLocation || "",
                isConfirmed: false,
            });
        } catch (err) {
            console.warn("Sales notification failed:", err.message);
        }

        // Update leadStage
        UserModel.updateOne(
            { _id: sellerUserId, "whatsapp.contacts.list.phone": normalizedPhone },
            { $set: { "whatsapp.contacts.list.$.leadStage": "converted" } }
        ).catch(() => {});

        return { handled: true, order: awaitingOrder, isNewProof: true };
    }

    // ── Priority 2: Legacy path — existing pending order or WhatsApp-chat order ─
    const pendingOrder = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "pending",
    }).sort({ createdAt: -1 });

    const alreadyHadProof = !!(pendingOrder && pendingOrder.paymentReceiptUrl);
    let order = pendingOrder;

    const paymentStage = isPaymentStage(recentMessages, session);

    // Treat inbound images as payment proof ONLY when in an active payment stage (expectingPayment / bank details shared)
    if (!pendingOrder && !paymentStage) {
        console.log("ℹ️ No active payment stage or pending order expecting payment — ignoring image as payment receipt.");
        return { handled: false, noActivePaymentStage: true };
    }

    let url = imageUrl;
    let publicId = imagePublicId;

    if (!url && mediaUrl) {
        try {
            const uploaded = await uploadCustomerImageToCloudinary(
                mediaUrl,
                sellerId,
                normalizedPhone,
                "payment-receipts"
            );
            url = uploaded.url;
            publicId = uploaded.publicId;
        } catch (err) {
            console.error("Payment receipt upload failed:", err.message);
            url = "";
            publicId = "";
        }
    }

    // Verify using Groq vision model that the image is actually a payment receipt
    // BUT: if there's a pending order OR we're clearly in payment stage, trust the context
    // and skip AI verification — the conversation already told us payment was expected.
    const skipVerification = !!pendingOrder || paymentStage;
    if (!skipVerification) {
        const isVerifiedReceipt = await verifyReceiptWithGroq({ imageUrl: url, mediaUrl });
        if (!isVerifiedReceipt) {
            console.log("🤖 Groq verified image is NOT a payment receipt. Proceeding to product/conversation handling.");
            return { handled: false };
        }
    } else {
        console.log("✅ Payment stage detected — skipping Groq verification, treating as payment receipt.");
    }

    // 🚀 Senior Architecture: Staged Order Snapshot Priority
    let stagedOrder = session?.payment?.stagedOrder;
    const lastUserMessage = [...recentMessages].reverse().find(m => m.role === "user" || m.direction === "inbound");
    const lastUserText = lastUserMessage?.content || lastUserMessage?.text || "";
    const isCorrectionInbound = /(?:single|one|1)\s*(?:product|pair|item|piece)|not\s*double|only\s*one|just\s*one|want\s*1\b|wrong\s*quantity|make\s*it\s*1/i.test(lastUserText);

    if (stagedOrder && isCorrectionInbound) {
        console.log("🔄 Customer single-item correction detected — adjusting stagedOrder snapshot to 1x quantity.");
        if (stagedOrder.items && stagedOrder.items.length > 0) {
            stagedOrder.items = stagedOrder.items.map(item => ({
                ...item,
                quantity: 1,
            }));
            stagedOrder.subtotal = stagedOrder.items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
            stagedOrder.totalPrice = stagedOrder.subtotal + (stagedOrder.deliveryFee || 0);
        }
    }

    // Detect storefront template message: either explicitly flagged OR the customer message
    // itself contains structured bullet-point order items with ₦ prices (the standard
    // WhatsApp storefront order template format). This is Priority #2 after stagedOrder.
    const hasNewStorefrontOrder = /NEW ORDER FROM STOREFRONT/i.test(lastUserText) || /NEW ORDER FROM STOREFRONT/i.test(caption);

    // The payment image arrives as a separate message AFTER the storefront template.
    // So lastUserText is empty (image-only message). We must look back through recent
    // messages to find the most recent customer message that looks like a storefront order.
    const STOREFRONT_TEMPLATE_SIGNAL = /💰|🚚|product\s*page|pax26\.com\/store|Could\s*you\s*assist\s*me\s*with\s*this\s*order/i;

    // Scan back through customer messages (newest first) to find the storefront template
    const recentCustomerMsgs = [...recentMessages]
        .reverse()
        .filter(m => m.role === "user" || m.direction === "inbound" || m.senderType === "customer");

    let storefrontTemplateText = null;
    for (const msg of recentCustomerMsgs) {
        const txt = msg.content || msg.text || "";
        if (STOREFRONT_TEMPLATE_SIGNAL.test(txt)) {
            storefrontTemplateText = txt;
            break;
        }
    }

    // Parse from ONLY the identified storefront template message, never full history
    const sourceText = caption || lastUserText || storefrontTemplateText || "";
    const multiOrderFromCurrentMsg = parseMultiProductOrderFromText(sourceText, []);

    // A message qualifies as a storefront template if it has ≥1 priced items AND
    // contains typical template signals
    const isStorefrontTemplate = multiOrderFromCurrentMsg.items.length > 0 && (
        hasNewStorefrontOrder ||
        STOREFRONT_TEMPLATE_SIGNAL.test(sourceText)
    );

    let orderItems = [];
    let calculatedDeliveryFee = 0;
    let orderTotalPrice = 0;

    if (stagedOrder && stagedOrder.items && stagedOrder.items.length > 0) {
        // High Priority #1: Staged Order Snapshot locked during negotiation/payment agreement
        console.log("🔒 Consuming locked stagedOrder snapshot from session for order receipt.");
        orderItems = stagedOrder.items;
        calculatedDeliveryFee = Number(stagedOrder.deliveryFee) || 0;
        orderTotalPrice = Number(stagedOrder.totalPrice) || (stagedOrder.subtotal + calculatedDeliveryFee);
    } else if (isStorefrontTemplate) {
        // High Priority #2: Direct Storefront template payload — use the identified template text
        // Note: sourceText already points to the storefront template message even if the
        // current inbound message is a payment image (image-only messages have no text).
        console.log("🛒 Consuming storefront template payload for order receipt.", multiOrderFromCurrentMsg.items.length, "item(s)");
        orderItems = multiOrderFromCurrentMsg.items;

        // Find the actual message object for the storefront template (for fee/total extraction)
        const templateMsgObj = storefrontTemplateText
            ? recentCustomerMsgs.find(m => (m.content || m.text || "") === storefrontTemplateText)
            : lastUserMessage;

        calculatedDeliveryFee = extractDeliveryFeeFromConversation(
            templateMsgObj ? [templateMsgObj] : [],
            [],
            sourceText
        );
        orderTotalPrice =
            extractOrderTotalFromConversation(templateMsgObj ? [templateMsgObj] : []) ||
            (orderItems.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0) + calculatedDeliveryFee);
    } else if (session?.payment?.pendingItems && session.payment.pendingItems.length > 0) {
        // High Priority #3: Session pendingItems fallback
        console.log("📋 Consuming session pendingItems for order receipt.");
        orderItems = isCorrectionInbound
            ? session.payment.pendingItems.map(i => ({ ...i, quantity: 1 }))
            : session.payment.pendingItems;
        calculatedDeliveryFee = Number(session.payment.deliveryFee) || extractDeliveryFeeFromConversation(recentMessages);
        orderTotalPrice = Number(session.payment.pendingAmount) || (orderItems.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0) + calculatedDeliveryFee);
    } else {
        // Scoped fallback: Filter recentMessages to ONLY messages since the last completed receipt/order message
        const lastReceiptIndex = [...recentMessages].reverse().findIndex(m => {
            const txt = m.content || m.text || "";
            return txt.includes("OFFICIAL RECEIPT") || txt.includes("PAYMENT VERIFIED") || txt.includes("verifying your payment");
        });
        const currentOrderWindowMsgs = lastReceiptIndex >= 0 ? recentMessages.slice(-lastReceiptIndex) : recentMessages;

        // Fallback Priority #4a: Scan ONLY assistant order-summary messages (must contain ₦ amounts).
        // We deliberately exclude customer messages here to avoid parsing conversational text,
        // size options ("36-39 or 40-44"), URLs, and AI greetings as order line items.
        const assistantOrderMsgs = currentOrderWindowMsgs.filter(m => {
            const isAssistant = m.role === "assistant" || m.direction === "outbound" || m.senderType === "ai";
            if (!isAssistant) return false;
            const txt = m.content || m.text || "";
            // Only include messages that look like actual order summaries
            return /(?:₦|NGN)\s*[\d,]+/.test(txt) && /grand\s*total|order\s*confirm|delivery\s*fee|products?\s*total/i.test(txt);
        });

        const multiFromWindow = assistantOrderMsgs.length > 0
            ? parseMultiProductOrderFromText("", assistantOrderMsgs)
            : { items: [] };

        if (multiFromWindow.items && multiFromWindow.items.length > 0) {
            console.log("📋 Consuming parsed multi-product items from assistant order-summary messages:", multiFromWindow.items.length, "item(s)");
            const dbProducts = await SellerProductModel.find({ sellerId }).lean();
            orderItems = multiFromWindow.items.map(item => {
                const normName = normalizeSearchText(item.name);
                const matchedDbProd = (dbProducts || []).find(p => p.name && normalizeSearchText(p.name).includes(normName));
                return {
                    productId: matchedDbProd?._id || null,
                    name: item.name,
                    price: item.price > 0 ? item.price : (matchedDbProd?.discountPrice || matchedDbProd?.price || 0),
                    quantity: item.quantity || 1,
                    imageUrl: matchedDbProd?.images?.[0]?.url || "",
                };
            });
        } else {
            // Fallback Priority #4b: catalogue name-matching against assistant messages only
            const matchedProducts = await findAllProductsFromConversation(sellerId, currentOrderWindowMsgs);

            if (matchedProducts.length > 0) {
                orderItems = matchedProducts.map(p => ({
                    productId: p._id,
                    name: p.name,
                    price: p.discountPrice || p.price,
                    quantity: 1,
                    imageUrl: p.images?.[0]?.url || "",
                }));
            }
        }
        calculatedDeliveryFee = extractDeliveryFeeFromConversation(currentOrderWindowMsgs);
        orderTotalPrice = extractOrderTotalFromConversation(currentOrderWindowMsgs) || (orderItems.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0) + calculatedDeliveryFee);
    }

    const itemsSubtotal = orderItems.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
    const extractedFeeFromText = extractDeliveryFeeFromConversation(recentMessages);
    if (extractedFeeFromText > 0 && calculatedDeliveryFee === 0) {
        calculatedDeliveryFee = extractedFeeFromText;
    }

    if (itemsSubtotal > 0 && (!orderTotalPrice || orderTotalPrice <= 0)) {
        orderTotalPrice = itemsSubtotal + calculatedDeliveryFee;
    }

    // 🛡️ Deterministic Math Sanity Check: Total Price & Delivery Fee Consistency
    if (itemsSubtotal > 0 && orderTotalPrice > itemsSubtotal) {
        const inferredDeliveryFee = orderTotalPrice - itemsSubtotal;
        if (calculatedDeliveryFee > 0 && Math.abs(inferredDeliveryFee - calculatedDeliveryFee) > 1000) {
            const explicitTotal = Number(stagedOrder?.totalPrice) || extractOrderTotalFromConversation(recentMessages);
            if (explicitTotal && explicitTotal > itemsSubtotal) {
                console.warn(`⚠️ Multi-item subtotal gap (subtotal: ₦${itemsSubtotal}, explicit total: ₦${explicitTotal}). Preserving explicit grand total.`);
                orderTotalPrice = explicitTotal;
            } else {
                console.warn(`⚠️ Mismatch between inferred fee (₦${inferredDeliveryFee}) and explicit delivery fee (₦${calculatedDeliveryFee}). Correcting total price.`);
                orderTotalPrice = itemsSubtotal + calculatedDeliveryFee;
            }
        } else {
            calculatedDeliveryFee = inferredDeliveryFee;
        }
    } else if (itemsSubtotal > 0) {
        orderTotalPrice = itemsSubtotal + calculatedDeliveryFee;
    }

    const totalQuantity = orderItems.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;

    // Delivery location: prefer session/staged, then parse from storefront template text
    // (the template message contains 📍 Delivery Address: which parseMultiProductOrderFromText extracts)
    const templateDeliveryLocation = multiOrderFromCurrentMsg?.deliveryLocation || "";
    const resolvedDeliveryLocation = (
        session?.payment?.deliveryLocation ||
        stagedOrder?.deliveryLocation ||
        templateDeliveryLocation ||
        ""
    ).trim();

    if (!order) {
        order = await SellerOrderModel.create({
            sellerId,
            productId: orderItems[0]?.productId || null,
            customerPhone: normalizedPhone,
            customerName: customerName || "WhatsApp Customer",
            quantity: totalQuantity,
            totalPrice: orderTotalPrice,
            deliveryFee: calculatedDeliveryFee,
            deliveryLocation: resolvedDeliveryLocation,
            deliveryAddress: resolvedDeliveryLocation,
            items: orderItems,
            status: "pending",
            paymentReceiptUrl: url || "",
            paymentReceiptPublicId: publicId || "",
            paymentReceiptSubmittedAt: new Date(),
        });
    } else {
        let orderChanged = false;
        if (url) {
            order.paymentReceiptUrl = url;
            order.paymentReceiptPublicId = publicId;
            orderChanged = true;
        }
        if (resolvedDeliveryLocation && (order.deliveryLocation !== resolvedDeliveryLocation || order.deliveryAddress !== resolvedDeliveryLocation)) {
            order.deliveryLocation = resolvedDeliveryLocation;
            order.deliveryAddress = resolvedDeliveryLocation;
            orderChanged = true;
        }
        if (!order.paymentReceiptSubmittedAt) {
            order.paymentReceiptSubmittedAt = new Date();
            orderChanged = true;
        }
        if (orderTotalPrice && order.totalPrice !== orderTotalPrice) {
            order.totalPrice = orderTotalPrice;
            orderChanged = true;
        }
        if (order.deliveryFee !== calculatedDeliveryFee) {
            order.deliveryFee = calculatedDeliveryFee;
            orderChanged = true;
        }
        if (orderItems.length > 0 && JSON.stringify(order.items) !== JSON.stringify(orderItems)) {
            order.items = orderItems;
            order.quantity = totalQuantity;
            orderChanged = true;
        }
        if (orderChanged) {
            await order.save();
        }
    }

    const productSummaryName = (order.items && order.items.length > 0)
        ? order.items.map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`).join(", ")
        : (matchedProduct?.name || "Order Item");

    const isFirstProofUpload = !alreadyHadProof;

    if (isFirstProofUpload) {
        try {
            await sendSalesNotification(sellerUserId, {
                orderId: order._id.toString(),
                customerName: order.customerName || order.customerPhone,
                productName: productSummaryName,
                amountPaid: order.totalPrice,
                deliveryFee: order.deliveryFee,
                deliveryLocation: order.deliveryLocation || order.deliveryAddress || "",
                isConfirmed: false,
            });
            console.log("🔔 Sales alert sent for payment proof upload (Order:", order._id, "| Product:", productSummaryName, ")");
        } catch (err) {
            console.warn("Sales notification failed:", err.message);
        }
    } else {
        console.log("ℹ️ Order already had payment proof attached — skipping duplicate sales alert (Order:", order._id, ")");
    }

    // Automatically update customer's leadStage to 'converted'
    try {
        await UserModel.updateOne(
            { _id: sellerUserId, "whatsapp.contacts.list.phone": normalizedPhone },
            { $set: { "whatsapp.contacts.list.$.leadStage": "converted" } }
        );
        console.log("✅ Customer leadStage automatically updated to 'converted' for:", normalizedPhone);
    } catch (leadErr) {
        console.warn("Failed to update leadStage to converted:", leadErr.message);
    }

    return { handled: true, order, isNewProof: isFirstProofUpload };
}

function generateOrderCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "ORD-";
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function extractDeliveryFeeFromConversation(recentMessages = [], matchedProducts = [], inboundText = "") {
    const reversedAssistantMsgs = [...recentMessages]
        .reverse()
        .filter((m) => m.role === "assistant" || m.direction === "outbound" || m.senderType === "ai")
        .map((m) => m.content || m.text || "");

    const deliveryPatterns = [
        /(?:delivery\s+will\s+be|delivery\s+is|delivery\s+fee\s+is|delivery\s+cost\s+is|shipping\s+fee\s+is|delivery|shipping)[\s:]*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /\+\s*(?:₦|N|NGN)?\s*([\d,]+)\s*\((?:delivery|shipping)\)/i,
        /\((?:delivery|shipping):\s*(?:₦|N|NGN)?\s*([\d,]+)\)/i,
    ];

    for (const text of reversedAssistantMsgs) {
        for (const pattern of deliveryPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const fee = parseInt(match[1].replace(/,/g, ""), 10);
                if (!isNaN(fee) && fee >= 0) return fee;
            }
        }
    }

    const combinedText = inboundText + "\n" + recentMessages.map((m) => m.content || m.text || "").join("\n");
    for (const pattern of deliveryPatterns) {
        const match = combinedText.match(pattern);
        if (match && match[1]) {
            const fee = parseInt(match[1].replace(/,/g, ""), 10);
            if (!isNaN(fee) && fee >= 0) return fee;
        }
    }

    if (matchedProducts && matchedProducts.length > 0) {
        const fees = matchedProducts.map(p => Number(p.deliveryFee) || 0);
        return Math.max(0, ...fees);
    }

    return 0;
}

export function parseMultiProductOrderFromText(inboundText = "", recentMessages = []) {
    const combinedText = inboundText + "\n" + recentMessages.map((m) => m.content || m.text || "").join("\n");

    // Extract Delivery Location if present (e.g. 📍 Delivery Address: Lagos Ikeja, No 10 Allen Ave)
    // Also handles bold format: 📍 *Delivery Address:* Lagos Ikeja, No 10 Allen Ave
    const locationMatch = combinedText.match(/(?:📍\s*\*?\s*Delivery\s*(?:Location|Address)\s*\*?|Delivery\s*Address|Address|Location):\s*\*?\s*([^\n*]+)/i);
    const deliveryLocation = locationMatch ? locationMatch[1].trim() : "";

    // Extract items list.
    // REQUIREMENT: Line MUST contain an explicit ₦ price AND a — separator to count as an order item.
    // This blocks URLs, labels, totals, size-option lines, and free-text conversation.
    const itemLines = [];
    const lines = combinedText.split("\n");

    // Two regex patterns to handle both storefront template format (bold asterisks) and plain format:
    //
    // Format A (storefront template): • 1x *Men's Monk Strap Shoes* — ₦43,500
    //                                  • 1x *Timberland 6-Inch Boot (Grade A)* — ₦62,000
    // Format B (AI order summary):    • 1x Men's Monk Strap Shoes — ₦43,500
    //                                  • Men's Monk Strap Shoes (x1) — ₦43,500
    //
    // Key design decisions:
    // - Name is captured GREEDILY between the opening and closing bold marker (or up to —)
    //   so parenthetical suffixes like "(Grade A)" or "(Pack of 3)" are included in the name
    // - Price is REQUIRED (₦ followed by digits) — lines without a price are rejected
    // - Quantity marker (1x, 2x, Qty:3) is optional

    // Pattern A: bold-wrapped name  •  [qty x]  *name*  —  ₦price
    const BOLD_ITEM_RE = /^(?:[•·*]|\d+\.)\s*(?:(\d+)\s*x\s*)?\*([^*\n]+?)\*\s*(?:\(Qty:\s*(\d+)\))?\s*[—–\-]+\s*(?:₦|NGN)\s*([\d,]+)/i;

    // Pattern B: plain name          •  [qty x]  name  —  ₦price
    const PLAIN_ITEM_RE = /^(?:[•·]|\d+\.)\s*(?:(\d+)\s*x\s*)?([^\n—–\-]+?)\s*(?:\(Qty:\s*(\d+)\))?\s*[—–\-]+\s*(?:₦|NGN)\s*([\d,]+)/i;

    // Lines that are definitely not order items regardless of format
    const NOISE_LINE_PATTERN = /https?:\/\/|www\.|\.com|\.org|fulfillment|product\s*page|hi[!,]?\s*i'?m\s*interested|could\s*you\s*assist|estimated|grand\s*total|products?\s*total|delivery\s*fee|subtotal|size\s*(?:36|40|44)|36[\s\-]*39|40[\s\-]*44/i;

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || NOISE_LINE_PATTERN.test(trimmedLine)) return;

        // Try bold format first (storefront template), then plain format
        let match = trimmedLine.match(BOLD_ITEM_RE) || trimmedLine.match(PLAIN_ITEM_RE);
        if (!match) return;

        const quantity = parseInt(match[1] || match[3] || "1", 10);
        const name = match[2]?.trim();
        const itemTotalPrice = match[4] ? parseInt(match[4].replace(/,/g, ""), 10) : 0;

        if (!name || name.length < 3) return;
        // Reject names that are clearly labels or URL fragments
        if (/total|delivery|shipping|fulfillment|https?:|\.com|\//i.test(name)) return;

        const qtyVal = isNaN(quantity) || quantity <= 0 ? 1 : quantity;
        // Reject unreasonable quantities or zero prices
        if (qtyVal > 999 || itemTotalPrice <= 0) return;

        itemLines.push({
            name,
            quantity: qtyVal,
            price: Math.round(itemTotalPrice / qtyVal),
        });
    });

    return {
        deliveryLocation,
        items: itemLines,
    };
}

/** Create pending order when customer confirms payment via text (no image yet) */
export async function createPendingOrderFromText({
    sellerId,
    sellerUserId,
    customerPhone,
    customerName,
    recentMessages = [],
    inboundText = "",
    session = null,
}) {
    const normalizedPhone = normalizePhone(customerPhone);

    const existing = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "pending",
    });

    if (existing) return { created: false, order: existing };

    const paymentStage = isPaymentStage(recentMessages, session);
    const paidViaText = inboundText && PAYMENT_KEYWORDS.test(inboundText);

    // ONLY create pending order from text if an active payment stage exists (expectingPayment === true)
    if (!paymentStage || !paidViaText) {
        return { created: false, noActivePaymentStage: !paymentStage };
    }

    const matchedProduct = await resolveProduct(sellerId, recentMessages);
    if (!matchedProduct?._id) return { created: false };

    const parsedTotal = extractOrderTotalFromConversation(recentMessages);
    const orderTotalPrice = parsedTotal || matchedProduct.price || 0;
    const orderCode = generateOrderCode();
    const multiOrderData = parseMultiProductOrderFromText(inboundText, recentMessages);
    const extractedDeliveryFee = extractDeliveryFeeFromConversation(recentMessages, matchedProduct ? [matchedProduct] : [], inboundText);
    const resolvedLoc = session?.payment?.deliveryLocation || session?.payment?.stagedOrder?.deliveryLocation || multiOrderData.deliveryLocation || "";

    const order = await SellerOrderModel.create({
        orderCode,
        sellerId,
        productId: matchedProduct._id,
        customerPhone: normalizedPhone,
        customerName: customerName || "WhatsApp Customer",
        quantity: multiOrderData.items.reduce((sum, i) => sum + i.quantity, 0) || 1,
        totalPrice: orderTotalPrice,
        deliveryFee: extractedDeliveryFee,
        items: multiOrderData.items.length ? multiOrderData.items : [{
            productId: matchedProduct._id,
            name: matchedProduct.name,
            price: matchedProduct.price || orderTotalPrice,
            quantity: 1,
            imageUrl: matchedProduct.images?.[0]?.url || "",
        }],
        deliveryLocation: resolvedLoc,
        deliveryAddress: resolvedLoc,
        status: "pending",
    });

    const prodSummaryName = order.items?.length
        ? order.items.map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`).join(", ")
        : (matchedProduct?.name || "Product");

    sendMobilePush(sellerUserId, {
        type:  "new_order",
        title: "🛍️ New Order Placed!",
        body:  `${order.customerName}: ${prodSummaryName} · ₦${(order.totalPrice || 0).toLocaleString()}`,
        data:  { orderId: order._id.toString(), phone: normalizedPhone },
    }).catch(err => console.warn("Pending order push error:", err?.message));

    return { created: true, order };
}

export function buildPaymentReceiptContext() {
    return `[SYSTEM: Customer sent a payment proof / receipt screenshot.
The receipt has been recorded and sent to the seller team for verification.
Reply IMMEDIATELY to the customer with this exact response (or very close variant):
"Thank you for sending your payment proof! Our team is verifying your payment and will forward your official receipt once confirmed."
Do NOT ask for any further proof or images.]`;
}
