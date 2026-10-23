import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import UserModel from "@/app/ults/models/UserModel";
import BannedEmailModel from "@/app/ults/models/BannedEmailModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

/** Helper – verify caller is an authenticated admin */
async function requireAdmin(req) {
  const userId = await verifyToken(req);
  if (!userId) return { error: "Unauthorized", status: 401 };
  const user = await UserModel.findById(userId).select("isAdmin").lean();
  if (!user?.isAdmin) return { error: "Forbidden – admin only", status: 403 };
  return { userId };
}

/* ────────────────────────────────────────────────────────────────
   GET  /api/admin/banned-emails
   Returns all banned emails, newest first.
   Query params:
     ?page=1&limit=50  (default: page 1, 50 per page)
     ?search=text      (filters by email or userName)
──────────────────────────────────────────────────────────────── */
export async function GET(req) {
  await connectDb();
  const auth = await requireAdmin(req);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status, headers: corsHeaders() }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
    const limit  = Math.min(200, parseInt(searchParams.get("limit") || "50", 10));
    const search = (searchParams.get("search") || "").trim();

    const filter = search
      ? {
          $or: [
            { email:    { $regex: search, $options: "i" } },
            { userName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [bannedEmails, total] = await Promise.all([
      BannedEmailModel.find(filter)
        .sort({ bannedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BannedEmailModel.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, bannedEmails, total, page, limit },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[GET /admin/banned-emails]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch banned emails" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/* ────────────────────────────────────────────────────────────────
   POST  /api/admin/banned-emails
   Ban an email (optionally delete the user account first).

   Body:
   {
     email:          string  (required)
     reason?:        string
     userName?:      string
     originalUserId?: string
     deleteUser?:    boolean  — if true, also deletes the user document
   }
──────────────────────────────────────────────────────────────── */
export async function POST(req) {
  await connectDb();
  const auth = await requireAdmin(req);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status, headers: corsHeaders() }
    );
  }

  try {
    const body = await req.json();
    const { email, reason, userName, originalUserId, deleteUser } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Upsert — safe if already banned
    const banned = await BannedEmailModel.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          email:          normalizedEmail,
          userName:       userName  || "",
          reason:         reason    || "Account permanently banned",
          bannedBy:       "Admin",
          originalUserId: originalUserId || "",
          bannedAt:       new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Optionally delete the user account
    let userDeleted = false;
    if (deleteUser) {
      const deleted = await UserModel.findOneAndDelete({ email: normalizedEmail });
      userDeleted = !!deleted;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Email ${normalizedEmail} has been banned${userDeleted ? " and user account deleted" : ""}.`,
        banned,
        userDeleted,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[POST /admin/banned-emails]", error);
    return NextResponse.json(
      { success: false, message: "Failed to ban email" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/* ────────────────────────────────────────────────────────────────
   DELETE  /api/admin/banned-emails
   Unban an email so the user can register again.

   Body:
   { email: string }   OR   { id: string }   (BannedEmail _id)
──────────────────────────────────────────────────────────────── */
export async function DELETE(req) {
  await connectDb();
  const auth = await requireAdmin(req);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status, headers: corsHeaders() }
    );
  }

  try {
    const body = await req.json();
    const { email, id } = body;

    if (!email && !id) {
      return NextResponse.json(
        { success: false, message: "Provide email or id to unban" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const filter = id
      ? { _id: id }
      : { email: email.trim().toLowerCase() };

    const deleted = await BannedEmailModel.findOneAndDelete(filter);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Banned email record not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${deleted.email} has been unbanned and can register again.`,
        unbanned: deleted,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[DELETE /admin/banned-emails]", error);
    return NextResponse.json(
      { success: false, message: "Failed to unban email" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
