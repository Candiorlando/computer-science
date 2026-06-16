"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import { loadProfile } from "@/lib/storage";
import { loadExperiences, loadTSA } from "@/lib/tsa-storage";
import { rankOccupations } from "@/lib/onet-data";
import { Disclaimer } from "@/components/Disclaimer";

interface Resume {
  header: {
    name: string;
    location?: string;
    email?: string;
    phone?: string;
  };
  summary: string;
  skills: string[];
  experience: {
    title: string;
    organization?: string;
    location?: string;
    dates?: string;
    bullets: string[];
  }[];
  education?: {
    credential: string;
    institution?: string;
    dates?: string;
    details?: string;
  }[];
  additionalQualifications?: string[];
}

interface SavedResume {
  id: string;
  targetJob: string;
  targetSocCode?: string;
  resume: Resume;
  createdAt: string;
  updatedAt: string;
  label?: string; // optional user-given nickname
}

// Legacy single-resume key — auto-migrated to the new list on first load.
const RESUME_KEY = "pathways-pro:resume-v1";
const RESUME_LIST_KEY = "pathways-pro:resume-list-v1";

function loadResumeList(): SavedResume[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESUME_LIST_KEY);
    return raw ? (JSON.parse(raw) as SavedResume[]) : [];
  } catch {
    return [];
  }
}

function saveResumeList(list: SavedResume[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESUME_LIST_KEY, JSON.stringify(list));
}

function migrateLegacyResume(): SavedResume[] {
  if (typeof window === "undefined") return [];
  const list = loadResumeList();
  if (list.length > 0) return list;
  try {
    const raw = window.localStorage.getItem(RESUME_KEY);
    if (!raw) return [];
    const r = JSON.parse(raw) as Resume;
    const migrated: SavedResume = {
      id: "legacy-" + Date.now(),
      targetJob: r.summary.slice(0, 50) || "Previous resume",
      resume: r,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      label: "Earlier draft",
    };
    saveResumeList([migrated]);
    return [migrated];
  } catch {
    return [];
  }
}

function newResumeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function ResumePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [targetJob, setTargetJob] = useState("");
  const [targetSocCode, setTargetSocCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactCity, setContactCity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setFullName(s.name);
    if (s.role === "client") {
      setContactEmail(s.email);
    }
    const profile = loadProfile();
    if (profile.intake?.location) setContactCity(profile.intake.location);
    const list = migrateLegacyResume();
    setResumes(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const active = useMemo(
    () => resumes.find((r) => r.id === activeId) ?? null,
    [resumes, activeId],
  );
  const resume = active?.resume ?? null;

  const profile = useMemo(
    () => (authorized ? loadProfile() : { intake: undefined, hollandCode: undefined, riasec: undefined }),
    [authorized],
  );

  // Top matches (if assessment complete) — surface as quick-pick target jobs
  const topMatches = useMemo(() => {
    if (!profile.riasec) return [];
    return rankOccupations(profile.riasec).slice(0, 6);
  }, [profile.riasec]);

  async function generate() {
    if (!targetJob.trim() || !fullName.trim()) {
      setError("Target job and your name are required.");
      return;
    }
    setError(null);
    setGenerating(true);
    const tsa = loadTSA();
    const exps = loadExperiences();
    try {
      const resp = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetJob,
          targetSocCode,
          fullName,
          contactCity,
          contactEmail,
          contactPhone,
          educationLevel: profile.intake?.educationLevel,
          workHistory: profile.intake?.workHistory,
          goals: profile.intake?.goals,
          hollandCode: profile.hollandCode,
          tsaSkills: tsa?.coreSkills.map((s) => s.skill),
          tsaResumeBullets: tsa?.coreSkills.map((s) => s.resumeBullet),
          experiences: exps,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as Resume;
      const saved: SavedResume = {
        id: newResumeId(),
        targetJob,
        targetSocCode: targetSocCode || undefined,
        resume: data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const nextList = [saved, ...resumes];
      setResumes(nextList);
      setActiveId(saved.id);
      saveResumeList(nextList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          AI Resume Builder
        </p>
        <h1 className="text-4xl mb-2">Build a resume for one specific job</h1>
        <p className="text-ink/70 prose-narrow">
          Pick the job you&apos;re going after. We&apos;ll write a one-page
          resume tailored to it using your intake info, assessment, and any
          transferable skills already analyzed.
        </p>
      </header>

      <div className="print:hidden">
        <Disclaimer kind="general" />
      </div>

      {resumes.length > 0 && (
        <section className="border border-accent/30 bg-accent/5 rounded-lg p-5 print:hidden">
          <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
            <h2 className="text-xl">
              Past resumes ({resumes.length})
            </h2>
            <button
              onClick={() => {
                setActiveId(null);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="text-sm text-accent hover:underline"
            >
              + Generate a new one
            </button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {resumes.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`text-left border rounded-lg p-3 transition ${
                  activeId === r.id
                    ? "border-accent bg-cream shadow-sm"
                    : "border-ink/15 bg-cream hover:border-accent"
                }`}
              >
                <div className="font-semibold text-sm">{r.targetJob}</div>
                {r.targetSocCode && (
                  <div className="text-xs text-ink/50">
                    O*NET {r.targetSocCode}
                  </div>
                )}
                <div className="text-xs text-ink/60 mt-1">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  {activeId === r.id && (
                    <span className="text-accent font-semibold">
                      ✓ Showing now
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        !confirm(
                          `Delete the resume for "${r.targetJob}"? This can't be undone.`,
                        )
                      )
                        return;
                      const nextList = resumes.filter((x) => x.id !== r.id);
                      setResumes(nextList);
                      saveResumeList(nextList);
                      if (activeId === r.id) {
                        setActiveId(nextList[0]?.id ?? null);
                      }
                    }}
                    className="ml-auto text-ink/40 hover:text-accent"
                  >
                    Delete
                  </button>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="border border-ink/15 rounded-lg p-5 bg-cream print:hidden">
        <h2 className="text-xl mb-3">1. Pick a target job</h2>
        {topMatches.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-ink/50 mb-2">
              Pick from your top matches
            </p>
            <div className="flex flex-wrap gap-2">
              {topMatches.map((m) => (
                <button
                  key={m.occ.socCode}
                  onClick={() => {
                    setTargetJob(m.occ.title);
                    setTargetSocCode(m.occ.socCode);
                  }}
                  className={`text-xs border rounded-full px-3 py-1.5 ${
                    targetJob === m.occ.title
                      ? "bg-accent text-cream border-accent"
                      : "border-ink/20 hover:border-accent"
                  }`}
                >
                  {m.occ.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <input
            type="text"
            value={targetJob}
            onChange={(e) => {
              setTargetJob(e.target.value);
              setTargetSocCode("");
            }}
            placeholder="Job title (e.g. Medical Assistant)"
            className="bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            value={targetSocCode}
            onChange={(e) => setTargetSocCode(e.target.value)}
            placeholder="O*NET code (optional)"
            className="bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>
      </section>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream print:hidden">
        <h2 className="text-xl mb-3">2. Confirm your contact info</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Input label="Full name *" value={fullName} onChange={setFullName} />
          <Input label="City, State" value={contactCity} onChange={setContactCity} />
          <Input
            label="Email"
            value={contactEmail}
            onChange={setContactEmail}
            type="email"
          />
          <Input
            label="Phone"
            value={contactPhone}
            onChange={setContactPhone}
            type="tel"
          />
        </div>
      </section>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream print:hidden">
        <h2 className="text-xl mb-3">3. Sources we&apos;ll pull from</h2>
        <SourceRow
          label="Intake form"
          ok={!!profile.intake?.workHistory || !!profile.intake?.educationLevel}
          link="/intake"
          linkLabel="Fill out intake"
        />
        <SourceRow
          label="Personality + interest assessment"
          ok={!!profile.hollandCode}
          link="/assessment"
          linkLabel="Take the assessment"
        />
        <SourceRow
          label="Transferable skills analysis"
          ok={!!loadTSA()}
          link="/transferable-skills"
          linkLabel="Run TSA first"
        />
      </section>

      <div className="print:hidden">
        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
        >
          {generating
            ? "Drafting your resume with Claude Opus 4.8…"
            : resumes.length > 0
              ? "Generate another resume ✨"
              : "Generate one-page resume ✨"}
        </button>
        {resumes.length > 0 && !generating && (
          <p className="text-xs text-ink/60 mt-2">
            Each generation is saved to your history above — you can switch
            back to any past resume to print or use it again.
          </p>
        )}
        {error && (
          <div className="mt-3 text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {resume && <ResumePreview resume={resume} />}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
      />
    </label>
  );
}

function SourceRow({
  label,
  ok,
  link,
  linkLabel,
}: {
  label: string;
  ok: boolean;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ink/10 last:border-b-0 text-sm">
      <div className="flex items-center gap-2">
        <span className={ok ? "text-green-700" : "text-ink/40"}>
          {ok ? "✓" : "○"}
        </span>
        <span>{label}</span>
      </div>
      {!ok && (
        <Link href={link} className="text-xs text-accent hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

function ResumePreview({ resume }: { resume: Resume }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4 print:hidden">
        <h2 className="text-2xl">Your resume — preview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="text-sm border border-ink/20 px-4 py-2 rounded hover:bg-ink/5"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>

      <article className="resume-page bg-white shadow-sm border border-ink/15 rounded-sm">
        <header className="resume-header">
          <h1>{resume.header.name}</h1>
          <p>
            {[
              resume.header.location,
              resume.header.email,
              resume.header.phone,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </header>

        <section>
          <h2>Professional Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section>
          <h2>Skills</h2>
          <ul className="resume-skill-grid">
            {resume.skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="resume-exp">
              <div className="resume-exp-head">
                <strong>{exp.title}</strong>
                {exp.organization && <span>, {exp.organization}</span>}
                {exp.location && <span> · {exp.location}</span>}
                {exp.dates && <span className="resume-dates"> — {exp.dates}</span>}
              </div>
              <ul>
                {exp.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {resume.education && resume.education.length > 0 && (
          <section>
            <h2>Education &amp; Training</h2>
            {resume.education.map((e, i) => (
              <div key={i} className="resume-edu">
                <strong>{e.credential}</strong>
                {e.institution && <span> · {e.institution}</span>}
                {e.dates && <span className="resume-dates"> — {e.dates}</span>}
                {e.details && <p>{e.details}</p>}
              </div>
            ))}
          </section>
        )}

        {resume.additionalQualifications &&
          resume.additionalQualifications.length > 0 && (
            <section>
              <h2>Additional Qualifications</h2>
              <ul>
                {resume.additionalQualifications.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}
      </article>

      <style jsx global>{`
        .resume-page {
          font-family: Georgia, "Times New Roman", Times, serif;
          color: #1a1a1a;
          background: #ffffff;
          padding: 0.6in 0.7in;
          max-width: 8.5in;
          margin: 0 auto;
          font-size: 11pt;
          line-height: 1.4;
        }
        .resume-page h1 {
          font-size: 22pt;
          margin: 0 0 4px;
          letter-spacing: 0.02em;
        }
        .resume-page .resume-header {
          text-align: center;
          border-bottom: 1.5pt solid #1a1a1a;
          padding-bottom: 8px;
          margin-bottom: 14px;
        }
        .resume-page .resume-header p {
          margin: 0;
          font-size: 10pt;
          color: #444;
        }
        .resume-page h2 {
          font-size: 12pt;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 0.5pt solid #999;
          padding-bottom: 2px;
          margin: 14px 0 6px;
        }
        .resume-page section p {
          margin: 0 0 6px;
        }
        .resume-page ul {
          margin: 4px 0 0;
          padding-left: 18px;
        }
        .resume-page li {
          margin-bottom: 3px;
        }
        .resume-page .resume-skill-grid {
          columns: 2;
          padding-left: 18px;
        }
        .resume-page .resume-exp {
          margin-bottom: 10px;
        }
        .resume-page .resume-exp-head {
          display: block;
          margin-bottom: 2px;
        }
        .resume-page .resume-dates {
          color: #555;
          font-style: italic;
        }
        .resume-page .resume-edu {
          margin-bottom: 6px;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-page,
          .resume-page * {
            visibility: visible;
          }
          .resume-page {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </>
  );
}
