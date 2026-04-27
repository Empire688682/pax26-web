import cloudinary from "@/app/lib/cloudinary.js";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { publicId } = await req.json();

        if (!publicId) {
            return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
        }

        await cloudinary.uploader.destroy(publicId);

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("DELETE ERROR:", err);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}