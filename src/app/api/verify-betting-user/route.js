import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";

export async function OPTIONS(){
   return new NextResponse(null,({status:200, headers:corsHeaders()}));
}

export async function POST(req) {
  const reqBody = await req.json();
  const {customerId, platform} = reqBody;
  console.log("reqBody: ", reqBody)
  if(!customerId || !platform){
   return NextResponse.json({message:"!customerId or platform not found", success:false}, {status:400, headers:corsHeaders()})
  };

  console.log("KEYS: ", `https://www.nellobytesystems.com/APIVerifyBettingV1.asp?customerId=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&BettingCompany=${platform}&CustomerID=${customerId}` )

   const response =  await axios.get(`https://www.nellobytesystems.com/APIVerifyBettingV1.asp?customerId=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&BettingCompany=NAIRABET&CustomerID=${customerId}`)
   console.log("response: ", response?.data);
   return;
    return NextResponse.json({ message:"success", data:response, success:true }, {status:200, headers:corsHeaders()});
}