"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import { Disclaimer } from "@/components/Disclaimer";
import {
  EXPERIENCE_TYPE_ICONS,
  EXPERIENCE_TYPE_LABELS,
  loadExperiences,
  loadTSA,
  saveExperiences,
  saveTSA,
  type Experience,
  type ExperienceType,
  type TSAResult,
} from "@/lib/tsa-storage";
import { patchClientReport } from "@/lib/client-report";
import type { ClientUser } from "@/lib/users";

export default function TSAPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [result, setResult] = useState<TSAResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setExperiences(loadExperiences());
    setResult(loadTSA());
  }, [router]);

  function update(next: Experience[]) {
    setExperiences(next);
    saveExperiences(next);
  }

  function addExperience(type: ExperienceType) {
    const exp: Experience = {
      id: Math.random().toString(36).slice(2),
      type,
      title: "",
      description: "",
      duration: "",
    };
    update([...experiences, exp]);
  }

  async function runAnalysis() {
    const filled = experiences.filter(
      (e) => e.title.trim() && e.description.trim(),
    );
    if (filled.length === 0) {
      setError("Add at least one experience with a title and description.");
      return;
    }
    setError(null);
    setRunning(true);
    try {
      const resp = await fetch("/api/transferable-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences: filled }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Analysis failed.");
        setRunning(false);
        return;
      }
      const data = await resp.json();
      const r: TSAResult = { ...data, generatedAt: new Date().toISOString() };
      saveTSA(r);
      setResult(r);
      const s = loadSession();
      if (s && s.role === "client") {
        const c = s as ClientUser;
        patchClientReport(c.caseId, c.name, {
          clientDob: c.dob,
          counselorName: c.counselorName,
          tsa: r,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setRunning(false);
    }
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Transferable Skills Analysis
        </p>
        <h1 className="text-4xl mb-2">
          You&apos;ve done more than you think.
        </h1>
        <p className="text-ink/70 prose-narrow">
          Tell us about the work, volunteering, hobbies, schooling, or
          caregiving you&apos;ve done. We&apos;ll find the skills inside that
          experience that translate into a paid job — using Claude Opus 4.8
          and the O*NET skill taxonomy.
        </p>
      </header>

      <Disclaimer kind="general" />

      <section className="border border-ink/15 rounded-lg p-5 bg-cream">
        <h2 className="text-xl mb-3">Your experiences</h2>
        <p className="text-sm text-ink/70 mb-4">
          Add anything — paid jobs, volunteer roles, long-term hobbies,
          classes you took, caring for family. The more detail, the better
          the analysis.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
          {(Object.keys(EXPERIENCE_TYPE_LABELS) as ExperienceType[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => addExperience(t)}
                className="border border-ink/15 rounded p-3 text-xs hover:border-accent hover:bg-accent/5 transition text-left"
              >
                <div className="text-lg mb-1">{EXPERIENCE_TYPE_ICONS[t]}</div>
                <div className="font-semibold">{EXPERIENCE_TYPE_LABELS[t]}</div>
                <div className="text-accent mt-1">+ Add</div>
              </button>
            ),
          )}
        </div>

        <div className="space-y-3">
          {experiences.map((exp, idx) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              idx={idx + 1}
              onChange={(next) => {
                const arr = [...experiences];
                arr[idx] = next;
                update(arr);
              }}
              onRemove={() => update(experiences.filter((e) => e.id !== exp.id))}
            />
          ))}
        </div>

        {experiences.length === 0 && (
          <p className="text-sm text-ink/50 text-center py-6 italic">
            No experiences added yet. Pick a type above to start.
          </p>
        )}

        <div className="mt-5 pt-5 border-t border-ink/10 flex items-center gap-3 flex-wrap">
          <button
            onClick={runAnalysis}
            disabled={running || experiences.length === 0}
            className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
          >
            {running
              ? "Analyzing with Claude Opus 4.8…"
              : result
                ? "Re-analyze ↻"
                : "Find my transferable skills ✨"}
          </button>
          {result && (
            <Link
              href="/resume"
              className="text-sm text-accent hover:underline"
            >
              → Build a resume from these skills
            </Link>
          )}
        </div>
        {error && (
          <div className="mt-3 text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded">
            {error}
          </div>
        )}
      </section>

      {result && <TSAResults result={result} />}
    </div>
  );
}

function ExperienceCard({
  experience,
  idx,
  onChange,
  onRemove,
}: {
  experience: Experience;
  idx: number;
  onChange: (next: Experience) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-ink/10 rounded p-4 bg-white/60">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{EXPERIENCE_TYPE_ICONS[experience.type]}</span>
          <span className="text-xs uppercase tracking-wider text-ink/50">
            #{idx} · {EXPERIENCE_TYPE_LABELS[experience.type]}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-ink/40 hover:text-accent"
        >
          ✕ Remove
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-2 text-sm">
        <input
          type="text"
          value={experience.title}
          onChange={(e) => onChange({ ...experience, title: e.target.value })}
          placeholder={titlePlaceholder(experience.type)}
          className="bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          value={experience.duration || ""}
          onChange={(e) =>
            onChange({ ...experience, duration: e.target.value })
          }
          placeholder="How long? e.g. 3 years, summers 2022–2024"
          className="bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>
      <textarea
        value={experience.description}
        onChange={(e) =>
          onChange({ ...experience, description: e.target.value })
        }
        placeholder={descPlaceholder(experience.type)}
        rows={3}
        className="w-full bg-white border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />
    </div>
  );
}

function titlePlaceholder(t: ExperienceType): string {
  switch (t) {
    case "work":
      return "Job title, e.g. 'Cashier at Walgreens'";
    case "volunteer":
      return "What you did, e.g. 'Sunday school teacher'";
    case "hobby":
      return "Your hobby, e.g. 'Building model trains'";
    case "education":
      return "Course or program, e.g. 'CNA certification'";
    case "caregiving":
      return "Who you cared for, e.g. 'Mother with dementia'";
  }
}

function descPlaceholder(t: ExperienceType): string {
  switch (t) {
    case "work":
      return "What did you do day-to-day? Be specific — handled cash, trained new hires, opened/closed the store, etc.";
    case "volunteer":
      return "What was involved? Organize events, coordinate schedules, manage donations, work directly with people?";
    case "hobby":
      return "Walk us through it. What skills do you use? Have you taught others, sold work, joined competitions?";
    case "education":
      return "What did you learn? What projects, papers, or hands-on work was involved?";
    case "caregiving":
      return "What did this look like day to day? Scheduling appointments, managing meds, running a household, coordinating with services?";
  }
}

function TSAResults({ result }: { result: TSAResult }) {
  const grouped = result.coreSkills.reduce<Record<string, typeof result.coreSkills>>(
    (acc, s) => {
      (acc[s.category] = acc[s.category] || []).push(s);
      return acc;
    },
    {},
  );

  return (
    <section className="space-y-5">
      <div className="border border-accent/30 bg-accent/5 rounded-lg p-5">
        <h2 className="text-xl mb-2">What makes you employable</h2>
        <p className="text-ink/80">{result.encouragement}</p>
        <p className="text-xs text-ink/50 mt-2">
          Analyzed {new Date(result.generatedAt).toLocaleString()} · Claude Opus 4.8
        </p>
      </div>

      <h2 className="text-2xl">Your transferable skills</h2>
      {Object.entries(grouped).map(([category, skills]) => (
        <div key={category}>
          <h3 className="text-sm uppercase tracking-wider text-ink/50 mb-2">
            {category}
          </h3>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {skills.map((s, i) => (
              <article
                key={i}
                className="border border-ink/10 rounded-lg p-4 bg-cream"
              >
                <div className="font-semibold text-sm">{s.skill}</div>
                <div className="text-xs text-ink/60 mt-1">
                  <strong>From:</strong> {s.evidence}
                </div>
                <div className="text-xs text-accent mt-2 italic border-t border-ink/10 pt-2">
                  Resume bullet: {s.resumeBullet}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-2xl mb-3">Occupations to consider</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {result.occupationsToConsider.map((o, i) => (
            <article
              key={i}
              className="border border-ink/15 rounded-lg p-4 bg-cream"
            >
              <h3 className="text-lg font-semibold mb-2">{o.title}</h3>
              <p className="text-sm text-ink/70 mb-2">{o.whyItFits}</p>
              <p className="text-xs text-accent">
                <strong>First step:</strong> {o.startingPoint}
              </p>
            </article>
          ))}
        </div>
      </div>

      {result.gapsToAddress.length > 0 && (
        <div>
          <h2 className="text-2xl mb-3">Skills to add next</h2>
          <ul className="space-y-2">
            {result.gapsToAddress.map((g, i) => (
              <li
                key={i}
                className="border border-ink/10 rounded p-3 bg-cream text-sm flex gap-2"
              >
                <span className="text-accent">→</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-ink/10 pt-5 flex flex-wrap gap-3">
        <Link
          href="/resume"
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold"
        >
          Build a resume from this ↗
        </Link>
        <Link
          href="/coach"
          className="px-5 py-2.5 border border-ink/20 rounded font-semibold"
        >
          Talk through it with the coach
        </Link>
      </div>
    </section>
  );
}
