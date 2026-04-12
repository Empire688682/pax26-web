// src/app/api/inbox/lead/route.js
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "@/app/api/helper/VerifyToken";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    await connectDb();
    const userId = await verifyToken(req);
    const { phone, leadStage, notes, tags, followUpAt, assignedTo } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "phone is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const fields = {};
    if (leadStage)           fields["whatsapp.contacts.list.$.leadStage"]  = leadStage;
    if (notes !== undefined) fields["whatsapp.contacts.list.$.notes"]      = notes;
    if (tags !== undefined)  fields["whatsapp.contacts.list.$.tags"]       = tags;
    if (followUpAt !== undefined) fields["whatsapp.contacts.list.$.followUpAt"] = followUpAt ? new Date(followUpAt) : null;
    if (assignedTo !== undefined) fields["whatsapp.contacts.list.$.assignedTo"] = assignedTo;
    fields["whatsapp.contacts.list.$.updatedAt"] = new Date();

    const result = await UserModel.updateOne(
      { _id: userId, "whatsapp.contacts.list.phone": phone },
      { $set: fields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, message: "Lead updated" },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.log("LeadUpdateErr:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lead" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET(req) {
  try {
    await connectDb();
    const userId = await verifyToken(req);
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");

    const user = await UserModel.findById(userId)
      .select("whatsapp.contacts.list")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    let contacts = user?.whatsapp?.contacts?.list ?? [];
    if (stage) contacts = contacts.filter(c => c.leadStage === stage);
    contacts.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return NextResponse.json(
      { success: true, data: contacts },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.log("LeadFetchErr:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch leads" },
      { status: 500, headers: corsHeaders() }
    );
  }
}