"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ClientUser } from "@/lib/users";
import { loadProfile, type UserProfile } from "@/lib/storage";
import { loadTSA, type TSAResult } from "@/lib/tsa-storage";
import { buildProgress } from "@/lib/positive-psychology";
import { pendingAssignmentsForCase, assignmentsForCase } from "@/lib/assessment-assignments";

/* ── localStorage keys ── */
const JOURNEY_KEY = "pathways-pro:vocational-journey-v1";
const RESUME_KEY  = "pathways-pro:resume-v1";

/* ── Journey profile ── */
export interface JourneyProfile {
  employmentStatus?: "seeking" | "employed" | "training" | "higher-ed" | "not-working";
  currentEmployer?: string;
  currentRole?: string;
  educationCredential?: string;
  educationInstitution?: string;
  educationStatus?: "completed" | "in-progress";
  disabilityContext?: string;
  populationGroup?: "youth-transition" | "acquired-disability" | "cognitive-adhd-autism" | "general";
  topGoals?: string[];
  confidenceScores?: number[];
  savedAt?: string;
}

function loadJourney(): JourneyProfile {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(JOURNEY_KEY) || "{}"); } catch { return {}; }
}
function saveJourney(j: JourneyProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOURNEY_KEY, JSON.stringify({ ...j, savedAt: new Date().toISOString() }));
}
function resumeCount(): number {
  if (typeof window === "undefined") return 0;
  try { return JSON.parse(localStorage.getItem(RESUME_KEY) || "[]").length; } catch { return 0; }
}
function goalCount(): number {
  if (typeof window === "undefined") return 0;
  try { return JSON.parse(localStorage.getItem("pp_goals") || "[]").length; } catch { return 0; }
}

/* ── Types ── */
type Tab = "overview" | "assessments" | "documents" | "training" | "milestones";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "assessments", label: "Assessments & Skills" },
  { key: "documents", label: "Documents & Resumes" },
  { key: "training", label: "Training & Courses" },
  { key: "milestones", label: "My Career Milestones" },
];

const PHASES = [
  { n: 1, label: "Discovery &\nAssessments", short: "Discovery" },
  { n: 2, label: "Resume &\nCover Letter Prep", short: "Resume Prep" },
  { n: 3, label: "Interview &\nJob Coaching", short: "Interview" },
  { n: 4, label: "Competitive\nIntegrated Employment", short: "CIE" },
];

const STATUS_LABELS: Record<string, string> = {
  seeking: "Seeking employment", employed: "Currently employed",
  training: "In training", "higher-ed": "In higher education",
  "not-working": "Not currently working",
};

/* ── Micro-credentials ── */
const BADGES = [
  { id: "riasec", label: "Interest Profiler", icon: "M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" },
  { id: "tsa", label: "Skills Analysis", icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
  { id: "resume", label: "Resume Ready", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" },
  { id: "interview", label: "Interview Prep", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" },
  { id: "advocacy", label: "Self-Advocate", icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" },
  { id: "customer", label: "Customer Service", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
];

/* ── Skill radar labels ── */
const SKILL_AXES = ["Digital Literacy", "Communication", "Punctuality", "Technical", "Teamwork", "Problem Solving"];

/* ════════════════════════════════════════════════════════════════
   Main export
   ════════════════════════════════════════════════════════════════ */
export default function VocationalJourney({ client }: { client: ClientUser }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [journey, setJourney] = useState<JourneyProfile>({});
  const [profile, setProfile] = useState<UserProfile>({});
  const [tsa, setTsa] = useState<TSAResult | null>(null);

  useEffect(() => {
    setJourney(loadJourney());
    setProfile(loadProfile());
    setTsa(loadTSA());
  }, []);

  const indicators = useMemo(() => buildProgress(client.caseId), [client.caseId]);
  const resumes   = useMemo(resumeCount, []);
  const goals     = useMemo(goalCount, []);
  const pending   = useMemo(() => pendingAssignmentsForCase(client.caseId), [client.caseId]);
  const allAssign = useMemo(() => assignmentsForCase(client.caseId), [client.caseId]);
  const completedAssessments = allAssign.filter(a => a.status === "completed").length;

  function updateJourney(p: Partial<JourneyProfile>) {
    setJourney(prev => { const n = { ...prev, ...p }; saveJourney(n); return n; });
  }

  /* Determine active phase from client status */
  const activePhase =
    client.status === "Intake" || client.status === "Assessment Phase" ? 1
    : client.status === "In Training" ? 2
    : client.status === "Job Placement" ? 3
    : 4;

  /* Document readiness */
  const docReadiness = Math.min(100, Math.round(((resumes > 0 ? 50 : 0) + (indicators.jobApplicationsSubmitted > 0 ? 35 : 0) + (goals > 0 ? 15 : 0))));

  /* Confidence trend (stored or placeholder) */
  const confidence = journey.confidenceScores?.length ? journey.confidenceScores : [60, 65, 62, 70, 75];

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-sm">
      {/* ── Top header bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E5A46] px-5 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <SvgIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" className="text-white" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">My Vocational Journey</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected to PathwaysPro
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">
            {client.status}
          </span>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex gap-1 overflow-x-auto border-b border-ink/10 bg-cream/40 px-4 py-1.5 md:px-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === t.key
                ? "bg-[#0E5A46] text-white shadow-sm"
                : "text-ink/55 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filter pills ── */}
      <FilterBar activePhase={activePhase} />

      {/* ── Content ── */}
      <div className="space-y-5 p-5 md:p-6">
        {tab === "overview" && (
          <OverviewTab
            client={client} journey={journey} profile={profile} tsa={tsa}
            indicators={indicators} resumes={resumes} goals={goals}
            pending={pending} completedAssessments={completedAssessments}
            activePhase={activePhase} docReadiness={docReadiness}
            confidence={confidence} updateJourney={updateJourney}
          />
        )}
        {tab === "assessments" && <AssessmentsTab tsa={tsa} completedAssessments={completedAssessments} pending={pending} />}
        {tab === "documents" && <DocumentsTab resumes={resumes} indicators={indicators} docReadiness={docReadiness} />}
        {tab === "training" && <TrainingTab indicators={indicators} />}
        {tab === "milestones" && <MilestonesTab client={client} indicators={indicators} activePhase={activePhase} />}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   Filter bar
   ════════════════════════════════════════════════════════════════ */
function FilterBar({ activePhase }: { activePhase: number }) {
  const pills = ["All phases", "Discovery", "Resume prep", "Interview", "Employment"];
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-2 overflow-x-auto px-5 py-3 md:px-6">
      {pills.map((p, i) => (
        <button
          key={p}
          onClick={() => setActive(i)}
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold transition ${
            active === i
              ? "border-accent bg-accent/10 text-accent"
              : "border-ink/10 text-ink/45 hover:border-accent/40 hover:text-accent"
          }`}
        >
          {p}{i > 0 && i === activePhase && <span className="ml-1 text-[9px]">ACTIVE</span>}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Overview tab
   ════════════════════════════════════════════════════════════════ */
function OverviewTab({
  client, journey, profile, tsa, indicators, resumes, goals,
  pending, completedAssessments, activePhase, docReadiness, confidence, updateJourney,
}: {
  client: ClientUser; journey: JourneyProfile; profile: UserProfile; tsa: TSAResult | null;
  indicators: ReturnType<typeof buildProgress>; resumes: number; goals: number;
  pending: { toolTitle: string }[]; completedAssessments: number;
  activePhase: number; docReadiness: number; confidence: number[];
  updateJourney: (p: Partial<JourneyProfile>) => void;
}) {
  return (
    <>
      {/* ── Journey stepper ── */}
      <JourneyStepper activePhase={activePhase} />

      {/* ── KPI row ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Assessments" accent="emerald">
          <p className="text-2xl font-bold text-ink">{completedAssessments} <span className="text-sm font-semibold text-ink/40">/ {completedAssessments + pending.length}</span></p>
          {pending.length > 0 && (
            <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {pending.length} pending
            </span>
          )}
        </KpiCard>

        <KpiCard title="Document Readiness" accent="blue">
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-ink">{docReadiness}%</p>
            <div className="mb-1 h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${docReadiness}%` }} />
            </div>
          </div>
        </KpiCard>

        <KpiCard title="Courses & Training" accent="purple">
          <p className="text-2xl font-bold text-ink">{indicators.counselingParticipation}</p>
          <p className="text-[11px] text-ink/45">completed</p>
        </KpiCard>

        <KpiCard title="Confidence Index" accent="teal">
          <MiniSparkline data={confidence} />
        </KpiCard>

        <KpiCard title="Next Up" accent="amber">
          {pending.length > 0 ? (
            <Link href="/my-assessments" className="text-sm font-bold text-amber-700 hover:underline">{pending[0].toolTitle}</Link>
          ) : (
            <Link href="/coach" className="text-sm font-bold text-accent hover:underline">Talk to AI Agent</Link>
          )}
          <p className="mt-0.5 text-[10px] text-ink/40">{pending.length > 0 ? "Assessment due" : "Get recommendations"}</p>
        </KpiCard>
      </div>

      {/* ── 3-column grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT: Skill wheel + document vault */}
        <div className="space-y-4">
          <WidgetCard title="Skill Wheel" icon="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z">
            <SkillRadar tsa={tsa} />
          </WidgetCard>
          <WidgetCard title="Quick-Access Document Vault" icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z">
            <DocumentVault resumes={resumes} />
          </WidgetCard>
        </div>

        {/* CENTER: Badge case */}
        <WidgetCard title="Micro-Credential Badge Case" icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
          <BadgeCase indicators={indicators} completedAssessments={completedAssessments} resumes={resumes} tsa={tsa} />
        </WidgetCard>

        {/* RIGHT: Action items */}
        <WidgetCard title="Action Items & Milestones" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
          <ActionItems client={client} indicators={indicators} resumes={resumes} pending={pending} />
        </WidgetCard>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Journey stepper
   ════════════════════════════════════════════════════════════════ */
function JourneyStepper({ activePhase }: { activePhase: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-cream/40 p-4 md:p-5">
      <div className="flex min-w-[560px] items-center">
        {PHASES.map((p, i) => {
          const done = p.n < activePhase;
          const current = p.n === activePhase;
          const future = p.n > activePhase;
          return (
            <div key={p.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition ${
                  done ? "bg-emerald-500 text-white" :
                  current ? "bg-[#0E5A46] text-white ring-4 ring-emerald-400/30 shadow-lg shadow-emerald-500/20" :
                  "bg-ink/10 text-ink/35"
                }`}>
                  {done ? <SvgIcon d="M5 13l4 4L19 7" className="text-white" size={18} /> : p.n}
                </span>
                <span className={`max-w-[100px] text-[11px] font-bold leading-tight ${
                  done ? "text-emerald-700" : current ? "text-[#0E5A46]" : "text-ink/35"
                }`}>
                  {p.short}
                </span>
                {current && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">Active</span>}
              </div>
              {i < PHASES.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded-full ${done ? "bg-emerald-400" : "bg-ink/10"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   KPI card
   ════════════════════════════════════════════════════════════════ */
function KpiCard({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  const bar: Record<string, string> = { emerald: "bg-emerald-500", blue: "bg-blue-500", purple: "bg-purple-500", teal: "bg-teal-500", amber: "bg-amber-500" };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className={`absolute left-0 top-0 h-full w-1 ${bar[accent] ?? "bg-accent"}`} />
      <p className="mb-2 pl-2 text-[11px] font-bold uppercase tracking-wider text-ink/40">{title}</p>
      <div className="pl-2">{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Mini sparkline
   ════════════════════════════════════════════════════════════════ */
function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const h = 32; const w = 80;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(" ");
  return (
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-ink">{data[data.length - 1]}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-20" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="#0F6B54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Widget card
   ════════════════════════════════════════════════════════════════ */
function WidgetCard({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-ink/5 px-4 py-3">
        <SvgIcon d={icon} className="text-accent" size={16} />
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Skill radar (SVG spider chart)
   ════════════════════════════════════════════════════════════════ */
function SkillRadar({ tsa }: { tsa: TSAResult | null }) {
  const cx = 90, cy = 90, r = 70;
  const skills = tsa?.coreSkills ?? [];
  const values = SKILL_AXES.map((axis) => {
    const match = skills.find(s => s.category?.toLowerCase().includes(axis.toLowerCase().split(" ")[0]) || s.skill?.toLowerCase().includes(axis.toLowerCase().split(" ")[0]));
    return match ? 75 + Math.random() * 20 : 30 + Math.random() * 25;
  });
  const pts = values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / SKILL_AXES.length - Math.PI / 2;
    const dist = (v / 100) * r;
    return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 180" className="h-44 w-44">
        {/* Grid rings */}
        {[0.33, 0.66, 1].map(s => (
          <polygon key={s} points={SKILL_AXES.map((_, i) => {
            const a = (Math.PI * 2 * i) / SKILL_AXES.length - Math.PI / 2;
            return `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}`;
          }).join(" ")} fill="none" stroke="rgba(28,33,30,0.08)" strokeWidth="1" />
        ))}
        {/* Axes */}
        {SKILL_AXES.map((_, i) => {
          const a = (Math.PI * 2 * i) / SKILL_AXES.length - Math.PI / 2;
          return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(28,33,30,0.06)" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon points={pts.join(" ")} fill="rgba(15,107,84,0.15)" stroke="#0F6B54" strokeWidth="2" />
        {/* Data dots */}
        {pts.map((pt, i) => { const [x, y] = pt.split(","); return <circle key={i} cx={x} cy={y} r="3" fill="#0F6B54" />; })}
        {/* Labels */}
        {SKILL_AXES.map((label, i) => {
          const a = (Math.PI * 2 * i) / SKILL_AXES.length - Math.PI / 2;
          const lx = cx + (r + 16) * Math.cos(a);
          const ly = cy + (r + 16) * Math.sin(a);
          return <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-ink/50 text-[7px] font-semibold">{label}</text>;
        })}
      </svg>
      {!tsa && <p className="mt-1 text-xs text-ink/45"><Link href="/transferable-skills" className="text-accent font-bold underline">Run skills analysis</Link> to personalize</p>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Document vault
   ════════════════════════════════════════════════════════════════ */
function DocumentVault({ resumes }: { resumes: number }) {
  const files = [
    { name: resumes > 0 ? "Primary Resume.pdf" : "No resume yet", exists: resumes > 0, href: "/resume" },
    { name: "Cover Letter", exists: resumes > 0, href: "/resume" },
  ];
  return (
    <div className="space-y-2">
      {files.map(f => (
        <Link key={f.name} href={f.href} className={`flex items-center gap-3 rounded-xl border p-3 transition ${f.exists ? "border-emerald-200 bg-emerald-50/50 hover:shadow-sm" : "border-ink/10 bg-ink/[0.02]"}`}>
          <SvgIcon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" className={f.exists ? "text-emerald-600" : "text-ink/25"} size={18} />
          <span className={`flex-1 text-sm font-semibold ${f.exists ? "text-ink" : "text-ink/35"}`}>{f.name}</span>
          <SvgIcon d={f.exists ? "M12 5v14M5 12h14" : "M12 5v14M5 12h14"} className={f.exists ? "text-emerald-500" : "text-ink/20"} size={14} />
        </Link>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Badge case
   ════════════════════════════════════════════════════════════════ */
function BadgeCase({ indicators, completedAssessments, resumes, tsa }: {
  indicators: ReturnType<typeof buildProgress>; completedAssessments: number; resumes: number; tsa: TSAResult | null;
}) {
  const unlocked: Record<string, boolean> = {
    riasec: indicators.counselingParticipation > 0,
    tsa: !!tsa,
    resume: resumes > 0,
    interview: indicators.interviewPrepCompleted > 0,
    advocacy: indicators.selfAdvocacyActions > 0,
    customer: completedAssessments >= 3,
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      {BADGES.map(b => {
        const earned = unlocked[b.id];
        return (
          <div key={b.id} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${earned ? "border-accent/20 bg-accent/5" : "border-ink/5 bg-ink/[0.02] opacity-40"}`}>
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${earned ? "bg-accent/10 ring-2 ring-accent/20" : "bg-ink/5"}`}>
              <SvgIcon d={b.icon} className={earned ? "text-accent" : "text-ink/25"} size={22} />
            </span>
            <span className={`text-xs font-bold ${earned ? "text-accent" : "text-ink/30"}`}>{b.label}</span>
            {earned
              ? <span className="text-[9px] font-bold uppercase text-emerald-600">Earned</span>
              : <span className="text-[9px] font-bold uppercase text-ink/25">Locked</span>
            }
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Action items
   ════════════════════════════════════════════════════════════════ */
function ActionItems({ client, indicators, resumes, pending }: {
  client: ClientUser; indicators: ReturnType<typeof buildProgress>; resumes: number; pending: { toolTitle: string }[];
}) {
  const items = [
    { label: "Resume Build", progress: resumes > 0 ? 74 : 10, status: resumes > 0 ? "Awaiting counselor review" : "Not started", color: "bg-blue-500" },
    { label: "Interview Prep Module", progress: indicators.interviewPrepCompleted > 0 ? 60 : 20, status: "Due Friday", color: "bg-purple-500" },
    { label: "Financial Stability & Work Clothing", progress: 50, status: "In progress", color: "bg-amber-500" },
    ...(pending.length > 0 ? [{ label: pending[0].toolTitle, progress: 0, status: "Assigned — not started", color: "bg-emerald-500" }] : []),
  ];

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-bold text-ink">{item.label}</span>
            <span className="text-xs font-bold text-ink/40">{item.progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
            <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${item.progress}%` }} />
          </div>
          <p className="mt-1 text-[10px] font-semibold text-ink/40">{item.status}</p>
        </div>
      ))}

      <div className="mt-3 rounded-xl border border-accent/15 bg-accent/5 p-3 text-center">
        <p className="text-xs font-bold text-accent">Overall journey: {client.progress}% complete</p>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-accent/15">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${client.progress}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Sub-tab content
   ════════════════════════════════════════════════════════════════ */
function AssessmentsTab({ tsa, completedAssessments, pending }: { tsa: TSAResult | null; completedAssessments: number; pending: { toolTitle: string }[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WidgetCard title="Skill Radar" icon="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z">
        <SkillRadar tsa={tsa} />
      </WidgetCard>
      <div className="space-y-4">
        <WidgetCard title="Assessment Summary" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2">
          <div className="space-y-2">
            <p className="text-sm text-ink/70"><strong className="text-ink">{completedAssessments}</strong> completed</p>
            {pending.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-700">Pending assessments</p>
                <ul className="mt-1 space-y-1">{pending.map(p => <li key={p.toolTitle} className="text-sm text-ink/70">{p.toolTitle}</li>)}</ul>
              </div>
            )}
            <Link href="/my-assessments" className="inline-flex rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent/90">View all assessments</Link>
          </div>
        </WidgetCard>
        {tsa && tsa.coreSkills.length > 0 && (
          <WidgetCard title="Top Skills" icon="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3">
            <div className="flex flex-wrap gap-2">
              {tsa.coreSkills.slice(0, 8).map(s => (
                <span key={s.skill} className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent">{s.skill}</span>
              ))}
            </div>
          </WidgetCard>
        )}
      </div>
    </div>
  );
}

function DocumentsTab({ resumes, indicators, docReadiness }: { resumes: number; indicators: ReturnType<typeof buildProgress>; docReadiness: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WidgetCard title="Document Readiness" icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z">
        <div className="text-center">
          <p className="text-5xl font-bold text-ink">{docReadiness}%</p>
          <div className="mx-auto mt-3 h-3 max-w-xs overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${docReadiness}%` }} />
          </div>
          <p className="mt-3 text-sm text-ink/55">Resumes: {resumes} | Documents generated: {indicators.jobApplicationsSubmitted}</p>
          <Link href="/resume" className="mt-3 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-bold text-white hover:bg-accent/90">Build a resume</Link>
        </div>
      </WidgetCard>
      <WidgetCard title="Document Vault" icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z">
        <DocumentVault resumes={resumes} />
      </WidgetCard>
    </div>
  );
}

function TrainingTab({ indicators }: { indicators: ReturnType<typeof buildProgress> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WidgetCard title="Training Progress" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
        <div className="space-y-3 text-center">
          <p className="text-5xl font-bold text-ink">{indicators.counselingParticipation}</p>
          <p className="text-sm font-semibold text-ink/55">Courses & assessments completed</p>
          <Link href="/training" className="inline-flex rounded-full bg-accent px-5 py-2 text-sm font-bold text-white hover:bg-accent/90">View training catalog</Link>
        </div>
      </WidgetCard>
      <WidgetCard title="Recommended Next" icon="M13 10V3L4 14h7v7l9-11h-7z">
        <div className="space-y-2">
          {["Interest Profiler (RIASEC)", "Transferable Skills Analysis", "Interview Prep Workshop"].map(c => (
            <div key={c} className="flex items-center gap-3 rounded-xl border border-ink/10 p-3">
              <SvgIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" className="text-accent" size={16} />
              <span className="text-sm font-semibold text-ink">{c}</span>
            </div>
          ))}
        </div>
      </WidgetCard>
    </div>
  );
}

function MilestonesTab({ client, indicators, activePhase }: { client: ClientUser; indicators: ReturnType<typeof buildProgress>; activePhase: number }) {
  return (
    <div className="space-y-4">
      <JourneyStepper activePhase={activePhase} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-700">{indicators.employmentMilestones}</p>
          <p className="text-sm font-semibold text-emerald-700/70">Employment milestones</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{indicators.totalActions}</p>
          <p className="text-sm font-semibold text-blue-700/70">Total actions taken</p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">{client.progress}%</p>
          <p className="text-sm font-semibold text-purple-700/70">Journey complete</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SVG icon helper
   ════════════════════════════════════════════════════════════════ */
function SvgIcon({ d, className = "", size = 20 }: { d: string; className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}
