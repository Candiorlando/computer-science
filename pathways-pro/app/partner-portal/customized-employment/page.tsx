"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import {
  appendCEEngagement,
  CE_TOOL_TEMPLATES,
  ceForPartner,
  newPartnerId,
  updateCEEngagement,
  type CEStage,
  type CustomizedEmploymentEngagement,
} from "@/lib/employment-partners";
import { recordCaseNoteEvent } from "@/lib/case-notes";
import { seedPartnerDemo } from "@/lib/partner-seed";

const STAGES: { value: CEStage; label: string }[] = [
  { value: "discovery", label: "Discovery" },
  { value: "job-design", label: "Job design" },
  { value: "employer-negotiation", label: "Employer negotiation" },
  { value: "worksite-customization", label: "Worksite customization" },
  { value: "placement", label: "Placement" },
  { value: "stabilization", label: "Stabilization" },
  { value: "long-term-support", label: "Long-term support" },
];

export default function CustomizedEmploymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);
  const [bump, setBump] = useState(0);
  const [openNew, setOpenNew] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    if (!s.participatesInCustomizedEmployment)
      return router.replace("/partner-portal");
    seedPartnerDemo();
    setUser(s);
  }, [router, bump]);

  const engagements = useMemo(
    () => (user ? ceForPartner(user.partnerOrgId) : []),
    [user, bump],
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-700 font-semibold mb-1">
            🎯 Customized Employment Workspace
          </p>
          <h1 className="text-3xl font-semibold">
            Discovery · job design · negotiation · placement · stabilization
          </h1>
          <p className="text-ink/65 text-sm mt-1 prose-narrow">
            Customized Employment is an individualized strategy for workers
            with significant disabilities — built around personal strengths,
            negotiated job tasks, and a custom worksite arrangement.
          </p>
        </div>
        <button
          onClick={() => setOpenNew(true)}
          className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
        >
          ➕ Start a CE engagement
        </button>
      </header>

      {/* Tool templates */}
      <ToolTemplates />

      {engagements.length === 0 ? (
        <div className="saas-card text-center text-ink/55 italic">
          No Customized Employment engagements yet. Start one above.
        </div>
      ) : (
        <ul role="list" className="space-y-4">
          {engagements.map((e) => (
            <EngagementCard
              key={e.id}
              e={e}
              user={user}
              onChange={() => setBump((n) => n + 1)}
            />
          ))}
        </ul>
      )}

      {openNew && (
        <NewEngagementModal
          user={user}
          onClose={() => setOpenNew(false)}
          onCreated={() => {
            setOpenNew(false);
            setBump((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function ToolTemplates() {
  return (
    <section className="saas-card grad-tealblue-soft space-y-4">
      <h2 className="text-lg font-semibold">Reference: CE planning prompts</h2>
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <h3 className="font-semibold mb-1">🔎 Discovery</h3>
          <ul className="space-y-1 text-ink/75 text-xs list-disc pl-4">
            {CE_TOOL_TEMPLATES.discoveryPrompts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-1">✂️ Job carving</h3>
          <ul className="space-y-1 text-ink/75 text-xs list-disc pl-4">
            {CE_TOOL_TEMPLATES.jobCarvingPrompts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-1">🤝 Employer negotiation</h3>
          <ul className="space-y-1 text-ink/75 text-xs list-disc pl-4">
            {CE_TOOL_TEMPLATES.employerNegotiationFraming.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function EngagementCard({
  e,
  user,
  onChange,
}: {
  e: CustomizedEmploymentEngagement;
  user: EmploymentPartnerUser;
  onChange: () => void;
}) {
  function advance(newStage: CEStage) {
    updateCEEngagement(e.id, { currentStage: newStage });
    recordCaseNoteEvent({
      kind: "partner-ce-stage-advanced",
      participantType: "employment-partner",
      partnerOrgId: user.partnerOrgId,
      partnerOrgName: user.partnerOrgName,
      actorName: user.name,
      sourceArtifactId: e.id,
      clientName: e.clientName,
      caseId: e.caseId,
      newStage,
    });
    onChange();
  }

  return (
    <li className="saas-card space-y-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-xl font-semibold">
            {e.clientName ?? "Unassigned"}
            {e.proposedTitle && (
              <span className="text-ink/55 font-normal text-base">
                {" "}
                · {e.proposedTitle}
              </span>
            )}
          </h3>
          <p className="text-xs text-ink/60">
            {e.caseId ? `Case ${e.caseId} · ` : ""}Updated{" "}
            {new Date(e.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-full">
          🎯 {e.currentStage.replaceAll("-", " ")}
        </span>
      </header>

      {/* Stage progress */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto pb-2">
        {STAGES.map((s, i) => {
          const idx = STAGES.findIndex((x) => x.value === e.currentStage);
          const reached = i <= idx;
          return (
            <div key={s.value} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => advance(s.value)}
                className={`px-2.5 py-1 rounded-full font-semibold ${
                  reached
                    ? "grad-tealblue text-white"
                    : "border border-ink/15 text-ink/55 hover:border-cyan-500"
                }`}
              >
                {s.label}
              </button>
              {i < STAGES.length - 1 && (
                <span className="text-ink/30">›</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <Block title="Strengths">
          <ul className="list-disc pl-4 text-ink/75 space-y-0.5">
            {e.clientStrengths.length === 0 ? (
              <li className="italic text-ink/55">No strengths logged yet.</li>
            ) : (
              e.clientStrengths.map((s, i) => <li key={i}>{s}</li>)
            )}
          </ul>
        </Block>
        <Block title="Interests">
          <ul className="list-disc pl-4 text-ink/75 space-y-0.5">
            {e.clientInterests.length === 0 ? (
              <li className="italic text-ink/55">No interests logged yet.</li>
            ) : (
              e.clientInterests.map((s, i) => <li key={i}>{s}</li>)
            )}
          </ul>
        </Block>
        <Block title="Carved tasks">
          <ul className="list-disc pl-4 text-ink/75 space-y-0.5">
            {e.carvedTasks.length === 0 ? (
              <li className="italic text-ink/55">No carved tasks yet.</li>
            ) : (
              e.carvedTasks.map((s, i) => <li key={i}>{s}</li>)
            )}
          </ul>
        </Block>
        <Block title="Worksite accommodations">
          <ul className="list-disc pl-4 text-ink/75 space-y-0.5">
            {e.worksiteAccommodations.length === 0 ? (
              <li className="italic text-ink/55">No accommodations logged.</li>
            ) : (
              e.worksiteAccommodations.map((s, i) => <li key={i}>{s}</li>)
            )}
          </ul>
        </Block>
      </div>

      {e.milestones.length > 0 && (
        <Block title="Milestones">
          <ul className="space-y-1.5 text-sm">
            {e.milestones.map((m, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={m.metAt ? "text-emerald-700" : "text-ink/40"}>
                  {m.metAt ? "✓" : "○"}
                </span>
                <span className="flex-1">{m.label}</span>
                <span className="text-xs text-ink/55">
                  {m.metAt
                    ? `Met ${new Date(m.metAt).toLocaleDateString()}`
                    : `Target ${m.targetDate}`}
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {e.discoveryNotes && (
        <Block title="Discovery notes">
          <p className="text-sm text-ink/75 italic">{e.discoveryNotes}</p>
        </Block>
      )}
    </li>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-cyan-300 pl-3">
      <h4 className="text-xs uppercase tracking-wider text-cyan-700 font-semibold mb-1">
        {title}
      </h4>
      {children}
    </div>
  );
}

function NewEngagementModal({
  user,
  onClose,
  onCreated,
}: {
  user: EmploymentPartnerUser;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [clientName, setClientName] = useState("");
  const [caseId, setCaseId] = useState("");
  const [discoveryNotes, setDiscoveryNotes] = useState("");
  const [strengths, setStrengths] = useState("");
  const [interests, setInterests] = useState("");

  function submit() {
    const e: CustomizedEmploymentEngagement = {
      id: newPartnerId("ce"),
      partnerOrgId: user.partnerOrgId,
      partnerOrgName: user.partnerOrgName,
      caseId: caseId || undefined,
      clientName: clientName || undefined,
      discoveryNotes,
      clientStrengths: strengths
        ? strengths.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      clientInterests: interests
        ? interests.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      carvedTasks: [],
      proposedTitle: "",
      proposedHoursPerWeek: 0,
      worksiteAccommodations: [],
      currentStage: "discovery",
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appendCEEngagement(e);
    recordCaseNoteEvent({
      kind: "partner-ce-selected",
      participantType: "employment-partner",
      partnerOrgId: user.partnerOrgId,
      partnerOrgName: user.partnerOrgName,
      actorName: user.name,
      sourceArtifactId: e.id,
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
        className="bg-cream rounded-lg shadow-lg max-w-xl w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold">Start a CE engagement</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Client name (if known)">
            <input
              className="input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </Field>
          <Field label="Case ID (if known)">
            <input
              className="input"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="VR-2026-NNNN"
            />
          </Field>
        </div>
        <Field label="Discovery notes">
          <textarea
            className="input min-h-[100px]"
            value={discoveryNotes}
            onChange={(e) => setDiscoveryNotes(e.target.value)}
            placeholder="What did you learn about this person's strengths, energy patterns, ideal environment?"
          />
        </Field>
        <Field label="Strengths (comma-separated)">
          <input
            className="input"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
          />
        </Field>
        <Field label="Interests (comma-separated)">
          <input
            className="input"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Field>
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
            Begin Discovery →
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
