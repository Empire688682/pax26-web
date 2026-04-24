import cloudinary from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const formData = await req.formData();
        console.log("Received upload request with formData:", formData);
        const file = formData.get("file");
        const folder = formData.get("folder") || "pax26";
        const tags = formData.get("tags");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    tags: tags ? tags.split(",") : [],
                    resource_type: "image",
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