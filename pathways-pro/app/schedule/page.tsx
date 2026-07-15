"use client";

// Counselor scheduling — manage weekly availability and see upcoming sessions.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { CLIENTS } from "@/lib/users";
import type { CounselorUser } from "@/lib/users";
import AvailabilityManager from "@/components/AvailabilityManager";
import AppointmentList from "@/components/AppointmentList";
import type { Appointment } from "@/lib/scheduling";

export default function CounselorSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [tab, setTab] = useState<"upcoming" | "availability">("upcoming");

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "counselor") return void router.replace("/portal");
    setUser(s);
  }, [router]);

  if (!user) return null;

  const counterpartLabel = (a: Appointment) =>
    CLIENTS[a.clientEmail]?.name ?? a.clientEmail;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Scheduling</p>
        <h1 className="text-3xl tracking-tight">Your calendar</h1>
        <p className="text-ink/65 text-sm">
          Set the hours clients can book and manage your upcoming sessions.
        </p>
      </header>

      <div role="tablist" aria-label="Scheduling views" className="flex gap-1 border-b border-ink/10">
        {([
          ["upcoming", "Upcoming sessions"],
          ["availability", "My availability"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={[
              "min-h-[44px] px-4 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-accent text-accent"
                : "border-transparent text-ink/60 hover:text-ink",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "upcoming" ? (
        <AppointmentList userEmail={user.email} role="counselor" counterpartLabel={counterpartLabel} />
      ) : (
        <AvailabilityManager counselorEmail={user.email} />
      )}
    </div>
  );
}
