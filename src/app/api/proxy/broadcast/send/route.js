/**
 * POST /api/proxy/broadcast/send
 *
 * Handles broadcast send entirely server-side in Next.js.
 * This replaces the pass-through to the admin backend because the admin
 * backend's /broadcast/send was a stub that never called Meta's API.
 *
 * Flow:
 *  1. Authenticate user via UserToken cookie
 *  2. Check plan limits
 *  3. Actually send each message via Meta WhatsApp Cloud API
 *  4. Save broadcast record with real per-contact delivery log
 *  5. Increment monthly usage counter
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import axios from "axios";

// ── Helper: send one WhatsApp text message via Meta Cloud API ──
async function sendOne({ phoneNumberId, accessToken, to, text }) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );
    return {
      success: true,
      messageId: res.data?.messages?.[0]?.id || null,
    };
  } catch (err) {
    const metaErr = err.response?.data?.error;
    return {
      success: false,
      error: metaErr
        ? `Meta error ${metaErr.code}: ${metaErr.message}`
        : err.message,
    };
  }
}

export async function POST(req) {
  try {
    await connectDb();

    // 1. Authenticate — verifyToken reads the httpOnly UserToken cookie
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { title, message, contacts } = await req.json();

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and message are required." },
        { status: 400 }
      );
    }

    // 2. Load user with WhatsApp credentials
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const phoneNumberId = user.whatsapp?.phoneNumberId;
    const accessToken   = user.whatsapp?.accessToken;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp is not connected on your account. Please connect your WhatsApp Business number first.",
        },
        { status: 400 }
      );
    }

    // 3. Build contact list
    let targetContacts = Array.isArray(contacts) ? contacts : [];
    if (targetContacts.length === 0 && user.whatsapp?.contacts?.list) {
      targetContacts = user.whatsapp.contacts.list
        .filter(c => c.status === "whitelist")
        .map(c => c.phone);
    }

    if (targetContacts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No contacts selected to send broadcast to." },
        { status: 400 }
      );
    }

    // 4. Check plan broadcast limit
    // broadcastContactsLimit: null = unlimited (Enterprise), 0 = not allowed (Free), N = monthly cap
    const broadcastLimit = user.paxAI?.broadcastContactsLimit;  // keep null as-is — do NOT coerce with ??
    const usedThisMonth  = user.paxAI?.broadcastContactsUsedThisMonth ?? 0;
    const plan           = user.paxAI?.plan || "free";

    if (plan === "free") {
      return NextResponse.json(
        {
          success: false,
          message: "Broadcast messaging is not included in the Free plan. Please upgrade to Starter or higher.",
        },
        { status: 403 }
      );
    }

    // broadcastLimit === null means unlimited (Enterprise) — skip the cap check entirely
    // broadcastLimit === 0 means the plan has no broadcast allowance
    if (broadcastLimit === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Broadcast messaging is not included in your current plan. Please upgrade to Starter or higher.",
        },
        { status: 403 }
      );
    }

    if (broadcastLimit !== null && broadcastLimit !== undefined) {
      // Finite cap — check remaining
      const remaining = Math.max(0, broadcastLimit - usedThisMonth);
      if (targetContacts.length > remaining) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot send broadcast. You attempted to send to ${targetContacts.length} contacts, but only ${remaining} remain on your monthly limit.`,
          },
          { status: 400 }
        );
      }
    }
    // null = unlimited — no cap check needed

    // 5. Send messages via Meta WhatsApp Cloud API — same API automation uses
    let successCount = 0;
    let failedCount  = 0;
    const deliveryLog = [];

    for (const phone of targetContacts) {
      const result = await sendOne({
        phoneNumberId,
        accessToken,
        to: phone,
        text: message.trim(),
      });

      deliveryLog.push({
        phone,
        status:    result.success ? "sent" : "failed",
        messageId: result.messageId || null,
        error:     result.error    || null,
        sentAt:    new Date(),
      });

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        console.warn(`[broadcast] Failed for ${phone}:`, result.error);
      }

      // Small throttle to respect Meta rate limits (80 msg/sec limit on Cloud API)
      await new Promise(r => setTimeout(r, 150));
    }

    // 6. Persist broadcast record directly in pax26 DB
    //    We avoid the admin backend entirely — same DB, simpler path.
    const { default: mongoose } = await import("mongoose");

    // Inline broadcast schema (avoids circular import with admin model)
    const BroadcastModel =
      mongoose.models.Broadcast ||
      mongoose.model(
        "Broadcast",
        new mongoose.Schema(
          {
            title:       String,
            message:     String,
            channel:     { type: String, default: "whatsapp" },
            recipients:  { type: String, default: "all" },
            status:      { type: String, default: "completed" },
            stats: {
              total:   { type: Number, default: 0 },
              success: { type: Number, default: 0 },
              failed:  { type: Number, default: 0 },
            },
            deliveryLog: [
              {
                phone:     String,
                status:    String,
                messageId: String,
                error:     String,
                sentAt:    Date,
                _id: false,
              },
            ],
            scheduledAt: Date,
            sentAt:      Date,
            createdBy:   mongoose.Schema.Types.ObjectId,
          },
          { timestamps: true }
        )
      );

    const broadcast = await BroadcastModel.create({
      title:       title.trim(),
      message:     message.trim(),
      channel:     "whatsapp",
      recipients:  "all",
      status:      "completed",
      stats: {
        total:   targetContacts.length,
        success: successCount,
        failed:  failedCount,
      },
      deliveryLog,
      sentAt:    new Date(),
      createdBy: user._id,
    });

    // 7. Increment monthly usage
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        "paxAI.broadcastContactsUsedThisMonth": targetContacts.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast "${title}" sent. ${successCount} delivered, ${failedCount} failed.`,
      data: broadcast,
      stats: { total: targetContacts.length, success: successCount, failed: failedCount },
    });

  } catch (error) {
    console.error("Broadcast send error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while sending broadcast." },
      { status: 500 }
    );
  }
}
