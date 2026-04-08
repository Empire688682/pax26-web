import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";


export async function OPTIONS() {
    return new NextResponse(null, {status:200, header:corsHeaders()});
}

export async function POST(req) {
    await connectDb();
    try {
        const body = await req.json();
        const { contactNumber, status } = body;

        if(!contactNumber.trim() || !status.trim()){
            return NextResponse.json(
                { message: "Contact number and status are required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        const userId = await verifyToken(req);
        const user = await UserModel.findById(userId);
        if(!user){
             return NextResponse.json(
                { message: "User not authenticated" },
                { status: 400, headers: corsHeaders() }
            );
        };
        if(status === "whitelist"){
            await UserModel.findByIdAndUpdate(userId, {
                $addToSet: { "whatsapp.contacts.whitelist": contactNumber.trim() },
                $pull: { "whatsapp.contacts.blacklist": contactNumber.trim() }
            });
        };

          if(status === "blacklist"){
            await UserModel.findByIdAndUpdate(userId, {
                $addToSet: { "whatsapp.contacts.blacklist": contactNumber.trim() },
                $pull: { "whatsapp.contacts.whitelist": contactNumber.trim() },
            })
        }

    } catch (error) {
        console.log("WhatsAppContactsPolicyErr: ", error);
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 400, headers: corsHeaders() }
        );
    }
}