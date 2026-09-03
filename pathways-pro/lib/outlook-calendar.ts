// Server-only Outlook/Microsoft 365 Calendar OAuth + sync (Microsoft
// Graph API). NEVER import from a client component.
//
// Setup (Azure Portal → App registrations):
//   1. Register an app (single or multi-tenant, "Accounts in any
//      organizational directory and personal Microsoft accounts").
//   2. Add a Web redirect URI:
//      https://www.pathwayspro.app/api/calendar/outlook/callback
//   3. Certificates & secrets → new client secret.
//   4. API permissions → Microsoft Graph → Delegated → Calendars.ReadWrite,
//      offline_access.
//   5. Set MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET
//      (MICROSOFT_TENANT_ID optional — defaults to "common" for both
//      personal and work/school accounts).
//
// Token storage: same httpOnly-cookie approach as lib/google-calendar.ts —
// see that file's header comment for the database migration path.

export function isOutlookCalendarConfigured(): boolean {
  return !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

function requireMicrosoftEnv() {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID, MICROSOFT_REDIRECT_URI } =
    process.env;
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    throw new Error(
      "Outlook Calendar is not configured. Set MICROSOFT_CLIENT_ID and " +
        "MICROSOFT_CLIENT_SECRET from an Azure AD app registration " +
        "(portal.azure.com) to enable Outlook sync.",
    );
  }
  const tenant = MICROSOFT_TENANT_ID ?? "common";
  return {
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    tenant,
    redirectUri:
      MICROSOFT_REDIRECT_URI ?? "https://www.pathwayspro.app/api/calendar/outlook/callback",
  };
}

export function outlookAuthUrl(state: string): string {
  const { MICROSOFT_CLIENT_ID, tenant, redirectUri } = requireMicrosoftEnv();
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query",
    scope: "offline_access Calendars.ReadWrite",
    state,
  });
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

export interface OutlookTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  obtained_at: number;
}

export async function exchangeOutlookCode(code: string): Promise<OutlookTokens> {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, tenant, redirectUri } = requireMicrosoftEnv();
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      scope: "offline_access Calendars.ReadWrite",
    }),
  });
  if (!res.ok) throw new Error(`Outlook token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { ...data, obtained_at: Date.now() };
}

export async function refreshOutlookToken(refreshToken: string): Promise<OutlookTokens> {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, tenant } = requireMicrosoftEnv();
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      grant_type: "refresh_token",
      scope: "offline_access Calendars.ReadWrite",
    }),
  });
  if (!res.ok) throw new Error(`Outlook token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { access_token: data.access_token, expires_in: data.expires_in, refresh_token: data.refresh_token ?? refreshToken, obtained_at: Date.now() };
}

export interface CreateOutlookEventInput {
  accessToken: string;
  title: string;
  description?: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  location?: string;
}

export async function createOutlookEvent(input: CreateOutlookEventInput): Promise<{ id: string; webLink: string }> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${input.accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({
      subject: input.title,
      body: { contentType: "text", content: input.description ?? "" },
      location: input.location ? { displayName: input.location } : undefined,
      start: { dateTime: input.startsAt, timeZone: "UTC" },
      end: { dateTime: input.endsAt, timeZone: "UTC" },
    }),
  });
  if (!res.ok) throw new Error(`Outlook event creation failed: ${res.status} ${await res.text()}`);
  return res.json();
}
