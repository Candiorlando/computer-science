import { NextResponse } from "next/server";
import { exchangeOutlookCode } from "@/lib/outlook-calendar";
import { setTokenCookie, readStateCookie } from "@/lib/calendar-cookies";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readStateCookie(req);

  const redirectBase = new URL("/schedule", url.origin);

  if (!code || !state || state !== expectedState) {
    redirectBase.searchParams.set("calendar_error", "outlook");
    return NextResponse.redirect(redirectBase);
  }

  try {
    const tokens = await exchangeOutlookCode(code);
    redirectBase.searchParams.set("connected", "outlook");
    const res = NextResponse.redirect(redirectBase);
    setTokenCookie(res, "outlook", tokens);
    return res;
  } catch (err) {
    console.error("Outlook OAuth callback failed:", err);
    redirectBase.searchParams.set("calendar_error", "outlook");
    return NextResponse.redirect(redirectBase);
  }
}
