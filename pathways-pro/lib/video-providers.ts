// Video provider abstraction. Jitsi (below) is the always-available,
// keyless default — no credentials needed, matches current behavior.
// Zoom (lib/zoom.ts, server-only) is a pluggable upgrade: when
// ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET are configured,
// POST /api/video-room returns real Zoom meeting links instead.
//
// This file is safe to import from client components (no secrets here).
// lib/zoom.ts is server-only — never import it from a client component.

export type VideoProviderName = "jitsi" | "zoom";

export interface VideoRoom {
  provider: VideoProviderName;
  joinUrl: string;
  /** Present only for the host (counselor) on providers that distinguish
   *  host vs. attendee join links (e.g. Zoom's start_url). */
  hostUrl?: string;
  meetingId?: string;
  passcode?: string;
}

/** Opaque, PHI-free Jitsi room from an appointment id — no name, no reason,
 *  no health detail encoded anywhere in the URL. */
export function jitsiRoom(opaqueRoomId: string): VideoRoom {
  const cfg = "#config.prejoinPageEnabled=false&config.disableDeepLinking=true";
  return {
    provider: "jitsi",
    joinUrl: `https://meet.jit.si/${encodeURIComponent(opaqueRoomId)}${cfg}`,
  };
}
