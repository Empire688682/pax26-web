import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
    const {disco, meterNumber} = await req.json();
    const availableDiscos = {
        "EKO_ELECTRIC": "01",
        "IKEJA_ELECTRIC": "02",
        "ABUJA_ELECTRIC": "03",
        "KANO_ELECTRIC": "04",
        "PORTHACOURT_ELECTRIC": "05",
        "JOS_ELECTRIC": "06",
        "IBADAN_ELECTRIC": "07",
        "KADUNA_ELECTRIC": "08",
        "ENUGU_ELECTRIC": "09",
        "BENIN_ELECTRIC": "10",
        "YOLA_ELECTRIC": "11",
        "ABA_ELECTRIC": "12",
     };

    const verifyUrl = `https://www.nellobytesystems.com/APIVerifyElectricityV1.asp?UserID=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&ElectricCompany=${availableDiscos[disco]}&MeterNo=${meterNumber}`
    try {
        const res = await fetch(verifyUrl, {
            method: "POST",
            headers:{
                "api-key":process.env.VTPASS_SECRET_KEY,
                "secret-key": process.env.VTPASS_SECRET_KEY
            }
        });
        const data = await res.json();

        console.log("data: ", data);
        console.log("verifyUrl: ", verifyUrl);

        if(data.status !== "00") {
            return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500, headers:corsHeaders() });
        } else {
            return NextResponse.json({ success: true, message: "Meter Number Verified", data:data.customer_name }, { status: 200, headers:corsHeaders() });
        }
    } catch (error) {
        console.log("Verify-Error:", error);
        return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500, headers:corsHeaders() });
    }
}