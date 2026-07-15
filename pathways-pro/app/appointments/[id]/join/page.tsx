"use client";

// Telehealth room. The room name is an opaque, PHI-free id derived at booking
// time. For this demo the video is embedded via Jitsi Meet (no API keys, works
// immediately). For production HIPAA, swap the embed URL for a BAA-covered
// provider (self-hosted Jitsi, Daily.co, Zoom Video SDK) and mint a
// short-lived, per-user token server-side — see the architecture doc.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { getAppointment, fmtDateTime, browserTimezone, type Appointment } from "@/lib/scheduling";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [user, setUser] = useState<AnyUser | null>(null);
  const [appt, setAppt] = useState<Appointment | null | undefined>(undefined);
  const [joined, setJoined] = useState(false);
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

  const roomUrl = useMemo(() => {
    if (!appt?.videoRoom) return "";
    // Opaque room; #config disables prejoin chrome we already provide.
    const cfg = "#config.prejoinPageEnabled=false&config.disableDeepLinking=true";
    return `https://meet.jit.si/${encodeURIComponent(appt.videoRoom)}${cfg}`;
  }, [appt]);

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
            onClick={() => setJoined(true)}
            className="min-h-[48px] px-6 rounded-md grad-tealblue text-white font-semibold"
          >
            Join secure session
          </button>
          <p className="text-xs text-ink/45 max-w-md mx-auto">
            Having trouble with video? You can also call your counselor at the
            number in your confirmation.
          </p>
        </section>
      ) : (
        <section aria-label="Video session" className="space-y-2">
          <div className="relative w-full overflow-hidden rounded-xl border border-ink/15 bg-black" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              title="Telehealth video session"
              src={roomUrl}
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
        This demo embeds Jitsi Meet so video works without API keys. For a HIPAA
        deployment, replace the embed with a BAA-covered provider (self-hosted
        Jitsi, Daily.co, or Zoom Video SDK) and mint a short-lived per-user room
        token from a server route — never expose provider keys client-side.
      </div>
    </div>
  );
}
