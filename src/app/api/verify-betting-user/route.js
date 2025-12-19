import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";

export async function OPTIONS(){
   return new NextResponse(null,({status:200, headers:corsHeaders()}));
}

export async function POST(req) {
  const reqBody = await req.json();
  try {
   const {customerId, platform} = reqBody;
  if(!customerId || !platform){
   return NextResponse.json({message:"!customerId or platform not found", success:false}, {status:400, headers:corsHeaders()})
  };

   const response =  await axios.get(`https://www.nellobytesystems.com/APIVerifyBettingV1.asp?UserID=${process.env.CLUBKONNECT_USERID}&APIKey=${process.env.CLUBKONNECT_APIKEY}&BettingCompany=${platform}&CustomerID=${customerId}`);
   console.log("response: ", response);
    return NextResponse.json({ message:"success", data:response.data, success:true }, {status:200, headers:corsHeaders()});
  } catch (error) {
   console.log("User verification err: ", error);
   return NextResponse.json({ message:"An error occured", success:false }, {status:500, headers:corsHeaders()});
  }
}