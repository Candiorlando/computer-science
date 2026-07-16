import { NextResponse } from "next/server";
import { outlookAuthUrl, isOutlookCalendarConfigured } from "@/lib/outlook-calendar";
import { setStateCookie, randomState } from "@/lib/calendar-cookies";

export async function GET() {
  if (!isOutlookCalendarConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET to enable Outlook sync.",
      },
      { status: 501 },
    );
  }
  const state = randomState();
  const res = NextResponse.redirect(outlookAuthUrl(state));
  setStateCookie(res, state);
  return res;
}
