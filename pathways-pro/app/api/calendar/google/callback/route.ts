import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google-calendar";
import { setTokenCookie, readStateCookie } from "@/lib/calendar-cookies";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readStateCookie(req);

  const redirectBase = new URL("/schedule", url.origin);

  if (!code || !state || state !== expectedState) {
    redirectBase.searchParams.set("calendar_error", "google");
    return NextResponse.redirect(redirectBase);
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    redirectBase.searchParams.set("connected", "google");
    const res = NextResponse.redirect(redirectBase);
    setTokenCookie(res, "google", tokens);
    return res;
  } catch (err) {
    console.error("Google OAuth callback failed:", err);
    redirectBase.searchParams.set("calendar_error", "google");
    return NextResponse.redirect(redirectBase);
  }
}
