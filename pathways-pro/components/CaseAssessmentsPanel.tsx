"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  launchRoute,
  showLauncher = true,
}: Props) {
  const existing = useMemo(
    () => assessmentsForScope(scopeKind, scopeId),
    [scopeKind, scopeId],
  );

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
        <header className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">
            Assessments on file ({existing.length})
          </h2>
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
              </p>
            </div>
            <AddServiceAssessmentDropdown />
          </header>
          <ul role="list" className="grid sm:grid-cols-2 gap-2">
            {launchableTools.map((t) => (
              <li key={t.id}>
                <Link
                  href={launchRoute ? launchRoute(t.id) : `/case/${scopeId}/assessment/${t.id}`}
                  className="saas-card block hover:no-underline"
                >
                  <h3 className="font-semibold text-sm">{t.title}</h3>
                  <p className="text-xs text-ink/65 mt-1">{t.description}</p>
                  <p className="text-[10px] uppercase tracking-wider text-cyan-700 mt-2">
                    {t.items.length} items
                  </p>
                </Link>
              </li>
            ))}
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
        <summary className="cursor-pointer text-ink/65 hover:text-cyan-700">
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
        <div className="text-xs uppercase tracking-wider text-cyan-700 font-semibold mb-1">
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
                  className="text-xs bg-cyan-600 text-white px-3 py-1.5 rounded-md font-semibold"
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
                className="text-xs border border-purple-400 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-50 font-semibold disabled:opacity-50"
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
          <div className="mt-3 border border-purple-200 bg-purple-50/40 rounded-md p-3">
            <label className="block text-[10px] uppercase tracking-wider text-purple-900 font-semibold mb-1">
              Optional guidance for the AI (steer the refinement)
            </label>
            <textarea
              value={aiGuidance}
              onChange={(e) => setAiGuidance(e.target.value)}
              rows={2}
              placeholder="e.g., emphasize accommodation recommendations, expand the leadership-buyin response, frame for the IPE meeting…"
              className="w-full bg-white border border-purple-200 rounded-md px-3 py-2 text-sm"
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
