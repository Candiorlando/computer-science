import { NextResponse } from "next/server";
import { readTokenCookie } from "@/lib/calendar-cookies";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { isOutlookCalendarConfigured } from "@/lib/outlook-calendar";

// Tells the client which calendar providers are available to connect and
// which are already connected for this browser — never exposes the actual
// tokens (those stay in httpOnly cookies, invisible to client JS).
export async function GET(req: Request) {
  const google = readTokenCookie(req, "google");
  const outlook = readTokenCookie(req, "outlook");
  return NextResponse.json({
    google: { configured: isGoogleCalendarConfigured(), connected: !!google },
    outlook: { configured: isOutlookCalendarConfigured(), connected: !!outlook },
  });
}
