"use client";

// Client appointments — book a session, view upcoming/past, and (optionally)
// find a better-matched counselor first.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { COUNSELORS } from "@/lib/users";
import type { ClientUser } from "@/lib/users";
import BookingCalendar from "@/components/BookingCalendar";
import AppointmentList from "@/components/AppointmentList";
import CounselorMatch from "@/components/CounselorMatch";
import CalendarExport from "@/components/CalendarExport";
import { appointmentsForUser, type Appointment } from "@/lib/scheduling";

export default function ClientAppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [counselorEmail, setCounselorEmail] = useState<string>("");
  const [showMatch, setShowMatch] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "client") return void router.replace("/portal");
    setUser(s);
    setCounselorEmail(s.counselorEmail);
  }, [router]);

  if (!user) return null;

  const counselorName = COUNSELORS[counselorEmail]?.name ?? user.counselorName ?? counselorEmail;

  const counterpartLabel = (a: Appointment) =>
    COUNSELORS[a.counselorEmail]?.name ?? a.counselorEmail;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Appointments</p>
        <h1 className="text-3xl tracking-tight">Schedule a session</h1>
        <p className="text-ink/65 text-sm">
          Book time with <span className="font-semibold">{counselorName}</span>, or
          find a counselor who fits your needs.
        </p>
      </header>

      <section className="saas-card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">
            Book with {counselorName.split(" ")[0]}
          </h2>
          <button
            onClick={() => setShowMatch((v) => !v)}
            className="text-sm text-accent hover:underline min-h-[44px]"
          >
            {showMatch ? "Hide counselor matching" : "Find a different counselor →"}
          </button>
        </div>

        {showMatch && (
          <div className="border-b border-ink/10 pb-6 mb-2">
            <CounselorMatch
              clientEmail={user.email}
              onChoose={(email) => {
                setCounselorEmail(email);
                setShowMatch(false);
              }}
            />
          </div>
        )}

        <BookingCalendar
          key={counselorEmail}
          counselorEmail={counselorEmail}
          clientEmail={user.email}
          caseId={user.caseId}
          createdBy={user.email}
          onBooked={() => setRefresh((n) => n + 1)}
        />
      </section>

      <section aria-label="Your appointments">
        <h2 className="text-lg font-semibold mb-3">Your appointments</h2>
        <AppointmentList
          key={refresh}
          userEmail={user.email}
          role="client"
          counterpartLabel={counterpartLabel}
        />
      </section>

      <section aria-label="Sync to your calendar">
        <h2 className="text-lg font-semibold mb-3">Add to your calendar</h2>
        <CalendarExport
          key={refresh}
          appointments={appointmentsForUser(user.email)}
          calendarName={`${user.name} — Pathways Pro`}
          counterpartLabel={counterpartLabel}
        />
      </section>
    </div>
  );
}
