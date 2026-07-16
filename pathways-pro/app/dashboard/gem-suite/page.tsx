"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Database,
  Download,
  FileDown,
  FileText,
  LockKeyhole,
  Mail,
  Megaphone,
  Network,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Users,
} from "lucide-react";

type ModuleId = "target" | "content" | "outreach" | "events";

type Lead = {
  entityName: string;
  entityType: "Corporate Client" | "Government" | "Higher Ed" | "Non-Profit";
  relevance: string;
  sourceStatus: "Verified" | "Queued" | "Needs Review";
  email: string;
};

const leads: Lead[] = [
  {
    entityName: "Northstar Logistics Group",
    entityType: "Corporate Client",
    relevance: "Return-to-work partnerships, WOTC eligible hiring, ergonomic retention",
    sourceStatus: "Verified",
    email: "workforce@northstarlogistics.example",
  },
  {
    entityName: "Illinois Regional Workforce Board",
    entityType: "Government",
    relevance: "WIOA Title I referrals, Pre-ETS collaboration, measurable skill gains",
    sourceStatus: "Queued",
    email: "partnerships@irwb.example",
  },
  {
    entityName: "Lakefront Community College",
    entityType: "Higher Ed",
    relevance: "Transition services, certificate pathways, disability services alignment",
    sourceStatus: "Verified",
    email: "careerservices@lakefrontcc.example",
  },
  {
    entityName: "BridgeWorks Community Alliance",
    entityType: "Non-Profit",
    relevance: "Supported employment, social enterprise pilots, community placement",
    sourceStatus: "Needs Review",
    email: "programs@bridgeworks.example",
  },
];

const modules = [
  { id: "target" as const, label: "Target Intelligence", icon: Database },
  { id: "content" as const, label: "AI Content Engine", icon: Bot },
  { id: "outreach" as const, label: "Digital Outreach", icon: Mail },
  { id: "events" as const, label: "Engagement Matrix", icon: CalendarDays },
];

const eventRows = [
  {
    phase: "Discovery",
    partner: "Lakefront Community College",
    participants: "Disability Services, Career Center, 18 Pre-ETS students",
    sponsor: "Northstar Logistics Group",
    score: 88,
  },
  {
    phase: "Activation",
    partner: "Westside Vocational Institute",
    participants: "Manufacturing cohort, 3 job coaches, HR sponsor",
    sponsor: "Meridian Manufacturing",
    score: 82,
  },
  {
    phase: "Retention",
    partner: "BridgeWorks Community Alliance",
    participants: "Supported employment team, benefits counselor, EAP lead",
    sponsor: "CivicCare Health Network",
    score: 91,
  },
];

export default function GemSuitePage() {
  const [active, setActive] = useState<ModuleId>("target");
  const [targetSegment, setTargetSegment] = useState("Corporate HR / Workforce Development");
  const [deliverable, setDeliverable] = useState("B2B Pitch Letter");
  const [coreMessage, setCoreMessage] = useState(
    "Pathways Pro connects employers with rehabilitation professionals to build inclusive pipelines, improve retention, and document measurable civic impact.",
  );

  const roster = useMemo(() => leads.map((lead) => lead.email).join("; "), []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Growth, Engagement &amp; Marketing Suite
        </p>
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Enterprise outreach workspace for civic growth.
          </h1>
          <p className="text-sm text-ink/60 leading-relaxed">
            Centralize target intelligence, AI-assisted document generation,
            secure outreach, and stakeholder engagement planning in a single
            high-scannability workspace.
          </p>
        </div>
      </header>

      <section className="bg-white border border-ink/10 rounded-2xl p-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const selected = active === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setActive(mod.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                selected
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink/65 hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{mod.label}</span>
            </button>
          );
        })}
      </section>

      {active === "target" && <TargetIntelligence />}
      {active === "content" && (
        <ContentEngine
          targetSegment={targetSegment}
          setTargetSegment={setTargetSegment}
          deliverable={deliverable}
          setDeliverable={setDeliverable}
          coreMessage={coreMessage}
          setCoreMessage={setCoreMessage}
        />
      )}
      {active === "outreach" && <OutreachPanel roster={roster} />}
      {active === "events" && <EngagementMatrix />}
    </div>
  );
}

function WorkspaceCard({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent grid place-items-center">
          {icon}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">
            {eyebrow}
          </p>
          <h2 className="font-bold text-ink">{title}</h2>
        </div>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function TargetIntelligence() {
  return (
    <WorkspaceCard
      eyebrow="Scraping & Roster Module"
      title="Target Intelligence Dashboard"
      icon={<TableProperties className="w-5 h-5" />}
    >
      <div className="space-y-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <MetricCard label="Prospects" value="428" icon={<Users className="w-4 h-4" />} />
          <MetricCard label="Verified Sources" value="73%" icon={<ShieldCheck className="w-4 h-4" />} />
          <MetricCard label="Deep Scrapes Queued" value="31" icon={<Search className="w-4 h-4" />} />
        </div>

        <div className="overflow-x-auto border border-ink/10 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] border-b border-ink/10">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-ink/70">Entity Name</th>
                <th className="text-left px-4 py-3 font-semibold text-ink/70">Entity Type</th>
                <th className="text-left px-4 py-3 font-semibold text-ink/70">WIOA/Rehab Relevance</th>
                <th className="text-left px-4 py-3 font-semibold text-ink/70">Source Status</th>
                <th className="text-left px-4 py-3 font-semibold text-ink/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {leads.map((lead) => (
                <tr key={lead.entityName} className="hover:bg-ink/[0.02] transition">
                  <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{lead.entityName}</td>
                  <td className="px-4 py-3"><Badge>{lead.entityType}</Badge></td>
                  <td className="px-4 py-3 text-ink/65 min-w-[260px]">{lead.relevance}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.sourceStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <ActionChip icon={<Download className="w-3.5 h-3.5" />} label="Export Mailing List" />
                      <ActionChip icon={<Database className="w-3.5 h-3.5" />} label="Deep Scrape Registry" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceCard>
  );
}

function ContentEngine({
  targetSegment,
  setTargetSegment,
  deliverable,
  setDeliverable,
  coreMessage,
  setCoreMessage,
}: {
  targetSegment: string;
  setTargetSegment: (value: string) => void;
  deliverable: string;
  setDeliverable: (value: string) => void;
  coreMessage: string;
  setCoreMessage: (value: string) => void;
}) {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [answers, setAnswers] = useState("");
  const [assetGenerated, setAssetGenerated] = useState(false);

  const questions = [
    `Which specific ${targetSegment.toLowerCase()} audience are we targeting, and who is the decision-maker?`,
    `Which value proposition should lead: WOTC/tax incentives, Pre-ETS pipeline development, WIOA compliance, or clinical retention?`,
    `Should the tone feel authoritative, community-focused, data-driven, or warm and civic-minded?`,
    `What concrete next step should the recipient take after reading this ${deliverable.toLowerCase()}?`,
  ];

  return (
    <WorkspaceCard
      eyebrow="Reverse-Prompting Strategy Console"
      title="GEM AI Strategy Console"
      icon={<Bot className="w-5 h-5" />}
    >
      <div className="grid lg:grid-cols-[0.95fr_1.35fr] gap-5 items-start">
        <div className="border border-ink/10 rounded-2xl bg-cream/50 p-5 space-y-4">
          <div className="flex items-center gap-2 text-accent font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Strategy Configuration
          </div>
          <Field label="Target Entity">
            <select value={targetSegment} onChange={(e) => setTargetSegment(e.target.value)} className="form-field">
              <option>Corporate Partner</option>
              <option>Government Agency</option>
              <option>Educational Institution</option>
              <option>Corporate HR / Workforce Development</option>
              <option>Community Non-Profit Partner</option>
            </select>
          </Field>
          <Field label="Campaign Objective">
            <select value={deliverable} onChange={(e) => setDeliverable(e.target.value)} className="form-field">
              <option>Direct Pitch</option>
              <option>Event Invitation</option>
              <option>Informational Handout</option>
              <option>B2B Pitch Letter</option>
              <option>Community Handout</option>
              <option>Event Guide</option>
            </select>
          </Field>
          <Field label="Brief Description">
            <textarea value={coreMessage} onChange={(e) => setCoreMessage(e.target.value)} className="form-field min-h-[142px]" />
          </Field>
          <button
            onClick={() => {
              setInterviewStarted(true);
              setAssetGenerated(false);
            }}
            className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-accent-light transition"
          >
            <Sparkles className="w-4 h-4" />
            Consult AI Strategy Team
          </button>
        </div>

        <div className="border border-ink/10 rounded-2xl bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent grid place-items-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">Interactive Interview Canvas</p>
              <p className="text-sm font-bold text-ink">Strategic interview before asset generation</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {!interviewStarted && (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-cream/50 p-6 text-center space-y-2">
                <Bot className="w-8 h-8 text-accent mx-auto" />
                <p className="font-semibold text-ink">Ready for consultation</p>
                <p className="text-sm text-ink/55">Configure the campaign, then consult the AI strategy team.</p>
              </div>
            )}

            {interviewStarted && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-accent/5 border border-accent/15 p-4 space-y-3">
                  <p className="text-sm font-semibold text-accent">To optimize this {deliverable.toLowerCase()}, please clarify the following:</p>
                  <ol className="space-y-2 text-sm text-ink/70 list-decimal list-inside">
                    {questions.map((q) => <li key={q}>{q}</li>)}
                  </ol>
                </div>

                <Field label="Your Answers">
                  <textarea
                    value={answers}
                    onChange={(e) => setAnswers(e.target.value)}
                    placeholder="Answer the questions here. Include audience, lead value proposition, tone, and desired next step..."
                    className="form-field min-h-[130px]"
                  />
                </Field>

                <button
                  onClick={() => setAssetGenerated(true)}
                  className="inline-flex items-center gap-2 bg-fresh text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-fresh-dark transition"
                >
                  <FileText className="w-4 h-4" />
                  Generate Asset
                </button>
              </div>
            )}

            {assetGenerated && (
              <div className="rounded-2xl border border-ink/10 bg-cream/40 p-5 space-y-4">
                <div className="flex items-center gap-2 text-accent font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  Generated Marketing Asset
                </div>
                <div className="bg-white border border-ink/10 rounded-xl p-5 text-sm text-ink/75 leading-relaxed space-y-3">
                  <p className="font-semibold text-ink">Subject: A purpose-driven partnership opportunity with Pathways Pro</p>
                  <p>
                    Thank you for considering a partnership designed around dignity, workforce belonging, and measurable civic impact. Based on your strategic priorities, Pathways Pro can help {targetSegment.toLowerCase()} align rehabilitation expertise with concrete workforce outcomes.
                  </p>
                  <p>
                    This {deliverable.toLowerCase()} emphasizes {coreMessage.toLowerCase()} and frames the next step as a focused partnership conversation grounded in equity, retention, and sustainable systems reform.
                  </p>
                  {answers && <p className="text-ink/55">Interview context: {answers}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <ActionButton icon={<FileDown className="w-4 h-4" />} label="Download PDF" />
                  <ActionButton icon={<FileText className="w-4 h-4" />} label="Export Word Doc" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceCard>
  );
}

function OutreachPanel({ roster }: { roster: string }) {
  return (
    <WorkspaceCard
      eyebrow="Secure Messaging & Outreach"
      title="Digital Communication Panel"
      icon={<LockKeyhole className="w-5 h-5" />}
    >
      <div className="space-y-5">
        <div className="border border-ink/10 rounded-2xl p-5 space-y-4">
          <Field label="BCC Roster Auto-Populator">
            <textarea readOnly value={roster} className="form-field min-h-[92px]" />
          </Field>
          <Field label="Message Template">
            <textarea defaultValue="We are coordinating a Pathways Pro partnership briefing focused on inclusive workforce development, retention, and civic impact. Your organization has been identified as a strong potential partner." className="form-field min-h-[120px]" />
          </Field>
          <button className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-accent-light transition">
            <Send className="w-4 h-4" /> Queue Secure Outreach
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ChecklistCard title="Quick-Share Networks" items={["LinkedIn organization update", "Local chamber newsletter", "University career services board", "State workforce partner bulletin"]} icon={<Share2 className="w-4 h-4" />} />
          <ChecklistCard title="Localized Event Alerts" items={["Pre-ETS employer showcase window", "Community college workforce fair", "Corporate accessibility awareness month", "Regional WIOA partner meeting"]} icon={<Megaphone className="w-4 h-4" />} />
        </div>
      </div>
    </WorkspaceCard>
  );
}

function EngagementMatrix() {
  return (
    <WorkspaceCard
      eyebrow="Timeline & Alignment"
      title="Stakeholder Event & Engagement Matrix"
      icon={<Network className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {eventRows.map((row, index) => (
          <div key={row.partner} className="relative border border-ink/10 rounded-2xl p-5 bg-white hover:shadow-sm transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent text-white grid place-items-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-accent font-bold">{row.phase}</p>
                  <h3 className="font-bold text-ink">{row.partner}</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <InfoBlock label="Participant Mapping" value={row.participants} />
                  <InfoBlock label="Corporate Sponsor" value={row.sponsor} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/45">Civic Alignment</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 flex-1 bg-ink/10 rounded-full overflow-hidden">
                        <div className="h-full bg-fresh rounded-full" style={{ width: `${row.score}%` }} />
                      </div>
                      <span className="text-sm font-bold text-ink">{row.score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceCard>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-cream border border-ink/10 rounded-xl p-4">
      <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">{icon}{label}</div>
      <div className="text-2xl font-bold text-ink mt-1">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</span>
      {children}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-accent/10 text-accent text-xs font-semibold px-2 py-1 whitespace-nowrap">{children}</span>;
}

function StatusBadge({ status }: { status: Lead["sourceStatus"] }) {
  const color = status === "Verified" ? "text-emerald-700 bg-emerald-50" : status === "Queued" ? "text-amber-700 bg-amber-50" : "text-sky-700 bg-sky-50";
  return <span className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2 py-1 ${color}`}><CheckCircle2 className="w-3 h-3" />{status}</span>;
}

function ActionChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <button className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-ink/65 hover:border-accent hover:text-accent transition">{icon}{label}</button>;
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/15 px-3 py-2.5 text-sm font-semibold text-ink/70 hover:bg-accent hover:text-white hover:border-accent transition">{icon}{label}</button>;
}

function ChecklistCard({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="border border-ink/10 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 font-bold text-ink">{icon}{title}</div>
      <ul className="space-y-2">
        {items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-ink/65"><CheckCircle2 className="w-4 h-4 text-fresh mt-0.5 flex-shrink-0" />{item}</li>)}
      </ul>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink/45">{label}</p>
      <p className="mt-1 text-ink/70 leading-relaxed">{value}</p>
    </div>
  );
}
