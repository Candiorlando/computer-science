import { NextResponse } from "next/server";
import { googleAuthUrl, isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { setStateCookie, randomState } from "@/lib/calendar-cookies";

export async function GET() {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google Calendar sync.",
      },
      { status: 501 },
    );
  }
  const state = randomState();
  const res = NextResponse.redirect(googleAuthUrl(state));
  setStateCookie(res, state);
  return res;
}
