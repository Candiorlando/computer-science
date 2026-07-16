import { NextResponse } from "next/server";
import { readTokenCookie, setTokenCookie } from "@/lib/calendar-cookies";
import {
  createGoogleEvent,
  refreshGoogleToken,
  type GoogleTokens,
} from "@/lib/google-calendar";
import {
  createOutlookEvent,
  refreshOutlookToken,
  type OutlookTokens,
} from "@/lib/outlook-calendar";

function isExpired(t: { obtained_at: number; expires_in: number }): boolean {
  return Date.now() > t.obtained_at + (t.expires_in - 60) * 1000; // 60s buffer
}

interface SyncBody {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  location?: string;
}

// Pushes a booked appointment into whichever calendars the counselor has
// connected (Google, Outlook, or both). Called client-side right after a
// booking succeeds. Silently no-ops for a provider with no connected
// tokens — connecting a calendar is optional, booking never depends on it.
export async function POST(req: Request) {
  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!body.title || !body.startsAt || !body.endsAt) {
    return NextResponse.json({ error: "missing_fields" }, { status: 422 });
  }

  const results: Record<string, "created" | "not_connected" | "failed"> = {};
  const res = NextResponse.json({ pending: true }); // placeholder; rebuilt below

  let google = readTokenCookie<GoogleTokens>(req, "google");
  if (google) {
    try {
      if (isExpired(google) && google.refresh_token) {
        google = await refreshGoogleToken(google.refresh_token);
        setTokenCookie(res, "google", google);
      }
      await createGoogleEvent({
        accessToken: google.access_token,
        title: body.title,
        description: body.description,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        location: body.location,
      });
      results.google = "created";
    } catch (err) {
      console.error("Google sync failed:", err);
      results.google = "failed";
    }
  } else {
    results.google = "not_connected";
  }

  let outlook = readTokenCookie<OutlookTokens>(req, "outlook");
  if (outlook) {
    try {
      if (isExpired(outlook) && outlook.refresh_token) {
        outlook = await refreshOutlookToken(outlook.refresh_token);
        setTokenCookie(res, "outlook", outlook);
      }
      await createOutlookEvent({
        accessToken: outlook.access_token,
        title: body.title,
        description: body.description,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        location: body.location,
      });
      results.outlook = "created";
    } catch (err) {
      console.error("Outlook sync failed:", err);
      results.outlook = "failed";
    }
  } else {
    results.outlook = "not_connected";
  }

  return NextResponse.json(results, { headers: res.headers });
}
