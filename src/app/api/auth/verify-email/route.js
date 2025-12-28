import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {headers:corsHeaders(), status:200})
}

export async function POST(req) {
    await connectDb();
    try {
        const reqBody = await req.json();
        const {email, code} = reqBody
    } catch (error) {
       console.log("User-verify-Error: ", error);
       return NextResponse.json({}, {}) 
    }
}