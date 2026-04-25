/**
 * customerImageSearch.js
 *
 * Handles the full flow when a customer sends an image on WhatsApp:
 *   1. Download the image from WhatsApp media URL
 *   2. Upload to Cloudinary (with seller tagging + visual search indexing)
 *   3. Run visual similarity search against the seller's product images
 *   4. Return matched products (real data only — no invention)
 *   5. Save the customer image to SellerMediaModel for records
 *
 * Usage in your WhatsApp webhook handler:
 *   import { handleCustomerImage } from "./customerImageSearch.js";
 *   const result = await handleCustomerImage({ sellerId, mediaUrl, customerPhone });
 *   // result.matches → array of matched SellerProductModel docs
 *   // result.customerImageUrl → saved Cloudinary URL
 */

import cloudinary from "cloudinary";
import SellerMediaModel from "../ults/models/SellerMediaModel.js";
import SellerProductModel from "../ults/models/SellerProductModel.js";

// ── Cloudinary config ────────────────────────────────────────
// Make sure your env has: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SIMILARITY_THRESHOLD = 0.7; // 0–1: how similar the image must be (tune this)
const MAX_MATCHES = 3;            // max products to return to the AI

/* ─────────────────────────────────────────────────────────────
   STEP 1: Download WhatsApp media and upload to Cloudinary
   WhatsApp media URLs require auth headers — fetch via your
   Meta API credentials before passing the buffer to Cloudinary.
───────────────────────────────────────────────────────────── */
async function uploadCustomerImageToCloudinary(mediaUrl, sellerId, customerPhone) {
    // Fetch the image from WhatsApp (requires Bearer token for Meta API media URLs)
    const response = await fetch(mediaUrl, {
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch WhatsApp media: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with:
    // - visual search indexing enabled (required for similarity search)
    // - tags for easy lookup
    // - folder organisation per seller
    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
            {
                folder: `pax26/${sellerId}/customer-images`,
                tags: [`seller-${sellerId}`, `customer-${customerPhone}`, "customer-image"],
                // 🔑 This enables Cloudinary Visual Search indexing
                visual_search: true,
                resource_type: "image",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });

    return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
    };
}

/* ─────────────────────────────────────────────────────────────
   STEP 2: Run Cloudinary Visual Search
   Searches your Cloudinary account for images visually similar
   to the uploaded customer image, filtered to this seller's
   product images only (using tags).
───────────────────────────────────────────────────────────── */
async function findSimilarCloudinaryImages(customerPublicId, sellerId) {
    try {
        const searchResult = await cloudinary.v2.search
            .expression(
                // Only search within this seller's product images (not customer uploads)
                `tags=seller-${sellerId} AND tags=product AND NOT tags=customer-image`
            )
            .with_field("tags")
            .max_results(MAX_MATCHES)
            // Visual similarity search using the customer's uploaded image
            .visual_search(customerPublicId)
            .execute();

        return searchResult.resources || [];
    } catch (err) {
        console.warn("⚠️ Cloudinary visual search failed:", err.message);
        return [];
    }
}

/* ─────────────────────────────────────────────────────────────
   STEP 3: Map Cloudinary results back to SellerProductModel docs
   Each product image in Cloudinary has publicId stored in the
   SellerProductModel.images array — use that to find the product.
───────────────────────────────────────────────────────────── */
async function mapImagesToProducts(cloudinaryResources, sellerId) {
    if (!cloudinaryResources.length) return [];

    const publicIds = cloudinaryResources.map((r) => r.public_id);

    // Find products whose images array contains any of the matched publicIds
    const matchedProducts = await SellerProductModel.find({
        sellerId,
        isAvailable: true,
        "images.publicId": { $in: publicIds },
    }).lean();

    // Score and sort: products whose image appeared first in Cloudinary results
    // (Cloudinary returns them in similarity order) should rank higher
    const ranked = matchedProducts.map((product) => {
        const bestRank = product.images.reduce((best, img) => {
            const rank = publicIds.indexOf(img.publicId);
            return rank !== -1 && (best === -1 || rank < best) ? rank : best;
        }, -1);
        return { ...product, _similarityRank: bestRank };
    });

    return ranked
        .filter((p) => p._similarityRank !== -1)
        .sort((a, b) => a._similarityRank - b._similarityRank)
        .slice(0, MAX_MATCHES);
}

/* ─────────────────────────────────────────────────────────────
   STEP 4: Save customer image to SellerMediaModel for records
───────────────────────────────────────────────────────────── */
async function saveCustomerImageRecord(sellerId, url, publicId, customerPhone) {
    try {
        await SellerMediaModel.create({
            sellerId,
            productId: null, // not linked to a product — it's a customer enquiry image
            url,
            publicId,
            type: "image",
            tags: [`customer-${customerPhone}`, "customer-enquiry"],
            isPrimary: false,
        });
    } catch (err) {
        // Non-fatal — don't block the response
        console.warn("⚠️ Failed to save customer image record:", err.message);
    }
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT: handleCustomerImage
   Call this from your WhatsApp webhook when a customer sends
   an image message.

   Returns:
   {
     success: boolean,
     customerImageUrl: string,     // saved Cloudinary URL
     matches: SellerProductModel[],     // matched products (may be empty)
     hasMatches: boolean,
   }
───────────────────────────────────────────────────────────── */
export async function handleCustomerImage({ sellerId, mediaUrl, customerPhone }) {
    // 1. Upload customer image to Cloudinary (indexed for visual search)
    const { url, publicId } = await uploadCustomerImageToCloudinary(
        mediaUrl,
        sellerId,
        customerPhone
    );

    // 2. Save record to DB (non-blocking)
    saveCustomerImageRecord(sellerId, url, publicId, customerPhone);

    // 3. Run visual similarity search
    const similarImages = await findSimilarCloudinaryImages(publicId, sellerId);

    // 4. Map to actual product documents
    const matches = await mapImagesToProducts(similarImages, sellerId);

    return {
        success: true,
        customerImageUrl: url,
        matches,
        hasMatches: matches.length > 0,
    };
}