"use client";

import { useState } from "react";
import type { AssessmentItem, AssessmentTool } from "@/lib/assessment-tools";
import {
  appendCaseAssessment,
  draftInterpretation,
  newAssessmentId,
  type CaseAssessment,
  type CaseScopeKind,
} from "@/lib/case-assessments";

const LIKERT_5_OPTIONS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

const YESNO_OPTIONS = ["Yes", "No"];

interface Props {
  tool: AssessmentTool;
  scopeKind: CaseScopeKind;
  scopeId: string;
  administeredByEmail: string;
  administeredByName: string;
  serviceId?: string;
  onComplete?: (a: CaseAssessment) => void;
}

export function AssessmentRunner({
  tool,
  scopeKind,
  scopeId,
  administeredByEmail,
  administeredByName,
  serviceId,
  onComplete,
}: Props) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<CaseAssessment | null>(null);

  const allAnswered = tool.items.every((i) => responses[i.id] !== undefined);

  function submit() {
    if (!allAnswered) return;
    const responseRows = tool.items.map((i) => ({
      itemId: i.id,
      value: responses[i.id],
    }));
    const interpretation = draftInterpretation({
      toolTitle: tool.title,
      promptTemplate: tool.aiInterpretationTemplate,
      responses: tool.items.map((i) => ({
        prompt: i.prompt,
        value: responses[i.id],
      })),
    });
    const assessment: CaseAssessment = {
      id: newAssessmentId(),
      scopeKind,
      scopeId,
      toolId: tool.id,
      toolTitle: tool.title,
      serviceId,
      administeredByEmail,
      administeredByName,
      administeredAt: new Date().toISOString(),
      responses: responseRows,
      aiDraftInterpretation: interpretation,
      counselorEditedInterpretation: interpretation,
      counselorApproved: false,
    };
    appendCaseAssessment(assessment);
    setSubmitted(assessment);
    onComplete?.(assessment);
  }

  if (submitted) {
    return (
      <div className="saas-card space-y-3">
        <div className="text-emerald-700 font-semibold">
          ✓ Assessment submitted — locked to this case file.
        </div>
        <p className="text-sm text-ink/65">
          The AI-drafted interpretation is below. Edit it on the case
          file&apos;s Assessments tab, then approve.
        </p>
        <pre className="text-xs whitespace-pre-wrap bg-ink/5 rounded p-3">
          {submitted.aiDraftInterpretation}
        </pre>
      </div>
    );
  }

  return (
    <section className="saas-card space-y-4">
      <header>
        <h2 className="text-xl font-semibold">{tool.title}</h2>
        <p className="text-sm text-ink/65">{tool.description}</p>
      </header>

      <ol className="space-y-3" role="list">
        {tool.items.map((it, idx) => (
          <li key={it.id} className="border-b border-ink/10 pb-3 last:border-0">
            <ItemRow
              item={it}
              n={idx + 1}
              value={responses[it.id]}
              onChange={(v) =>
                setResponses((r) => ({ ...r, [it.id]: v }))
              }
            />
          </li>
        ))}
      </ol>

      <footer className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-ink/55">
          {Object.keys(responses).length} / {tool.items.length} answered
        </span>
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          Submit assessment →
        </button>
      </footer>
    </section>
  );
}

function ItemRow({
  item,
  n,
  value,
  onChange,
}: {
  item: AssessmentItem;
  n: number;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">
        <span className="text-emerald-700 mr-2">{n}.</span>
        {item.prompt}
      </legend>
      {item.kind === "likert5" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {LIKERT_5_OPTIONS.map((opt, i) => (
            <Choice
              key={opt}
              label={`${i + 1}. ${opt}`}
              selected={value === opt}
              onClick={() => onChange(opt)}
            />
          ))}
        </div>
      )}
      {item.kind === "yesno" && (
        <div className="flex gap-2">
          {YESNO_OPTIONS.map((opt) => (
            <Choice
              key={opt}
              label={opt}
              selected={value === opt}
              onClick={() => onChange(opt)}
            />
          ))}
        </div>
      )}
      {item.kind === "scale10" && (
        <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((opt) => (
            <Choice
              key={opt}
              label={opt}
              selected={value === opt}
              onClick={() => onChange(opt)}
            />
          ))}
        </div>
      )}
      {item.kind === "multiselect" && item.options && (
        <div className="flex flex-wrap gap-2">
          {item.options.map((opt) => (
            <Choice
              key={opt}
              label={opt}
              selected={(value ?? "").split(",").includes(opt)}
              onClick={() => {
                const cur = (value ?? "").split(",").filter(Boolean);
                const next = cur.includes(opt)
                  ? cur.filter((c) => c !== opt)
                  : [...cur, opt];
                onChange(next.join(","));
              }}
            />
          ))}
        </div>
      )}
      {item.kind === "text" && (
        <textarea
          className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[80px]"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type response…"
        />
      )}
    </fieldset>
  );
}

function Choice({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`text-xs px-3 py-1.5 rounded border ${
        selected
          ? "grad-tealblue text-white border-transparent"
          : "bg-white border-ink/15 hover:border-emerald-500"
      }`}
    >
      {label}
    </button>
  );
}
