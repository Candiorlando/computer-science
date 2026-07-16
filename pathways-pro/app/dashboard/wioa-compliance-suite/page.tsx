"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Brain,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Database,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderSearch,
  Gauge,
  ListChecks,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type ModuleId = "note" | "billing" | "preets" | "gata" | "analytics" | "reports";

const modules = [
  { id: "note" as const, label: "Note-to-Metric", icon: Brain },
  { id: "billing" as const, label: "Milestone Billing", icon: FileSpreadsheet },
  { id: "preets" as const, label: "Pre-ETS Tracker", icon: Clock },
  { id: "gata" as const, label: "GATA Repository", icon: FolderSearch },
  { id: "analytics" as const, label: "Performance Analytics", icon: BarChart3 },
  { id: "reports" as const, label: "Reviewer Reports", icon: FileCheck2 },
];

const preEtsCategories = [
  { label: "Job Exploration", minutes: 1840, pct: 26 },
  { label: "Post-Secondary Counseling", minutes: 1220, pct: 17 },
  { label: "Workplace Readiness", minutes: 2105, pct: 30 },
  { label: "Work-Based Learning", minutes: 1395, pct: 20 },
  { label: "Self-Advocacy", minutes: 515, pct: 7 },
];

const documentChecklist = [
  "Eligibility verification",
  "Signed IPE / service plan",
  "Progress note mapped to WIOA category",
  "Employer verification / paystub",
  "Milestone attestation",
  "Counselor review signature",
];

const reviewerReports = [
  "IDHS-DRS Monthly Group Billing Sheet",
  "Pre-ETS Five Category Allocation Summary",
  "GATA Randomized Document Sample Packet",
  "WIOA Performance Indicator Trend Report",
  "Case Note-to-Service Mapping Audit Log",
];

export default function WioaComplianceSuitePage() {
  const [active, setActive] = useState<ModuleId>("note");
  const [note, setNote] = useState(
    "Met with client to revise resume, discuss interview disclosure strategy, and identify two manufacturing employers offering entry-level roles with accommodations.",
  );

  const parsedActivities = useMemo(
    () => [
      { activity: "Resume review", category: "Pre-ETS Workplace Readiness", confidence: 96 },
      { activity: "Disclosure strategy", category: "Self-Advocacy", confidence: 91 },
      { activity: "Employer research", category: "Job Exploration Counseling", confidence: 88 },
    ],
    [note],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Counselor Portal · Compliance Operations
        </p>
        <div className="max-w-4xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            WIOA &amp; State Grant Compliance Suite
          </h1>
          <p className="text-sm text-ink/60 leading-relaxed">
            Operational tools for converting daily counseling work into audit-ready documentation, defensible data, compliant billing, and reviewer-acceptable reports.
          </p>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Audit Readiness" value="94%" icon={<SearchCheck className="w-4 h-4" />} />
        <Metric label="Mapped Notes" value="1,284" icon={<Brain className="w-4 h-4" />} />
        <Metric label="Billing Milestones" value="37" icon={<FileSpreadsheet className="w-4 h-4" />} />
        <Metric label="At-Risk Indicators" value="4" icon={<Gauge className="w-4 h-4" />} />
      </section>

      <section className="bg-white border border-ink/10 rounded-2xl p-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const selected = active === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActive(mod.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left transition ${
                selected ? "bg-accent text-white shadow-sm" : "text-ink/65 hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold">{mod.label}</span>
            </button>
          );
        })}
      </section>

      {active === "note" && <NoteToMetric note={note} setNote={setNote} parsedActivities={parsedActivities} />}
      {active === "billing" && <MilestoneBilling />}
      {active === "preets" && <PreEtsTracker />}
      {active === "gata" && <GataRepository />}
      {active === "analytics" && <PerformanceAnalytics />}
      {active === "reports" && <ReviewerReports />}
    </div>
  );
}

function Shell({ title, eyebrow, icon, children }: { title: string; eyebrow: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent grid place-items-center">{icon}</div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">{eyebrow}</p>
          <h2 className="font-bold text-ink">{title}</h2>
        </div>
      </div>
      <div className="p-5 md:p-6 space-y-5">{children}</div>
    </section>
  );
}

function NoteToMetric({ note, setNote, parsedActivities }: { note: string; setNote: (value: string) => void; parsedActivities: { activity: string; category: string; confidence: number }[] }) {
  return (
    <Shell title="AI Note-to-Metric Progress Note Parser" eyebrow="Clinical narrative to compliance mapping" icon={<Brain className="w-5 h-5" />}>
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50">Counselor Progress Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="form-field min-h-[190px]" />
          <button className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-light transition">
            <Sparkles className="w-4 h-4" /> Parse Note
          </button>
        </div>
        <div className="space-y-3">
          {parsedActivities.map((item) => (
            <div key={item.activity} className="border border-ink/10 rounded-xl p-4 bg-cream/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink text-sm">{item.activity}</p>
                  <p className="text-sm text-accent mt-1">{item.category}</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">{item.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function MilestoneBilling() {
  const rows = [
    { client: "Jordan Hayes", target: "15-day retention", due: "Ready", status: "Generate" },
    { client: "Priya Sharma", target: "45-day retention", due: "3 days", status: "Monitor" },
    { client: "Marcus Thomas", target: "90-day retention", due: "Ready", status: "Generate" },
  ];
  return (
    <Shell title="Automated Milestone & Phase Billing Generator" eyebrow="One-click IDHS-DRS roster compilations" icon={<FileSpreadsheet className="w-5 h-5" />}>
      <DataTable headers={["Client", "Milestone", "Due", "Action"]} rows={rows.map((r) => [r.client, r.target, r.due, r.status])} />
      <button className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-light transition"><Download className="w-4 h-4" /> Generate Monthly Group Billing Sheet</button>
    </Shell>
  );
}

function PreEtsTracker() {
  return (
    <Shell title="Pre-ETS Core Activity Time-Tracker" eyebrow="Federal mandate allocation safeguards" icon={<Clock className="w-5 h-5" />}>
      <div className="space-y-4">
        {preEtsCategories.map((cat) => (
          <div key={cat.label}>
            <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-ink">{cat.label}</span><span className="text-ink/55">{cat.minutes} min · {cat.pct}%</span></div>
            <div className="h-2 bg-ink/10 rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${cat.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function GataRepository() {
  return (
    <Shell title="GATA Audit-Ready Document Centralizer" eyebrow="Risk mitigation & structural compliance" icon={<FolderSearch className="w-5 h-5" />}>
      <div className="grid md:grid-cols-2 gap-3">
        {documentChecklist.map((item) => (
          <div key={item} className="flex items-center gap-3 border border-ink/10 rounded-xl p-3 bg-cream/40"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-sm text-ink/75">{item}</span></div>
        ))}
      </div>
      <button className="inline-flex items-center gap-2 border border-accent text-accent px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent hover:text-white transition"><LockKeyhole className="w-4 h-4" /> Create Randomized Auditor Sample</button>
    </Shell>
  );
}

function PerformanceAnalytics() {
  const indicators = [
    { label: "Median Earnings", value: "$4,860", pct: 82 },
    { label: "2nd Quarter Retention", value: "78%", pct: 78 },
    { label: "4th Quarter Retention", value: "71%", pct: 71 },
    { label: "Measurable Skill Gains", value: "64%", pct: 64 },
  ];
  return (
    <Shell title="WIOA Performance Indicator Analytics" eyebrow="Real-time predictive performance metrics" icon={<BarChart3 className="w-5 h-5" />}>
      <div className="grid md:grid-cols-2 gap-4">
        {indicators.map((item) => <Metric key={item.label} label={item.label} value={item.value} icon={<Gauge className="w-4 h-4" />} pct={item.pct} />)}
      </div>
    </Shell>
  );
}

function ReviewerReports() {
  return (
    <Shell title="Compliance Reviewer Report Generator" eyebrow="Forms, assessments, data collection & analysis" icon={<FileCheck2 className="w-5 h-5" />}>
      <div className="grid md:grid-cols-2 gap-3">
        {reviewerReports.map((report) => (
          <div key={report} className="border border-ink/10 rounded-xl p-4 bg-white hover:shadow-sm transition">
            <div className="flex items-start gap-3"><FileText className="w-5 h-5 text-accent" /><div><p className="font-semibold text-sm text-ink">{report}</p><p className="text-xs text-ink/50 mt-1">Includes source data, validation notes, reviewer summary, and export controls.</p></div></div>
          </div>
        ))}
      </div>
      <button className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-light transition"><ClipboardCheck className="w-4 h-4" /> Generate Reviewer Packet</button>
    </Shell>
  );
}

function Metric({ label, value, icon, pct }: { label: string; value: string; icon: React.ReactNode; pct?: number }) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">{icon}{label}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      {pct != null && <div className="h-2 bg-ink/10 rounded-full overflow-hidden"><div className="h-full bg-fresh rounded-full" style={{ width: `${pct}%` }} /></div>}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-ink/10 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03]"><tr>{headers.map((h) => <th key={h} className="text-left px-4 py-3 font-semibold text-ink/70">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-ink/5">{rows.map((row) => <tr key={row.join('-')} className="hover:bg-ink/[0.02]">{row.map((cell) => <td key={cell} className="px-4 py-3 text-ink/70">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
