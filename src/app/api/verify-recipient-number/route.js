import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../helper/VerifyToken";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() })
}

export async function POST(req) {
    await connectDb();
    try {
        const body = await req.json();
        const { recipientNumber } = body;

        const userId = await verifyToken(req);
        const user = await UserModel.findById(userId);
        if(!user){
             return NextResponse.json(
                { message: "User not authenticated" },
                { status: 400, headers: corsHeaders() }
            );
        }

        if (!recipientNumber) {
            return NextResponse.json(
                { message: "Recipient number required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        //verify user recipientNumber
        const requiredNumber = "0" + recipientNumber
        const recipient = await UserModel.findOne({number:requiredNumber});

        if(!recipient){
            return NextResponse.json(
                { message: "Recipient number not valid" },
                { status: 400, headers: corsHeaders() }
            );
        };

        const name = recipient?.name
        return NextResponse.json(
            { message: "success", data:{name}},
                { status: 200, headers: corsHeaders() }
            );
        
    } catch (error) {
        console.log("VerifyAccountNumErr: ", error);
        return NextResponse.json(
                { message: "An error occured" },
                { status: 400, headers: corsHeaders() }
            );
    }
}