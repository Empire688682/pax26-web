/**
 * GET /api/app/version
 *
 * Returns the current minimum required app version.
 * The mobile app calls this on startup to detect if an update is available.
 *
 * Response:
 *   {
 *     minVersionCode: number,   // minimum versionCode required (integer)
 *     latestVersion:  string,   // display version string e.g. "1.1.0"
 *     playStoreUrl:   string,   // deep link to Play Store listing
 *     appStoreUrl:    string,   // App Store link (for future iOS)
 *     forceUpdate:    boolean,  // if true, block the app until updated
 *     message:        string,   // optional message shown in the banner
 *   }
 *
 * To release a new required version:
 *   - Bump REQUIRED_VERSION_CODE and LATEST_VERSION below
 *   - Set FORCE_UPDATE = true if the old version has a critical bug
 */

import { NextResponse } from "next/server";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";

// ── Update these whenever you publish a new native build ──────────
const REQUIRED_VERSION_CODE = 12;          // versionCode of current build
const LATEST_VERSION        = "1.2.0";    // human-readable version string
const FORCE_UPDATE          = false;       // set true for critical updates
const UPDATE_MESSAGE        = "A new version of Pax26 is available with improvements and new features.";

const PLAY_STORE_URL  = "https://play.google.com/store/apps/details?id=com.jayempire.pax26mobile";
const APP_STORE_URL   = "https://apps.apple.com/app/pax26/id0000000000"; // update when iOS is live

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  return NextResponse.json({
    minVersionCode: REQUIRED_VERSION_CODE,
    latestVersion:  LATEST_VERSION,
    playStoreUrl:   PLAY_STORE_URL,
    appStoreUrl:    APP_STORE_URL,
    forceUpdate:    FORCE_UPDATE,
    message:        UPDATE_MESSAGE,
  }, { status: 200, headers: corsHeaders() });
}
