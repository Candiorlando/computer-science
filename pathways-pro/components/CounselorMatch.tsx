"use client";

// Feature 1 — intake preferences + matching. The client selects
// communication-style / specialty / language / availability preferences;
// we rank the accepting counselor pool. A human confirms the assignment.

import { useEffect, useState } from "react";
import {
  COMM_STYLES,
  SPECIALTIES,
  LANGUAGES,
  TIME_WINDOWS,
  loadPreference,
  savePreference,
  topMatches,
  type MatchPreference,
  type ScoredMatch,
} from "@/lib/matching";

const EMPTY: MatchPreference = {
  preferredStyles: [],
  preferredSpecialties: [],
  languages: [],
  windows: [],
};

function Chips<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={[
                "min-h-[40px] px-3 rounded-full text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-accent",
                on
                  ? "bg-accent text-cream border-accent font-medium"
                  : "bg-white border-ink/20 hover:border-accent",
              ].join(" ")}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function CounselorMatch({
  clientEmail,
  onChoose,
}: {
  clientEmail: string;
  onChoose?: (counselorEmail: string) => void;
}) {
  const [pref, setPref] = useState<MatchPreference>(EMPTY);
  const [results, setResults] = useState<ScoredMatch[] | null>(null);

  useEffect(() => {
    const saved = loadPreference(clientEmail);
    if (saved) {
      setPref(saved);
      setResults(topMatches(saved));
    }
  }, [clientEmail]);

  function toggle<K extends keyof MatchPreference>(key: K, value: MatchPreference[K][number]) {
    setPref((p) => {
      const arr = p[key] as string[];
      const nextArr = arr.includes(value as string)
        ? arr.filter((x) => x !== value)
        : [...arr, value as string];
      return { ...p, [key]: nextArr } as MatchPreference;
    });
  }

  function findMatches() {
    savePreference(clientEmail, pref);
    setResults(topMatches(pref));
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <Chips
          label="Communication style"
          options={COMM_STYLES}
          selected={pref.preferredStyles}
          onToggle={(v) => toggle("preferredStyles", v)}
        />
        <Chips
          label="Focus areas"
          options={SPECIALTIES}
          selected={pref.preferredSpecialties}
          onToggle={(v) => toggle("preferredSpecialties", v)}
        />
        <Chips
          label="Language"
          options={LANGUAGES}
          selected={pref.languages}
          onToggle={(v) => toggle("languages", v)}
        />
        <Chips
          label="When you're free"
          options={TIME_WINDOWS}
          selected={pref.windows}
          onToggle={(v) => toggle("windows", v)}
        />
      </div>

      <button
        onClick={findMatches}
        className="min-h-[44px] px-5 rounded-md grad-tealblue text-white font-semibold"
      >
        Find my matches
      </button>

      {results && (
        <section aria-label="Matched counselors" aria-live="polite" className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/60">
            Your top matches
          </h3>
          {results.map((m, i) => (
            <div key={m.profile.email} className="saas-card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {i === 0 && <span aria-hidden>⭐ </span>}
                  {m.profile.name}{" "}
                  <span className="text-xs font-normal text-ink/55">{m.profile.credentials}</span>
                </p>
                <p className="text-xs text-ink/65">
                  {m.reasons.length ? m.reasons.join(" · ") : "General vocational rehabilitation"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold text-accent"
                  aria-label={`${m.score} percent match`}
                >
                  {m.score}% match
                </span>
                {onChoose && (
                  <button
                    onClick={() => onChoose(m.profile.email)}
                    className="min-h-[44px] px-4 rounded-md border border-accent text-accent hover:bg-accent hover:text-cream text-sm font-semibold transition-colors"
                  >
                    Book with {m.profile.name.split(" ")[0]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
