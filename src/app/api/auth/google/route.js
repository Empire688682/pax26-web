import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";
import dotenv from "dotenv";
import validator from "validator";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import ReferralModel from "@/app/ults/models/ReferralModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { customAlphabet } from "nanoid";
import { sendUserVerification } from "../services/sendVerificationService";
import { sendTransactionalEmail } from "@/app/ults/utils/sendpulseMail";

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() })
};



export async function POST(req) {
    const reBody = await req.json();

    const userAgent = req.headers.get('user-agent') || "";
    const isMobile = userAgent.includes('Expo') ||
        userAgent.includes('ReactNative') ||
        req.headers.get('x-client-type') === 'mobile' ||
        userAgent.includes('okhttp');

    try {
        await connectDb();

        const {
            name,
            email,
            number,
            refHostCode,
            profileImage,
            providerId,
            provider,
            country,
        } = reBody;


        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { success: false, message: "Name and email are required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        if (!validator.isEmail(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Normalize email always
        const normalizedEmail = email.trim().toLowerCase();

        // Normalize phone if provided
        const normalizedNumber = number
            ? number.trim().replace(/\s+/g, "").replace(/^\+?234/, "0").replace(/^234/, "0")
            : null;

        let user;

        user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            // New user — phone is required
            if (!normalizedNumber) {
                return NextResponse.json(
                    { success: false, message: "Phone number is required" },
                    { status: 400, headers: corsHeaders() }
                );
            }
            // Check phone uniqueness
            const existingPhone = await UserModel.findOne({ number: normalizedNumber });
            if (existingPhone) {
                return NextResponse.json(
                    { success: false, message: "This phone number is already registered to another account." },
                    { status: 400, headers: corsHeaders() }
                );
            }
            //Generate referralCode
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const nextUserNumber = await UserModel.countDocuments() + 1;
            const prefx = (name || "").toUpperCase().slice(0, 3);
            const nanoid = customAlphabet(chars, 4);
            const referralCode = "PAX" + prefx + nanoid() + nextUserNumber;

            //Get referral host id
            let referralHostId = undefined
            if (refHostCode) {
                const refHost = await UserModel.findOne({ referralCode: refHostCode });
                referralHostId = refHost ? refHost._id : undefined;
            }
            const authTimestamp = Date.now()
            user = await UserModel.create({
                name,
                email: normalizedEmail,
                number: normalizedNumber || undefined,
                password: null,
                pin: null,
                authTimestamp,
                referralHostId: referralHostId,
                provider,
                isPasswordSet: false,
                providerId: providerId || null,
                referralCode,
                profileImage,
                userVerify: true,
                emailVerification: { isVerified: true },
                country: country || null,
            });

            // Notify admin of new Google signup (fire-and-forget)
            const signupAt = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
            sendTransactionalEmail({
                toEmail:   "asehindej@gmail.com",
                toName:    "Pax26 Admin",
                subject:   `🎉 New Signup (Google) — ${name} (${normalizedEmail})`,
                html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;"><div style="border-bottom:2px solid #22c55e;padding-bottom:12px;margin-bottom:20px;"><h2 style="color:#16a34a;margin:0;font-size:18px;">🎉 New User Signed Up (Google)</h2><span style="font-size:11px;color:#6b7280;font-family:monospace;">Pax26 Platform · ${signupAt}</span></div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:16px;"><p style="margin:0 0 6px;font-size:14px;"><strong>Name:</strong> ${name}</p><p style="margin:0 0 6px;font-size:14px;"><strong>Email:</strong> <a href="mailto:${normalizedEmail}" style="color:#16a34a;">${normalizedEmail}</a></p><p style="margin:0 0 6px;font-size:14px;"><strong>Phone:</strong> ${normalizedNumber || "—"}</p><p style="margin:0;font-size:14px;"><strong>Country:</strong> ${country || "—"}</p></div><a href="https://pax26-admin.vercel.app/users" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;">View in Admin Panel</a></div>`,
                text: `New Google signup: ${name} (${normalizedEmail}) · Phone: ${normalizedNumber || "—"} · ${country || ""} · ${signupAt}`,
                fromEmail: "info@pax26.com",
                fromName:  "Pax26 Platform",
            }).catch(() => {});
        }

        /* Patch country on returning user if they didn't have one yet */
        if (user && !user.country && country) {
            await UserModel.findByIdAndUpdate(user._id, { $set: { country } });
            user = await UserModel.findById(user._id);
        }

        // Handle referral if provided
        if (refHostCode) {
            if (referralHostId) {
                await ReferralModel.create({
                    referrer: referralHostId,
                    referredUser: user._id,
                });
            }
        }

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.transactionPin;
        delete userObj.isAdmin;
        delete userObj.provider;
        delete userObj.referralHost;
        delete userObj.walletBalance;
        delete userObj.__v;
        delete userObj.commissionBalance;
        delete userObj.forgottenPasswordToken;
        delete userObj.referralHostId;
        delete userObj.bvn;
        const finalUserData = userObj;
        delete userObj.emailVerification;
        delete userObj.phoneVerification;
        delete userObj._id;
        delete userObj.whatsapp;

        const userId = user._id;
        const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        if (isMobile) {
            return NextResponse.json(
                { success: true, message: "User created", finalUserData, token },
                { status: 200, headers: corsHeaders() }
            );
        } else {
            const res = NextResponse.json(
                { success: true, message: "User created", finalUserData },
                { status: 200, headers: corsHeaders() }
            );

            res.cookies.set("UserToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24, // 1 day
                sameSite: "lax",
                path: "/",
            });

            if (user && !user.userVerify) {
                // Since authenticated via Google, mark them as verified instead of sending an email
                await UserModel.updateOne({ _id: user._id }, { $set: { userVerify: true, "emailVerification.isVerified": true } });
            }

            return res;
        }
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Register Error occurred",
                debugError: JSON.stringify(error, Object.getOwnPropertyNames(error))
            },
            { status: 500, headers: corsHeaders() }
        );
    }
};
