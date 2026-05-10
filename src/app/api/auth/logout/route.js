import { NextResponse } from "next/server";

export async function GET(req) {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );
  
  response.cookies.delete("UserToken", { path: "/" });
  return response;
}
