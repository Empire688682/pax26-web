import axios from "axios";
import { NextResponse } from "next/server";

export default async function handler(req, res) {
  try {
    const { data } = await axios.get("https://ifconfig.me/ip");
    return NextResponse.jso({ outgoingIp: String(data).trim() }, { status: 200 });
  } catch (err) {
    return NextResponse.jso({ error: err.message }, { status: 500 });
  }
}