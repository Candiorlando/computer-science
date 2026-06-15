"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { CLIENTS, type ClientUser, type CounselorUser } from "@/lib/users";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = loadSession();
    if (!s) {
      router.replace("/");
      return;
    }
    if (s.role !== "counselor") {
      router.replace("/portal");
      return;
    }
    setUser(s);
  }, [router]);

  if (!mounted || !user) return null;

  const clients = user.clientKeys
    .map((k) => CLIENTS[k])
    .filter((c): c is ClientUser => Boolean(c));

  const inTraining = clients.filter((c) => c.status === "In Training").length;
  const placement = clients.filter((c) => c.status === "Job Placement").length;
  const assessment = clients.filter((c) => c.status === "Assessment Phase").length;
  const intake = clients.filter((c) => c.status === "Intake").length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          {user.agency} · {user.office}
        </p>
        <h1 className="text-4xl">Welcome back, {user.name.split(" ")[0]}.</h1>
        <p className="text-ink/60 mt-1">
          {user.credentials} · Employee {user.employeeId}
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Caseload" value={clients.length.toString()} sub={`+ Pre-ETS clients`} accent />
        <StatCard label="In Training" value={inTraining.toString()} sub="Education/Vocational" />
        <StatCard label="Job Placement" value={placement.toString()} sub="≥ 90 days stable" />
        <StatCard label="In Assessment" value={(assessment + intake).toString()} sub="Intake + Eval" />
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-ink/10 rounded-lg p-6 bg-cream">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl">Active Caseload</h2>
            <Link href="/caseload" className="text-sm text-accent hover:underline">
              View full caseload →
            </Link>
          </div>
          <div className="divide-y divide-ink/10">
            {clients.map((c) => (
              <div key={c.email} className="py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-ink/60">
                    Goal: {c.goal} · Next: {c.nextAppt} · {c.caseId}
                  </div>
                </div>
                <div className="hidden md:block w-32">
                  <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-ink/50 mt-1">{c.progress}%</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-ink/10 rounded-lg p-6 bg-cream">
            <h2 className="text-xl mb-3">Priority Tasks</h2>
            <ul className="space-y-3 text-sm">
              <Task urgent text="Submit RSA-911 Q2 report" meta="Due in 3 days" />
              <Task urgent text="IPE renewal — Leon Washington" meta="Intake → Eligibility" />
              <Task soon text="WHODAS 2.0 — Marcus Thomas" meta="Scheduled June 18" />
              <Task soon text="JAN accommodation request" meta="Diana Reyes" />
              <Task routine text="CE log: 6 hrs ethics due" meta="CRC cycle ends Nov 2026" />
            </ul>
          </div>

          <div className="border border-ink/10 rounded-lg p-6 bg-cream">
            <h2 className="text-xl mb-3">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction href="/ipe" icon="✍️" label="IPE Builder" />
              <QuickAction href="/ce" icon="🎓" label="CE Tracker" />
              <QuickAction href="/caseload" icon="📋" label="Caseload" />
              <QuickAction href="/resources/counselor" icon="📚" label="Resources" />
            </div>
          </div>
        </div>
      </section>

      <section className="border border-accent/30 bg-accent/5 rounded-lg p-6">
        <h2 className="text-xl mb-2 text-accent">Sprint 3 — In queue</h2>
        <p className="text-sm text-ink/70 max-w-3xl">
          <strong>IPE Builder</strong> with WIOA-aligned goal templates and OOH wage
          auto-fill · <strong>CE Tracker</strong> for CRC/LPC renewal cycles ·
          full <strong>caseload management</strong> with case notes and
          milestone tracking.
        </p>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`border rounded-lg p-4 ${
        accent ? "border-accent/40 bg-accent/5" : "border-ink/10 bg-cream"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
        {label}
      </div>
      <div className="text-3xl text-accent leading-none">{value}</div>
      <div className="text-xs text-ink/50 mt-2">{sub}</div>
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
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function Task({
  urgent,
  soon,
  routine,
  text,
  meta,
}: {
  urgent?: boolean;
  soon?: boolean;
  routine?: boolean;
  text: string;
  meta: string;
}) {
  const color = urgent
    ? "bg-red-500"
    : soon
      ? "bg-yellow-500"
      : "bg-teal-500";
  return (
    <li className="flex gap-3">
      <span className={`w-2 h-2 rounded-full ${color} mt-1.5 flex-shrink-0`} />
      <div>
        <div>{text}</div>
        <div className="text-xs text-ink/50">{meta}</div>
      </div>
    </li>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="border border-ink/15 rounded p-3 text-xs hover:border-accent hover:bg-accent/5 transition"
    >
      <div className="text-lg mb-1">{icon}</div>
      <div>{label}</div>
    </Link>
  );
}
