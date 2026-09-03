// Server-only Google Calendar OAuth + sync. NEVER import from a client
// component — reads a client secret from the environment.
//
// Setup (Google Cloud Console → APIs & Services):
//   1. Create an OAuth 2.0 Client ID (Web application).
//   2. Add authorized redirect URI:
//      https://www.pathwayspro.app/api/calendar/google/callback
//      (and http://localhost:3000/api/calendar/google/callback for dev)
//   3. Enable the Google Calendar API for the project.
//   4. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.
//
// Token storage: tokens are kept in a short-lived, httpOnly, secure cookie
// (see app/api/calendar/google/*) so this works fully today with zero
// database setup — appropriate for a single browser session driving sync.
// For server-side sync independent of an open browser (e.g. a nightly
// job), move token storage to the database — the CalendarConnection model
// in prisma/scheduling-schema-extension.prisma is ready for that; swap the
// cookie read/write below for a `prisma.calendarConnection` lookup.

export function isGoogleCalendarConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function requireGoogleEnv() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Google Calendar is not configured. Set GOOGLE_CLIENT_ID and " +
        "GOOGLE_CLIENT_SECRET from a Google Cloud OAuth Client ID " +
        "(console.cloud.google.com) to enable Google Calendar sync.",
    );
  }
  return {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI:
      GOOGLE_REDIRECT_URI ?? "https://www.pathwayspro.app/api/calendar/google/callback",
  };
}

export function googleAuthUrl(state: string): string {
  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = requireGoogleEnv();
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  obtained_at: number; // ms epoch, so callers can tell if it's stale
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = requireGoogleEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { ...data, obtained_at: Date.now() };
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokens> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = requireGoogleEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { access_token: data.access_token, expires_in: data.expires_in, refresh_token: refreshToken, obtained_at: Date.now() };
}

export interface CreateGoogleEventInput {
  accessToken: string;
  title: string;
  description?: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  location?: string;
}

export async function createGoogleEvent(input: CreateGoogleEventInput): Promise<{ id: string; htmlLink: string }> {
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${input.accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({
      summary: input.title,
      description: input.description,
      location: input.location,
      start: { dateTime: input.startsAt },
      end: { dateTime: input.endsAt },
    }),
  });
  if (!res.ok) throw new Error(`Google event creation failed: ${res.status} ${await res.text()}`);
  return res.json();
}
