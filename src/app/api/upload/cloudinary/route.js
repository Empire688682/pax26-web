import cloudinary from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";

function isProductUpload(folder = "", tags = "") {
    const folderStr = String(folder).toLowerCase();
    const tagsStr = String(tags).toLowerCase();
    return (
        tagsStr.split(",").map((t) => t.trim()).includes("product") ||
        folderStr.includes("products") ||
        folderStr.startsWith("sellers/")
    );
}

export async function POST(req) {
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const folder = formData.get("folder") || "pax26";
        const tags = formData.get("tags");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Block product image uploads until WhatsApp is connected.
        if (isProductUpload(folder, tags)) {
            await connectDb();
            const user = await UserModel.findById(userId)
                .select("whatsapp.connected whatsapp.displayPhone")
                .lean();

            if (!user?.whatsapp?.connected || !user?.whatsapp?.displayPhone) {
                return NextResponse.json(
                    { error: "Connect WhatsApp before uploading product images." },
                    { status: 400 }
                );
            }
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    tags: tags ? String(tags).split(",") : [],
                    resource_type: "image",
                    visual_search: true,
                },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
        });

    } catch (err) {
        console.error("UPLOAD ERROR:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
