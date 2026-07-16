"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  bigFiveItems, riasecItems,
  scoreBigFive, scoreRiasec, hollandCode,
} from "@/lib/assessments";
import { loadProfile, patchProfile } from "@/lib/storage";
import { Disclaimer } from "@/components/Disclaimer";

const likert = [
  { value: 1, label: "Very inaccurate" },
  { value: 2, label: "Inaccurate" },
  { value: 3, label: "Neither" },
  { value: 4, label: "Accurate" },
  { value: 5, label: "Very accurate" },
];

const riasecLikert = [
  { value: 1, label: "Strongly dislike" },
  { value: 2, label: "Dislike" },
  { value: 3, label: "Unsure" },
  { value: 4, label: "Like" },
  { value: 5, label: "Strongly like" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "bigfive" | "riasec" | "done">("intro");
  const [bigFiveAnswers, setBigFive] = useState<Record<string, number>>({});
  const [riasecAnswers, setRiasec] = useState<Record<string, number>>({});

  useEffect(() => {
    // If they've already done it, skip ahead and offer to retake.
    const p = loadProfile();
    if (p.bigFive && p.riasec) setPhase("done");
  }, []);

  function finish() {
    const bf = scoreBigFive(bigFiveAnswers);
    const ri = scoreRiasec(riasecAnswers);
    const code = hollandCode(ri);
    patchProfile({
      bigFive: bf,
      riasec: ri,
      hollandCode: code,
      completedAt: new Date().toISOString(),
    });
    router.push("/results");
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6 prose-narrow">
        <h1 className="text-4xl">Two short assessments</h1>
        <p>
          You'll answer about 44 quick questions across two well-validated instruments:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Mini-IPIP Big Five</strong> (20 items, ~3 min) — measures Openness,
            Conscientiousness, Extraversion, Agreeableness, and Neuroticism.
            Public-domain alternative to the proprietary NEO-FFI.
            <a href="https://ipip.ori.org/MiniIPIP.htm" target="_blank" rel="noreferrer" className="text-accent ml-1">[source]</a>
          </li>
          <li>
            <strong>Holland RIASEC interests</strong> (24 items, ~3 min) — measures fit
            with six work interest areas (Realistic, Investigative, Artistic, Social,
            Enterprising, Conventional). Used by O*NET's Interest Profiler.
            <a href="https://www.onetonline.org/explore/interests/" target="_blank" rel="noreferrer" className="text-accent ml-1">[source]</a>
          </li>
        </ul>
        <Disclaimer />
        <p className="text-sm text-ink/60">
          These are research-backed instruments. They are <em>not</em> the
          (trademarked) MBTI, DISC, Enneagram, or StrengthsFinder — those have
          weaker scientific support and are not used by the US Department of Labor.
        </p>
        <button className="btn-primary" onClick={() => setPhase("bigfive")}>
          Begin Big Five →
        </button>
        <Styles />
      </div>
    );
  }

  if (phase === "bigfive") {
    const allAnswered = bigFiveItems.every((it) => typeof bigFiveAnswers[it.id] === "number");
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">Big Five — Mini-IPIP</h1>
        <p className="text-ink/70 prose-narrow">
          Rate how accurately each statement describes you, as you generally are now,
          compared with other people you know of the same sex and roughly your age.
        </p>
        <div className="space-y-3">
          {bigFiveItems.map((it, idx) => (
            <QuestionRow
              key={it.id}
              n={idx + 1}
              text={`I ${it.text.toLowerCase()}`}
              choices={likert}
              value={bigFiveAnswers[it.id]}
              onChange={(v) => setBigFive((s) => ({ ...s, [it.id]: v }))}
            />
          ))}
        </div>
        <div className="flex justify-between pt-4">
          <button className="btn-secondary" onClick={() => setPhase("intro")}>← Back</button>
          <button className="btn-primary" disabled={!allAnswered} onClick={() => setPhase("riasec")}>
            Continue to interests →
          </button>
        </div>
        <Styles />
      </div>
    );
  }

  if (phase === "riasec") {
    const allAnswered = riasecItems.every((it) => typeof riasecAnswers[it.id] === "number");
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">Interests — Holland RIASEC</h1>
        <p className="text-ink/70 prose-narrow">
          For each work activity, how interested are you in <em>doing</em> it? Ignore
          pay, prestige, or whether you've done it before — just whether the activity
          itself appeals to you.
        </p>
        <div className="space-y-3">
          {riasecItems.map((it, idx) => (
            <QuestionRow
              key={it.id}
              n={idx + 1}
              text={it.text}
              choices={riasecLikert}
              value={riasecAnswers[it.id]}
              onChange={(v) => setRiasec((s) => ({ ...s, [it.id]: v }))}
            />
          ))}
        </div>
        <div className="flex justify-between pt-4">
          <button className="btn-secondary" onClick={() => setPhase("bigfive")}>← Back</button>
          <button className="btn-primary" disabled={!allAnswered} onClick={finish}>
            See my matches →
          </button>
        </div>
        <Styles />
      </div>
    );
  }

  // phase === "done"
  return (
    <div className="space-y-6 prose-narrow">
      <h1 className="text-3xl">Already completed</h1>
      <p>You've taken the assessments. You can view your matches or retake.</p>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={() => router.push("/results")}>View matches</button>
        <button className="btn-secondary" onClick={() => setPhase("bigfive")}>Retake</button>
      </div>
      <Styles />
    </div>
  );
}

function QuestionRow({
  n, text, choices, value, onChange,
}: {
  n: number; text: string;
  choices: { value: number; label: string }[];
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="border border-ink/10 rounded-lg p-4 bg-white/40">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-accent text-sm w-6 shrink-0">{n}.</span>
        <span className="text-ink">{text}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pl-9">
        {choices.map((c) => (
          <label
            key={c.value}
            className={`text-sm border rounded px-3 py-1.5 cursor-pointer text-center ${
              value === c.value
                ? "bg-accent text-white border-accent"
                : "border-ink/20 hover:border-accent"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              checked={value === c.value}
              onChange={() => onChange(c.value)}
            />
            {c.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style jsx>{`
      :global(.btn-primary) {
        background: #b95c3c;
        color: white;
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
      }
      :global(.btn-primary:disabled) {
        opacity: 0.45;
        cursor: not-allowed;
      }
      :global(.btn-secondary) {
        background: transparent;
        border: 1px solid rgba(31, 29, 26, 0.3);
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
      }
    `}</style>
  );
}
