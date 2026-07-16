// Server-only Zoom integration. NEVER import this from a client component —
// it reads a client secret from the environment. Uses Zoom's
// Server-to-Server OAuth (the current, non-deprecated app type — not the
// retired JWT auth) to create real scheduled meetings.
//
// Setup (Zoom App Marketplace → Build App → Server-to-Server OAuth):
//   1. Create the app, add the `meeting:write:admin` (or `meeting:write`)
//      scope, and activate it.
//   2. Copy the Account ID, Client ID, and Client Secret into
//      ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET.
// Until those are set, isZoomConfigured() returns false and callers fall
// back to the Jitsi provider (lib/video-providers.ts) — booking never
// breaks because Zoom isn't configured.

import type { VideoRoom } from "./video-providers";

export function isZoomConfigured(): boolean {
  return !!(
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  );
}

function requireZoomEnv() {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error(
      "Zoom is not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and " +
        "ZOOM_CLIENT_SECRET (Server-to-Server OAuth app credentials from " +
        "https://marketplace.zoom.us) to enable Zoom meetings.",
    );
  }
  return { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = requireZoomEnv();

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const basicAuth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    { method: "POST", headers: { Authorization: `Basic ${basicAuth}` } },
  );
  if (!res.ok) {
    throw new Error(`Zoom OAuth token request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

export interface CreateZoomMeetingInput {
  /** PHI-free topic — do not pass client names or health details. */
  topic: string;
  startsAt: string; // ISO UTC
  durationMinutes: number;
  timezone?: string;
}

/** Creates a real scheduled Zoom meeting and returns join/host links. */
export async function createZoomMeeting(input: CreateZoomMeetingInput): Promise<VideoRoom> {
  const token = await getAccessToken();
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: input.topic,
      type: 2, // scheduled meeting
      start_time: input.startsAt,
      duration: input.durationMinutes,
      timezone: input.timezone ?? "UTC",
      settings: {
        join_before_host: false,
        waiting_room: true,
        approval_type: 2, // no registration required
        audio: "both",
        auto_recording: "none",
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Zoom meeting creation failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return {
    provider: "zoom",
    joinUrl: data.join_url,
    hostUrl: data.start_url,
    meetingId: String(data.id),
    passcode: data.password,
  };
}
