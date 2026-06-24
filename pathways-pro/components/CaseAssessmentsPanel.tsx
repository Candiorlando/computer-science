"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ASSESSMENT_TOOLS,
  type Audience,
} from "@/lib/assessment-tools";
import {
  assessmentsForScope,
  updateCaseAssessment,
  type CaseAssessment,
  type CaseScopeKind,
} from "@/lib/case-assessments";

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
}

export function CaseAssessmentsPanel({
  scopeKind,
  scopeId,
  audience,
  filterServiceId,
  counselorEmail,
  launchRoute,
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

      <section>
        <header className="mb-3">
          <h2 className="text-lg font-semibold">
            Launch an assessment{filterServiceId ? " for this service" : ""}
          </h2>
          <p className="text-xs text-ink/55">
            {launchableTools.length} tool{launchableTools.length === 1 ? "" : "s"} embedded for{" "}
            {filterServiceId ? "the selected service" : "this case type"}.
          </p>
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
                onClick={approve}
                className="text-xs grad-tealblue text-white px-3 py-1.5 rounded-md font-semibold"
              >
                ✓ Approve &amp; lock
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
