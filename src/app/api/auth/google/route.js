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

        let user;

        user = await UserModel.findOne({ email });
        if (!user) {
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
            user = await UserModel.create({
                name,
                email,
                number,
                password: null,
                pin: null,
                referralHostId: referralHostId,
                provider,
                isPasswordSet: false,
                providerId: providerId || null,
                referralCode,
                profileImage
            });
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
        if (userObj.pin) {
            userObj.pin = true;
        } else {
            userObj.pin = null;
        }
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

            await sendUserVerification(user);

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
