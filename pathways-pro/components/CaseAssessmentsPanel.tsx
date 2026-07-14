"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateAssessmentReport } from "@/lib/assessment-reports";
import {
  ASSESSMENT_TOOLS,
  getAssessmentTool,
  type Audience,
} from "@/lib/assessment-tools";
import {
  assessmentsForScope,
  updateCaseAssessment,
  type CaseAssessment,
  type CaseScopeKind,
} from "@/lib/case-assessments";
import {
  assignAssessment,
  cancelAssignment,
  pendingAssignmentsForCase,
} from "@/lib/assessment-assignments";
import { getAllClients } from "@/lib/users";
import { AddServiceAssessmentDropdown } from "@/components/AddServiceAssessmentDropdown";

interface Props {
  scopeKind: CaseScopeKind;
  scopeId: string;
  audience: Audience;
  // Optional service filter — when a specific service is active, only
  // show its embedded assessments in the launcher.
  filterServiceId?: string;
  // Counselor email — required for approval
  counselorEmail?: string;
  // Counselor display name — used when assigning an assessment to the
  // client so the portal shows who assigned it.
  counselorName?: string;
  // Where to route when an assessment is launched
  launchRoute?: (toolId: string) => string;
  // Whether to render the "Launch an assessment" tool catalog
  // underneath the existing-assessments list. Business / vendor /
  // partner case files set this to false — assessments for those
  // orgs are launched from a Service Order, not from the case file.
  showLauncher?: boolean;
}

export function CaseAssessmentsPanel({
  scopeKind,
  scopeId,
  audience,
  filterServiceId,
  counselorEmail,
  counselorName,
  launchRoute,
  showLauncher = true,
}: Props) {
  const router = useRouter();
  const [bump, setBump] = useState(0);
  const existing = useMemo(
    () => assessmentsForScope(scopeKind, scopeId),
    [scopeKind, scopeId, bump],
  );

  // Consolidated report generation — client case files only, once at
  // least one assessment is on file.
  const canGenerateReport =
    scopeKind === "client-case" &&
    Boolean(counselorEmail) &&
    existing.length > 0;

  function generateReport() {
    generateAssessmentReport(scopeId, counselorName ?? counselorEmail ?? "");
    router.push(`/case/${scopeId}/document/assessment-report-${scopeId}`);
  }

  // Assign-to-client is only meaningful on a client case file.
  const canAssign = scopeKind === "client-case" && Boolean(counselorEmail);
  const clientName = useMemo(() => {
    if (scopeKind !== "client-case") return scopeId;
    return (
      Object.values(getAllClients()).find((c) => c.caseId === scopeId)?.name ??
      scopeId
    );
  }, [scopeKind, scopeId]);
  const pending = useMemo(
    () =>
      scopeKind === "client-case" ? pendingAssignmentsForCase(scopeId) : [],
    [scopeKind, scopeId, bump],
  );
  const pendingToolIds = useMemo(
    () => new Set(pending.map((p) => p.toolId)),
    [pending],
  );

  function assign(toolId: string, toolTitle: string) {
    if (!counselorEmail) return;
    assignAssessment({
      toolId,
      toolTitle,
      caseId: scopeId,
      clientName,
      assignedByEmail: counselorEmail,
      assignedByName: counselorName ?? counselorEmail,
    });
    setBump((n) => n + 1);
  }

  const launchableTools = useMemo(() => {
    return ASSESSMENT_TOOLS.filter(
      (t) =>
        t.audiences.includes(audience) &&
        (!filterServiceId || t.serviceIds.includes(filterServiceId)),
    );
  }, [audience, filterServiceId]);

  return (
    <div className="space-y-5">
      <section>
        <header className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          <h2 className="text-lg font-semibold">
            Assessments on file ({existing.length})
          </h2>
          {canGenerateReport && (
            <button
              onClick={generateReport}
              className="grad-tealblue text-white text-xs font-semibold px-3 py-2 min-h-[44px] inline-flex items-center rounded-md"
              title="Compile all completed assessments into one printable report, filed in Documents"
            >
              📄 Generate assessment report →
            </button>
          )}
        </header>
        {existing.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-lg p-4 text-center text-ink/55 text-sm italic">
            No assessments completed inside this case yet.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {existing.map((a) => (
              <AssessmentRow
                key={a.id}
                assessment={a}
                counselorEmail={counselorEmail}
              />
            ))}
          </ul>
        )}
      </section>

      {canAssign && pending.length > 0 && (
        <section
          aria-label="Assessments assigned to the client"
          className="saas-card border-emerald-500/40"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-700 mb-2">
            📤 Assigned to {clientName} — awaiting completion ({pending.length})
          </h2>
          <ul role="list" className="space-y-1.5">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between gap-3 text-sm flex-wrap"
              >
                <span>
                  <strong>{p.toolTitle}</strong>
                  <span className="text-ink/55 text-xs">
                    {" "}
                    · assigned {new Date(p.assignedAt).toLocaleDateString()}
                  </span>
                </span>
                <button
                  onClick={() => {
                    cancelAssignment(p.id);
                    setBump((n) => n + 1);
                  }}
                  className="text-xs text-ink/55 hover:text-rose-400 underline"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink/55 italic mt-2">
            These appear in the client&apos;s portal under My Assessments →
            Assigned to you. Results land back on this tab for your review
            and approval.
          </p>
        </section>
      )}

      {showLauncher && (
        <section>
          <header className="mb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Launch an assessment{filterServiceId ? " for this service" : ""}
              </h2>
              <p className="text-xs text-ink/55">
                {launchableTools.length} tool{launchableTools.length === 1 ? "" : "s"} embedded for{" "}
                {filterServiceId ? "the selected service" : "this case type"}.
                {canAssign &&
                  " Run it live in session, or assign it to the client to complete from their portal."}
              </p>
            </div>
            <AddServiceAssessmentDropdown />
          </header>
          <ul role="list" className="grid sm:grid-cols-2 gap-2">
            {launchableTools.map((t) => {
              const runHref = launchRoute
                ? launchRoute(t.id)
                : `/case/${scopeId}/assessment/${t.id}`;
              if (!canAssign) {
                return (
                  <li key={t.id}>
                    <Link href={runHref} className="saas-card block hover:no-underline">
                      <h3 className="font-semibold text-sm">{t.title}</h3>
                      <p className="text-xs text-ink/65 mt-1">{t.description}</p>
                      <p className="text-[10px] uppercase tracking-wider text-emerald-700 mt-2">
                        {t.items.length} items
                      </p>
                    </Link>
                  </li>
                );
              }
              const isAssigned = pendingToolIds.has(t.id);
              return (
                <li key={t.id} className="saas-card">
                  <h3 className="font-semibold text-sm">{t.title}</h3>
                  <p className="text-xs text-ink/65 mt-1">{t.description}</p>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700 mt-2">
                    {t.items.length} items
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap items-center">
                    <Link
                      href={runHref}
                      className="text-xs grad-tealblue text-white font-semibold px-3 py-1.5 rounded-md"
                    >
                      Run now →
                    </Link>
                    {isAssigned ? (
                      <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                        📤 Assigned · awaiting client
                      </span>
                    ) : (
                      <button
                        onClick={() => assign(t.id, t.title)}
                        className="text-xs border border-emerald-500/60 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-100 font-semibold"
                        title={`Send this assessment to ${clientName}'s portal to complete on their own`}
                      >
                        📤 Assign to client
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function AssessmentRow({
  assessment,
  counselorEmail,
}: {
  assessment: CaseAssessment;
  counselorEmail?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(
    assessment.counselorEditedInterpretation ??
      assessment.aiDraftInterpretation ??
      "",
  );
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGuidance, setAiGuidance] = useState("");
  const [showGuidance, setShowGuidance] = useState(false);

  function saveEdit() {
    updateCaseAssessment(assessment.id, {
      counselorEditedInterpretation: text,
    });
    setEditing(false);
  }

  function approve() {
    if (!counselorEmail) return;
    updateCaseAssessment(assessment.id, {
      counselorEditedInterpretation: text,
      counselorApproved: true,
      counselorApprovedByEmail: counselorEmail,
      counselorApprovedAt: new Date().toISOString(),
    });
  }

  async function aiRefine() {
    setAiBusy(true);
    setAiError(null);
    try {
      const tool = getAssessmentTool(assessment.toolId);
      const enrichedResponses = assessment.responses.map((r) => {
        const item = tool?.items.find((i) => i.id === r.itemId);
        return {
          itemId: r.itemId,
          prompt: item?.prompt,
          value: r.value,
        };
      });
      const resp = await fetch("/api/refine-assessment-interpretation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolTitle: assessment.toolTitle,
          toolDescription: tool?.description,
          aiInterpretationTemplate: tool?.aiInterpretationTemplate,
          responses: enrichedResponses,
          currentDraft: text,
          guidance: aiGuidance.trim() || undefined,
        }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Request failed (${resp.status})`);
      }
      const j = (await resp.json()) as { refined: string };
      setText(j.refined);
      setEditing(true);
      setShowGuidance(false);
      setAiGuidance("");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Network error");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <li className="saas-card">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <h3 className="font-semibold">{assessment.toolTitle}</h3>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
            assessment.counselorApproved
              ? "bg-emerald-100 text-emerald-900"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {assessment.counselorApproved ? "Approved" : "Awaiting approval"}
        </span>
      </header>
      <p className="text-xs text-ink/55">
        Administered by {assessment.administeredByName} ·{" "}
        {new Date(assessment.administeredAt).toLocaleString()}
        {assessment.counselorApprovedAt && (
          <>
            {" "}
            · Approved {new Date(assessment.counselorApprovedAt).toLocaleString()}
          </>
        )}
      </p>

      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-ink/65 hover:text-emerald-700">
          {assessment.responses.length} responses recorded
        </summary>
        <ul className="mt-2 space-y-1 text-ink/75">
          {assessment.responses.map((r, i) => (
            <li key={i} className="border-b border-ink/10 py-1 last:border-0">
              <span className="text-ink/55">{r.itemId}:</span>{" "}
              <span>{String(r.value)}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-3">
        <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-1">
          Interpretation {assessment.counselorApproved ? "(approved)" : "(draft)"}
        </div>
        {editing ? (
          <textarea
            className="w-full text-sm bg-white border border-ink/15 rounded-md px-3 py-2 min-h-[140px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <pre className="text-sm whitespace-pre-wrap bg-ink/5 rounded p-3">
            {text}
          </pre>
        )}
        <div className="flex gap-2 mt-2 flex-wrap">
          {!assessment.counselorApproved && counselorEmail && (
            <>
              {editing ? (
                <button
                  onClick={saveEdit}
                  className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md font-semibold"
                >
                  Save edits
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs border border-ink/15 px-3 py-1.5 rounded-md hover:bg-ink/5"
                >
                  Edit interpretation
                </button>
              )}
              <button
                onClick={() => {
                  if (showGuidance) {
                    aiRefine();
                  } else {
                    setShowGuidance(true);
                  }
                }}
                disabled={aiBusy}
                className="text-xs border border-emerald-400 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-50 font-semibold disabled:opacity-50"
                title="Use Claude Opus 4.8 to expand the draft into a polished 2-4 paragraph clinical interpretation"
              >
                {aiBusy
                  ? "✨ Refining…"
                  : showGuidance
                    ? "✨ Run refinement"
                    : "✨ AI assist"}
              </button>
              <button
                onClick={approve}
                className="text-xs grad-tealblue text-white px-3 py-1.5 rounded-md font-semibold"
              >
                ✓ Approve &amp; lock
              </button>
            </>
          )}
        </div>

        {showGuidance && !assessment.counselorApproved && (
          <div className="mt-3 border border-emerald-200 bg-emerald-50/40 rounded-md p-3">
            <label className="block text-[10px] uppercase tracking-wider text-emerald-900 font-semibold mb-1">
              Optional guidance for the AI (steer the refinement)
            </label>
            <textarea
              value={aiGuidance}
              onChange={(e) => setAiGuidance(e.target.value)}
              rows={2}
              placeholder="e.g., emphasize accommodation recommendations, expand the leadership-buyin response, frame for the IPE meeting…"
              className="w-full bg-white border border-emerald-200 rounded-md px-3 py-2 text-sm"
            />
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xs text-ink/55 italic flex-1">
                The AI gets the tool description, every response, your
                current draft, and this guidance — then writes a 2-4
                paragraph clinical interpretation in your voice.
              </span>
              <button
                onClick={() => {
                  setShowGuidance(false);
                  setAiGuidance("");
                }}
                className="text-xs text-ink/55 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {aiError && (
          <div className="mt-2 text-xs border border-rose-300 bg-rose-50 text-rose-900 rounded-md p-2">
            {aiError}
          </div>
        )}
      </div>
    </li>
  );
}
