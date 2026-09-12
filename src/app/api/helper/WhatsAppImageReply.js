import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";

const WHATSAPP_API_VERSION = "v19.0";
const WHATSAPP_API_BASE = "https://graph.facebook.com";

/**
 * forceJpegUrl
 * 
 * Converts any Cloudinary URL to deliver as JPEG regardless of stored format.
 * WhatsApp only supports JPEG/PNG — WebP and AVIF are silently dropped.
 * 
 * Cloudinary supports on-the-fly format conversion via URL transformation:
 * /image/upload/f_jpg/v123.../file.webp  → delivers as JPEG
 */
/**
 * forceJpegUrl
 * 
 * Converts image URLs (Cloudinary, Unsplash, etc.) to deliver as JPEG.
 * WhatsApp only supports JPEG/PNG — WebP and AVIF are silently dropped or rejected by Meta API.
 */
function forceJpegUrl(url) {
  if (!url || typeof url !== "string") return url;

  // Unsplash: replace auto=format with fm=jpg or append &fm=jpg
  if (url.includes("images.unsplash.com")) {
    let cleanUrl = url.replace(/auto=format/g, "fm=jpg");
    if (!cleanUrl.includes("fm=jpg")) {
      cleanUrl += (cleanUrl.includes("?") ? "&" : "?") + "fm=jpg&q=80";
    }
    return cleanUrl;
  }

  // Cloudinary: insert f_jpg,q_auto transformation
  if (url.includes("/image/upload/")) {
    if (!url.includes("/f_jpg")) {
      return url.replace(/\/image\/upload\//, "/image/upload/f_jpg,q_auto/");
    }
    return url;
  }

  return url;
}

/**
 * uploadImageToWhatsApp
 *
 * Downloads the image as JPEG, then uploads it to WhatsApp's
 * media endpoint to get a stable media_id.
 *
 * Returns { mediaId } on success, null on failure.
 */
async function uploadImageToWhatsApp(imageUrl, phoneNumberId, token) {
  try {
    // Force JPEG delivery from Cloudinary / Unsplash — WhatsApp rejects AVIF / WebP
    const jpegUrl = forceJpegUrl(imageUrl);
    console.log("📥 Fetching image as JPEG:", jpegUrl);

    const imgRes = await fetch(jpegUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/jpeg, image/png;q=0.9",
      },
    });
    if (!imgRes.ok) {
      console.error("❌ Failed to fetch image from URL:", imgRes.status, imageUrl);
      return null;
    }

    const rawContentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imgRes.arrayBuffer();

    // Ensure content type is acceptable by WhatsApp (jpeg or png only)
    const validTypes = ["image/jpeg", "image/png"];
    const contentType = validTypes.includes(rawContentType.toLowerCase()) ? rawContentType.toLowerCase() : "image/jpeg";

    // 2. Upload to WhatsApp media endpoint
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append(
      "file",
      new Blob([buffer], { type: contentType }),
      "product.jpg"
    );
    formData.append("type", contentType);

    const uploadRes = await fetch(
      `${WHATSAPP_API_BASE}/${WHATSAPP_API_VERSION}/${phoneNumberId}/media`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || uploadData.error || !uploadData.id) {
      console.error("❌ WhatsApp media upload failed:", JSON.stringify(uploadData));
      return null;
    }

    console.log("✅ WhatsApp media uploaded, mediaId:", uploadData.id);
    return uploadData.id;
  } catch (err) {
    console.error("❌ uploadImageToWhatsApp error:", err.message);
    return null;
  }
}

export async function sendWhatsAppImageReply({
  phoneNumberId,
  to,
  imageUrl,
  caption = "",
}) {
  if (!phoneNumberId || !to || !imageUrl) {
    console.warn("⚠️ sendWhatsAppImageReply: missing required fields");
    return { success: false, error: "Missing phoneNumberId, to, or imageUrl" };
  }

  try {
    await connectDb();

    const user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId })
      .select("whatsapp.accessToken");

    const token = user?.whatsapp?.accessToken;
    if (!token) {
      console.error(`❌ No accessToken found for phoneNumberId: ${phoneNumberId}`);
      return { success: false, error: "No WhatsApp access token found" };
    }

    const messagesUrl = `${WHATSAPP_API_BASE}/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
    const safeJpegUrl = forceJpegUrl(imageUrl);

    // ── Strategy 1: upload to WhatsApp first, send by media_id ──
    // Most reliable — Meta doesn't need to fetch an external URL
    const mediaId = await uploadImageToWhatsApp(safeJpegUrl, phoneNumberId, token);

    let payload;
    if (mediaId) {
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "image",
        image: {
          id: mediaId,
          ...(caption ? { caption } : {}),
        },
      };
      console.log("📤 Sending image by media_id:", mediaId);
    } else {
      // ── Strategy 2: fallback to link if upload failed ──
      console.warn("⚠️ Media upload failed — falling back to link method with JPEG URL:", safeJpegUrl);
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "image",
        image: {
          link: safeJpegUrl,
          ...(caption ? { caption } : {}),
        },
      };
      console.log("📤 Sending image by link:", safeJpegUrl.slice(0, 80));
    }

    const res = await fetch(messagesUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("❌ WhatsApp image send failed:", JSON.stringify(data));
      return { success: false, error: data.error, messageId: null };
    }

    const messageId = data.messages?.[0]?.id || null;
    console.log("✅ WhatsApp image sent, messageId:", messageId, "| status:", data.messages?.[0]?.message_status);

    return { success: true, messageId };
  } catch (err) {
    console.error("❌ sendWhatsAppImageReply network error:", err.message);
    return { success: false, error: err.message, messageId: null };
  }
}
