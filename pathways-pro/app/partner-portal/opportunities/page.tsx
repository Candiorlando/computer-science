"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import {
  appendOpportunity,
  newPartnerId,
  opportunitiesForPartner,
  type Opportunity,
  type OpportunityKind,
} from "@/lib/employment-partners";
import { recordCaseNoteEvent } from "@/lib/case-notes";
import { seedPartnerDemo } from "@/lib/partner-seed";

const KINDS: { value: OpportunityKind; label: string }[] = [
  { value: "competitive-job", label: "Competitive integrated job" },
  { value: "supported-employment", label: "Supported employment" },
  { value: "customized-employment", label: "Customized employment" },
  { value: "internship", label: "Internship" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "volunteer", label: "Volunteer placement" },
];

export default function PartnerOpportunitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);
  const [bump, setBump] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
  }, [router, bump]);

  const opps = useMemo(
    () => (user ? opportunitiesForPartner(user.partnerOrgId) : []),
    [user, bump],
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
            Opportunities
          </p>
          <h1 className="text-3xl font-semibold">
            Job postings, internships, apprenticeships, volunteer roles
          </h1>
          <p className="text-ink/65 text-sm mt-1">
            Posting an opportunity here makes it visible to your assigned
            counselor for candidate matching.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
        >
          ➕ Post opportunity
        </button>
      </header>

      {opps.length === 0 ? (
        <div className="saas-card text-center text-ink/55 italic">
          No opportunities posted yet.
        </div>
      ) : (
        <ul role="list" className="space-y-3">
          {opps.map((o) => (
            <OppCard key={o.id} o={o} />
          ))}
        </ul>
      )}

      {open && (
        <NewOpportunityModal
          user={user}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            setBump((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function OppCard({ o }: { o: Opportunity }) {
  return (
    <li className="saas-card">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <h3 className="text-lg font-semibold">{o.title}</h3>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
            o.kind === "customized-employment"
              ? "bg-cyan-100 text-cyan-900"
              : "bg-emerald-100 text-emerald-900"
          }`}
        >
          {o.kind.replaceAll("-", " ")}
        </span>
      </div>
      <p className="text-sm text-ink/75">{o.description}</p>
      <div className="grid sm:grid-cols-4 gap-2 mt-3 text-xs">
        <Pill label="Hours/wk" value={o.hoursPerWeek.toString()} />
        <Pill label="Wage" value={o.wage ?? "—"} />
        <Pill label="Location" value={o.location} />
        <Pill label="Status" value={o.status} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {o.willingToCarveRole && (
          <Tag label="✂️ Willing to carve role" />
        )}
        {o.willingToAdjustSchedule && (
          <Tag label="🗓️ Willing to adjust schedule" />
        )}
        {o.accommodationsAvailable.map((a, i) => (
          <Tag key={i} label={`♿ ${a}`} />
        ))}
      </div>
    </li>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded p-2 bg-white">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-[11px] bg-cyan-50 text-cyan-900 border border-cyan-200 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

function NewOpportunityModal({
  user,
  onClose,
  onCreated,
}: {
  user: EmploymentPartnerUser;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<OpportunityKind>("competitive-job");
  const [description, setDescription] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [wage, setWage] = useState("");
  const [location, setLocation] = useState("");
  const [willingToCarveRole, setCarve] = useState(false);
  const [willingToAdjustSchedule, setSched] = useState(false);
  const [accomm, setAccomm] = useState("");

  function submit() {
    if (!title.trim() || !description.trim() || !location.trim()) return;
    const o: Opportunity = {
      id: newPartnerId("opp"),
      partnerOrgId: user.partnerOrgId,
      partnerOrgName: user.partnerOrgName,
      postedByEmail: user.email,
      title,
      kind,
      description,
      hoursPerWeek,
      wage: wage || undefined,
      location,
      willingToCarveRole,
      willingToAdjustSchedule,
      accommodationsAvailable: accomm
        ? accomm.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      status: "open",
      createdAt: new Date().toISOString(),
    };
    appendOpportunity(o);
    recordCaseNoteEvent({
      kind: "partner-opportunity-posted",
      participantType: "employment-partner",
      partnerOrgId: user.partnerOrgId,
      partnerOrgName: user.partnerOrgName,
      actorName: user.name,
      sourceArtifactId: o.id,
      opportunityTitle: title,
      opportunityKind: kind,
      hoursPerWeek,
    });
    onCreated();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold">Post a new opportunity</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Prep Assistant"
            />
          </Field>
          <Field label="Kind">
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value as OpportunityKind)}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hours per week">
            <input
              type="number"
              className="input"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              min={0}
              max={60}
            />
          </Field>
          <Field label="Wage">
            <input
              className="input"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder="e.g., $17/hr or unpaid volunteer"
            />
          </Field>
          <Field label="Location">
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or ZIP"
            />
          </Field>
        </div>
        <Field label="Job description">
          <textarea
            className="input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Accommodations available on day one (comma-separated)">
          <input
            className="input"
            value={accomm}
            onChange={(e) => setAccomm(e.target.value)}
            placeholder="e.g., Noise headphones, visual checklists, job coach welcome"
          />
        </Field>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={willingToCarveRole}
              onChange={(e) => setCarve(e.target.checked)}
              className="accent-cyan-500"
            />
            Willing to carve role
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={willingToAdjustSchedule}
              onChange={(e) => setSched(e.target.checked)}
              className="accent-cyan-500"
            />
            Willing to adjust schedule
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border border-ink/15 px-4 py-1.5 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="grad-tealblue text-white px-4 py-1.5 rounded-md font-semibold text-sm"
          >
            Post opportunity →
          </button>
        </div>
        <style jsx>{`
          :global(.input) {
            width: 100%;
            background: #1E293B;
            border: 1px solid rgba(230, 234, 242, 0.15);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
          :global(.input:focus-visible) {
            outline: 2px solid #06b6d4;
            outline-offset: -1px;
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
