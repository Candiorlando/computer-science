"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { CLIENTS, type ClientUser, type CounselorUser } from "@/lib/users";

export default function CaseloadPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  if (!user) return null;

  const clients = user.clientKeys
    .map((k) => CLIENTS[k])
    .filter((c): c is ClientUser => Boolean(c));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Caseload
        </p>
        <h1 className="text-4xl">{clients.length} active client{clients.length === 1 ? "" : "s"}</h1>
      </header>

      <div className="border border-ink/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-xs uppercase tracking-wider text-ink/60">
            <tr>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Case ID</th>
              <th className="text-left px-4 py-3">Goal</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Progress</th>
              <th className="text-left px-4 py-3">Next Appt</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.email} className="border-t border-ink/10 bg-cream hover:bg-accent/5">
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-ink/50">DOB {c.dob}</div>
                </td>
                <td className="px-4 py-3 text-ink/70 font-mono text-xs">{c.caseId}</td>
                <td className="px-4 py-3 text-ink/80">{c.goal}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink/60">{c.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink/70">{c.nextAppt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-accent/30 bg-accent/5 rounded-lg p-5 text-sm text-ink/70">
        <strong className="text-accent">Sprint 3 — In queue:</strong> Click into a client to
        view full profile (demographics, IPE status, case notes log, milestone
        tracking, follow-up reminders).
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ClientUser["status"] }) {
  const styles: Record<ClientUser["status"], string> = {
    "In Training": "bg-blue-100 text-blue-800",
    "Job Placement": "bg-green-100 text-green-800",
    "Assessment Phase": "bg-yellow-100 text-yellow-800",
    Intake: "bg-pink-100 text-pink-800",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}
