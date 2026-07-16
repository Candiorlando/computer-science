import { NextResponse } from "next/server";
import { isZoomConfigured, createZoomMeeting } from "@/lib/zoom";
import { jitsiRoom, type VideoRoom } from "@/lib/video-providers";

// Creates a video room for an appointment. Prefers Zoom when configured
// (real meeting via Server-to-Server OAuth); falls back to the keyless
// Jitsi room otherwise. Topic/room name is always an opaque id — never a
// client name or health detail — to keep the room itself PHI-free.
export async function POST(req: Request) {
  let body: {
    opaqueRoomId?: string;
    startsAt?: string;
    durationMinutes?: number;
    timezone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { opaqueRoomId, startsAt, durationMinutes, timezone } = body;
  if (!opaqueRoomId) {
    return NextResponse.json({ error: "missing_room_id" }, { status: 422 });
  }

  if (isZoomConfigured() && startsAt && durationMinutes) {
    try {
      const room: VideoRoom = await createZoomMeeting({
        topic: `Pathways Pro session ${opaqueRoomId}`,
        startsAt,
        durationMinutes,
        timezone,
      });
      return NextResponse.json(room);
    } catch (err) {
      // Zoom is configured but the call failed (bad creds, rate limit,
      // network) — degrade to Jitsi rather than blocking the booking.
      console.error("Zoom meeting creation failed, falling back to Jitsi:", err);
    }
  }

  return NextResponse.json(jitsiRoom(opaqueRoomId));
}
