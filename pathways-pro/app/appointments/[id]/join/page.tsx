"use client";

// Telehealth room. The room name is an opaque, PHI-free id derived at
// booking time. Video is provided via lib/video-providers.ts + the
// /api/video-room route: Zoom when ZOOM_ACCOUNT_ID/CLIENT_ID/CLIENT_SECRET
// are configured (real meeting via Server-to-Server OAuth), otherwise a
// keyless Jitsi room (no setup required, works immediately).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { getAppointment, fmtDateTime, browserTimezone, type Appointment } from "@/lib/scheduling";
import type { VideoRoom } from "@/lib/video-providers";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [user, setUser] = useState<AnyUser | null>(null);
  const [appt, setAppt] = useState<Appointment | null | undefined>(undefined);
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState<VideoRoom | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const tz = browserTimezone();

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    setUser(s);
    setAppt(getAppointment(id));
  }, [id, router]);

  const authorized = useMemo(() => {
    if (!user || !appt) return false;
    return appt.counselorEmail === user.email || appt.clientEmail === user.email;
  }, [user, appt]);

  const isHost = useMemo(
    () => !!(user && appt && appt.counselorEmail === user.email),
    [user, appt],
  );

  async function join() {
    if (!appt?.videoRoom) return;
    setLoadingRoom(true);
    try {
      const durationMinutes = Math.round(
        (new Date(appt.endsAt).getTime() - new Date(appt.startsAt).getTime()) / 60_000,
      );
      const res = await fetch("/api/video-room", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          opaqueRoomId: appt.videoRoom,
          startsAt: appt.startsAt,
          durationMinutes,
          timezone: tz,
        }),
      });
      const data: VideoRoom = await res.json();
      setRoom(data);
      setJoined(true);
    } finally {
      setLoadingRoom(false);
    }
  }

  if (appt === undefined) return null;

  if (!appt) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-3">
        <Link href="/appointments" className="text-accent text-sm hover:underline">
          ← Appointments
        </Link>
        <h1 className="text-2xl">Session not found</h1>
        <p className="text-ink/65 text-sm">This appointment doesn&rsquo;t exist or was cancelled.</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-3">
        <h1 className="text-2xl">Not authorized</h1>
        <p className="text-ink/65 text-sm">You&rsquo;re not a participant in this session.</p>
      </div>
    );
  }

  const zoomLink = room?.provider === "zoom" ? (isHost ? room.hostUrl ?? room.joinUrl : room.joinUrl) : null;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link href="/appointments" className="text-accent text-sm hover:underline">
          ← Appointments
        </Link>
        <p className="text-xs text-ink/55">Secure session · {fmtDateTime(appt.startsAt, tz)}</p>
      </div>

      {!joined ? (
        <section className="saas-card space-y-4 text-center py-10">
          <div className="text-4xl" aria-hidden>
            🎥
          </div>
          <h1 className="text-2xl font-semibold">Ready to join your session</h1>
          <p className="text-ink/70 text-sm max-w-md mx-auto">
            Your camera and microphone stay off until you join. Check you&rsquo;re
            somewhere private. This room is encrypted in transit.
          </p>
          <button
            onClick={join}
            disabled={loadingRoom}
            className="min-h-[48px] px-6 rounded-md grad-tealblue text-white font-semibold disabled:opacity-60"
          >
            {loadingRoom ? "Connecting…" : "Join secure session"}
          </button>
          <p className="text-xs text-ink/45 max-w-md mx-auto">
            Having trouble with video? You can also call your counselor at the
            number in your confirmation.
          </p>
        </section>
      ) : room?.provider === "zoom" ? (
        <section aria-label="Video session" className="saas-card space-y-4 text-center py-10">
          <div className="text-4xl" aria-hidden>
            🔵
          </div>
          <h2 className="text-xl font-semibold">Your Zoom session is ready</h2>
          <p className="text-ink/70 text-sm max-w-md mx-auto">
            Zoom opens in a new window.
            {room.passcode && (
              <>
                {" "}
                Passcode: <span className="font-mono font-semibold">{room.passcode}</span>
              </>
            )}
          </p>
          <a
            href={zoomLink ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-md grad-tealblue text-white font-semibold"
          >
            Open Zoom {isHost ? "(host)" : ""} →
          </a>
          <p className="text-xs text-ink/55">
            🔒 Meeting created via Zoom&rsquo;s API. Room id is anonymized — no
            name or health detail is exposed.
          </p>
          <div>
            <button
              onClick={() => setJoined(false)}
              className="min-h-[44px] px-4 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
            >
              Back
            </button>
          </div>
        </section>
      ) : (
        <section aria-label="Video session" className="space-y-2">
          <div className="relative w-full overflow-hidden rounded-xl border border-ink/15 bg-black" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              title="Telehealth video session"
              src={room?.joinUrl ?? ""}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-ink/55">
              🔒 Encrypted in transit. Room id is anonymized — no name or health
              detail is exposed.
            </p>
            <button
              onClick={() => setJoined(false)}
              className="min-h-[44px] px-4 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
            >
              Leave session
            </button>
          </div>
        </section>
      )}

      <div className="saas-card text-xs text-ink/55 border-l-4 border-l-gold">
        <p className="font-semibold text-ink/70 mb-1">Production note (not shown to clients)</p>
        Video defaults to a keyless Jitsi room (no setup required). Set
        ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET (Server-to-Server
        OAuth app, marketplace.zoom.us) to switch to real Zoom meetings — see
        lib/zoom.ts. For strict HIPAA, a BAA-covered provider (self-hosted
        Jitsi, Daily.co, or Zoom with a signed BAA) plus a short-lived
        per-user token is required.
      </div>
    </div>
  );
}
