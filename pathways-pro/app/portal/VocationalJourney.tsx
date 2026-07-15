"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ClientUser } from "@/lib/users";
import { loadProfile, patchProfile, type UserProfile } from "@/lib/storage";
import { loadTSA, type TSAResult } from "@/lib/tsa-storage";
import { buildProgress } from "@/lib/positive-psychology";

/* ── localStorage keys ── */
const JOURNEY_KEY = "pathways-pro:vocational-journey-v1";
const RESUME_KEY = "pathways-pro:resume-v1";

/* ── Journey profile (persisted alongside the main UserProfile) ── */
export interface JourneyProfile {
  employmentStatus?: "seeking" | "employed" | "training" | "higher-ed" | "not-working";
  currentEmployer?: string;
  currentRole?: string;
  educationCredential?: string;
  educationInstitution?: string;
  educationStatus?: "completed" | "in-progress";
  disabilityContext?: string;
  populationGroup?: "youth-transition" | "acquired-disability" | "cognitive-adhd-autism" | "general";
  topGoals?: string[];
  savedAt?: string;
}

function loadJourney(): JourneyProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(JOURNEY_KEY);
    return raw ? (JSON.parse(raw) as JourneyProfile) : {};
  } catch {
    return {};
  }
}

function saveJourney(j: JourneyProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(JOURNEY_KEY, JSON.stringify({ ...j, savedAt: new Date().toISOString() }));
}

function resumeCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(RESUME_KEY);
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

function goalCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("pp_goals");
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

/* ── Competitive Integrated Employment infographic data ── */
const CIE_PILLARS = [
  {
    title: "Competitive wages",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    desc: "Earnings at or above minimum wage, at the same rate as workers without disabilities performing the same work.",
    color: "emerald",
  },
  {
    title: "Integrated setting",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    desc: "Working alongside people without disabilities in a typical community workplace — not a segregated or sheltered setting.",
    color: "blue",
  },
  {
    title: "Full benefits & opportunities",
    icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
    desc: "Access to the same promotions, benefits, and career advancement opportunities as co-workers without disabilities.",
    color: "purple",
  },
  {
    title: "Individual choice",
    icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",
    desc: "The job matches the individual's strengths, interests, and informed choice — aligned with their IPE employment goal.",
    color: "amber",
  },
];

const CIE_COLOR: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-500/30" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", ring: "ring-blue-500/30" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", ring: "ring-purple-500/30" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-500/30" },
};

/* ── Status labels ── */
const STATUS_LABELS: Record<string, string> = {
  seeking: "Seeking employment",
  employed: "Currently employed",
  training: "In training / certificate program",
  "higher-ed": "In higher education",
  "not-working": "Not currently working",
};

/* ════════════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════════════ */

export default function VocationalJourney({ client }: { client: ClientUser }) {
  const [journey, setJourney] = useState<JourneyProfile>({});
  const [profile, setProfile] = useState<UserProfile>({});
  const [tsa, setTsa] = useState<TSAResult | null>(null);
  const [tab, setTab] = useState<"overview" | "agent">("overview");

  useEffect(() => {
    setJourney(loadJourney());
    setProfile(loadProfile());
    setTsa(loadTSA());
  }, []);

  const indicators = useMemo(() => buildProgress(client.caseId), [client.caseId]);
  const resumes = useMemo(() => resumeCount(), []);
  const goals = useMemo(() => goalCount(), []);

  function updateJourney(patch: Partial<JourneyProfile>) {
    setJourney((prev) => {
      const next = { ...prev, ...patch };
      saveJourney(next);
      return next;
    });
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-accent">
            My Vocational Journey
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Your path to employment
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-ink/65">
            Everything you&apos;ve done and where you&apos;re headed — all in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
            Journey overview
          </TabBtn>
          <TabBtn active={tab === "agent"} onClick={() => setTab("agent")}>
            AI Vocational Agent
          </TabBtn>
        </div>
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          {/* Status bar */}
          <JourneyStatusBar journey={journey} onUpdate={updateJourney} client={client} profile={profile} />

          {/* Metric tiles */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile icon="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" label="Goals set" value={goals} href="/portal" />
            <Tile icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" label="Assessments" value={indicators.counselingParticipation} href="/my-assessments" />
            <Tile icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" label="Resumes built" value={resumes} href="/resume" />
            <Tile icon="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" label="Advocacy actions" value={indicators.selfAdvocacyActions} href="/self-advocacy" />
          </div>

          {/* Skills + education + employment details */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Skills card */}
            <div className="saas-card space-y-3">
              <h3 className="font-bold text-ink">Skills &amp; transferable skills</h3>
              {tsa && tsa.coreSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tsa.coreSkills.slice(0, 8).map((s) => (
                    <span key={s.skill} className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent">
                      {s.skill}
                    </span>
                  ))}
                  {tsa.coreSkills.length > 8 && (
                    <span className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/55">
                      +{tsa.coreSkills.length - 8} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ink/55">
                  No transferable skills analysis yet.{" "}
                  <Link href="/transferable-skills" className="font-semibold text-accent underline">Run one now</Link>
                </p>
              )}
              {tsa && tsa.occupationsToConsider.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Career matches</p>
                  <ul className="mt-1 space-y-1">
                    {tsa.occupationsToConsider.slice(0, 3).map((o) => (
                      <li key={o.title} className="text-sm text-ink/75">{o.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Education / employment card */}
            <div className="saas-card space-y-3">
              <h3 className="font-bold text-ink">Education &amp; employment</h3>
              <dl className="grid gap-2 text-sm">
                <DetailRow label="Employment goal" value={client.goal} />
                <DetailRow label="Status" value={STATUS_LABELS[journey.employmentStatus ?? ""] ?? "Not set"} />
                {journey.employmentStatus === "employed" && (
                  <>
                    <DetailRow label="Employer" value={journey.currentEmployer} />
                    <DetailRow label="Role" value={journey.currentRole} />
                  </>
                )}
                <DetailRow label="Education" value={profile.intake?.educationLevel} />
                {journey.educationCredential && (
                  <DetailRow
                    label={journey.educationStatus === "in-progress" ? "Currently earning" : "Credential earned"}
                    value={`${journey.educationCredential}${journey.educationInstitution ? ` — ${journey.educationInstitution}` : ""}`}
                  />
                )}
                <DetailRow label="VR stage" value={client.status} />
                <DetailRow label="Counselor" value={client.counselorName} />
              </dl>
            </div>
          </div>

          {/* Progress bar */}
          <div className="saas-card">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold text-ink">Journey progress</h3>
              <span className="text-2xl font-bold text-accent">{client.progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={client.progress}>
              <div className="h-full grad-tealblue transition-all" style={{ width: `${client.progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink/55">
              <span>Stage: <strong className="text-ink">{client.status}</strong></span>
              <span>Resumes: <strong className="text-ink">{resumes}</strong></span>
              <span>Documents: <strong className="text-ink">{indicators.jobApplicationsSubmitted}</strong></span>
              <span>Milestones: <strong className="text-ink">{indicators.employmentMilestones}</strong></span>
            </div>
          </div>

          {/* CIE infographic */}
          <CIEInfographic />
        </div>
      ) : (
        <VocationalAgent client={client} journey={journey} onUpdate={updateJourney} profile={profile} />
      )}
    </section>
  );
}

/* ── Journey status bar (quick edit) ── */
function JourneyStatusBar({
  journey,
  onUpdate,
  client,
  profile,
}: {
  journey: JourneyProfile;
  onUpdate: (p: Partial<JourneyProfile>) => void;
  client: ClientUser;
  profile: UserProfile;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-cream/50 p-4">
        <StatusPill label={STATUS_LABELS[journey.employmentStatus ?? ""] ?? "Set your status"} />
        {journey.educationCredential && (
          <StatusPill label={`${journey.educationStatus === "in-progress" ? "Earning" : "Earned"}: ${journey.educationCredential}`} />
        )}
        {journey.populationGroup && journey.populationGroup !== "general" && (
          <StatusPill label={journey.populationGroup === "youth-transition" ? "Youth / transition" : journey.populationGroup === "acquired-disability" ? "Acquired disability" : "ADHD / Autism support"} />
        )}
        <button
          onClick={() => setEditing(true)}
          className="ml-auto rounded-full border border-accent/30 px-3 py-1 text-xs font-bold text-accent transition hover:bg-accent hover:text-white"
        >
          Edit journey details
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent/20 bg-white p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-ink">Update your journey</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-bold text-ink">Employment status</span>
          <select
            className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={journey.employmentStatus ?? ""}
            onChange={(e) => onUpdate({ employmentStatus: e.target.value as JourneyProfile["employmentStatus"] })}
          >
            <option value="">-- Choose --</option>
            <option value="seeking">Seeking employment</option>
            <option value="employed">Currently employed</option>
            <option value="training">In training / certificate program</option>
            <option value="higher-ed">In higher education</option>
            <option value="not-working">Not currently working</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-bold text-ink">I identify as</span>
          <select
            className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={journey.populationGroup ?? "general"}
            onChange={(e) => onUpdate({ populationGroup: e.target.value as JourneyProfile["populationGroup"] })}
          >
            <option value="general">General VR client</option>
            <option value="youth-transition">Youth receiving transition services</option>
            <option value="acquired-disability">Acquired disability / injury</option>
            <option value="cognitive-adhd-autism">ADHD / Autism / cognitive support</option>
          </select>
        </label>
        {journey.employmentStatus === "employed" && (
          <>
            <label className="block text-sm">
              <span className="font-bold text-ink">Current employer</span>
              <input
                className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                value={journey.currentEmployer ?? ""}
                onChange={(e) => onUpdate({ currentEmployer: e.target.value })}
                placeholder="Company name"
              />
            </label>
            <label className="block text-sm">
              <span className="font-bold text-ink">Your role</span>
              <input
                className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                value={journey.currentRole ?? ""}
                onChange={(e) => onUpdate({ currentRole: e.target.value })}
                placeholder="Job title"
              />
            </label>
          </>
        )}
        <label className="block text-sm">
          <span className="font-bold text-ink">Credential earned / earning</span>
          <input
            className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={journey.educationCredential ?? ""}
            onChange={(e) => onUpdate({ educationCredential: e.target.value })}
            placeholder="e.g. Associate in Applied Science"
          />
        </label>
        <label className="block text-sm">
          <span className="font-bold text-ink">Institution</span>
          <input
            className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={journey.educationInstitution ?? ""}
            onChange={(e) => onUpdate({ educationInstitution: e.target.value })}
            placeholder="College / training program name"
          />
        </label>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setEditing(false)} className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent/90">
          Done
        </button>
        <button onClick={() => setEditing(false)} className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink/60 transition hover:bg-ink/5">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Vocational AI Agent ── */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function VocationalAgent({
  client,
  journey,
  onUpdate,
  profile,
}: {
  client: ClientUser;
  journey: JourneyProfile;
  onUpdate: (p: Partial<JourneyProfile>) => void;
  profile: UserProfile;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError(null);

    // Build journey context for the system prompt
    const journeyCtx = [
      `Client: ${client.name}`,
      `VR stage: ${client.status}`,
      `Employment goal: ${client.goal}`,
      `Progress: ${client.progress}%`,
      `Employment status: ${STATUS_LABELS[journey.employmentStatus ?? ""] ?? "Not set"}`,
      journey.currentEmployer ? `Employer: ${journey.currentEmployer}` : null,
      journey.currentRole ? `Role: ${journey.currentRole}` : null,
      journey.educationCredential ? `Education: ${journey.educationCredential} (${journey.educationStatus ?? "unknown"})` : null,
      journey.populationGroup && journey.populationGroup !== "general" ? `Population: ${journey.populationGroup}` : null,
      profile.intake?.constraints ? `Considerations: ${profile.intake.constraints}` : null,
      profile.intake?.educationLevel ? `Education level: ${profile.intake.educationLevel}` : null,
      profile.hollandCode ? `Holland code: ${profile.hollandCode}` : null,
      journey.topGoals?.length ? `Goals: ${journey.topGoals.join("; ")}` : null,
    ].filter(Boolean).join("\n");

    try {
      const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          messages: [
            {
              role: "user" as const,
              content: `[VOCATIONAL JOURNEY CONTEXT]\n${journeyCtx}\n\n[INSTRUCTIONS]\nYou are a Vocational AI Agent embedded in the "My Vocational Journey" page. Your job is to:\n1. Ask about the client's current goals and save insights.\n2. Suggest specific assessments a VR counselor would use (e.g., RIASEC Interest Profiler, transferable skills analysis, functional capacity evaluation).\n3. If the client has an acquired disability or injury, help them explore adjustment strategies, accommodations, and VR services.\n4. If the client is a youth in transition, focus on pre-employment transition services, self-determination, and IEP/504 connections.\n5. If the client has ADHD, autism, or cognitive considerations, suggest executive function strategies, structured job coaching, and appropriate assessments.\n6. Always connect advice back to their IPE and VR counselor.\n\nNow respond to their message below.`,
            },
            { role: "assistant" as const, content: "I've reviewed your vocational journey profile. I'm ready to help you plan your next steps, suggest useful assessments, or talk through any changes in your situation. What would you like to focus on?" },
            ...next,
          ],
          topMatches: [],
        }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(errBody.error ?? "Request failed");
        setStreaming(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();
      let assistant = "";
      setMessages((cur) => [...cur, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { role: "assistant", content: assistant };
          return copy;
        });
      }

      // Try to extract goals from the conversation and save
      extractAndSaveGoals(assistant, journey, onUpdate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const suggestedPrompts = useMemo(() => {
    const prompts: string[] = [];
    if (!journey.employmentStatus) prompts.push("Help me figure out my employment situation");
    if (journey.populationGroup === "acquired-disability") prompts.push("I have a new injury — what VR services can help me adjust?");
    if (journey.populationGroup === "youth-transition") prompts.push("I'm in transition — what pre-employment services should I ask about?");
    if (journey.populationGroup === "cognitive-adhd-autism") prompts.push("I have ADHD — what workplace strategies would help me?");
    prompts.push("What assessments should I take next?");
    prompts.push("Help me set 3 vocational goals for this quarter");
    if (journey.employmentStatus === "employed") prompts.push("I want to advance in my current job — what should I do?");
    return prompts.slice(0, 4);
  }, [journey]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-sm">
      <div className="grad-tealblue p-5 text-white md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
          AI Vocational Agent
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight">
          Let&apos;s plan your next steps
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/80">
          Talk about your goals, get assessment recommendations, explore
          accommodations, or plan around a life change. Your answers are saved
          to your journey profile.
        </p>
      </div>

      <div className="flex flex-col" style={{ minHeight: 420 }}>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[55vh]">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-ink/55">Try one of these to get started:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setInput(p); }}
                    className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] text-left whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "border border-ink/10 bg-cream/50"
                }`}
              >
                {m.content || (streaming ? "..." : "")}
              </div>
            </div>
          ))}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-ink/10 p-4 flex gap-3">
          <textarea
            className="flex-1 resize-none rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm min-h-[44px] max-h-[120px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={input}
            placeholder="Ask the Vocational Agent..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming}
            rows={1}
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="min-h-[44px] rounded-xl bg-accent px-5 py-2 text-sm font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
          >
            {streaming ? "..." : "Send"}
          </button>
        </div>
      </div>

      <div className="border-t border-ink/5 px-5 py-3 text-xs text-ink/45">
        Conversations are sent to Claude AI to generate replies. Do not share SSNs,
        full medical records, or other confidential information.
      </div>
    </div>
  );
}

/** Light heuristic: if the AI response contains numbered goals, save them */
function extractAndSaveGoals(
  text: string,
  journey: JourneyProfile,
  onUpdate: (p: Partial<JourneyProfile>) => void,
) {
  const goalPattern = /(?:^|\n)\s*\d+[\.\)]\s+(.+)/g;
  const found: string[] = [];
  let match;
  while ((match = goalPattern.exec(text)) !== null) {
    const goal = match[1].trim();
    if (goal.length > 10 && goal.length < 200) found.push(goal);
  }
  if (found.length >= 2 && found.length <= 10) {
    onUpdate({ topGoals: found.slice(0, 5) });
  }
}

/* ── CIE Infographic ── */
function CIEInfographic() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-accent">
          The gold standard
        </span>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          Competitive Integrated Employment
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Competitive Integrated Employment (CIE) is the standard set by WIOA
          and the Rehabilitation Act. It means real jobs, real wages, and real
          inclusion — the outcome your VR plan is designed to achieve.
        </p>
      </div>

      {/* Pillar cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CIE_PILLARS.map((p) => {
          const c = CIE_COLOR[p.color] ?? CIE_COLOR.emerald;
          return (
            <div key={p.title} className={`rounded-2xl border ${c.border} ${c.bg} p-5 text-center`}>
              <span className={`mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white shadow-sm ${c.ring} ring-2`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c.text}>
                  <path d={p.icon} />
                </svg>
              </span>
              <h4 className={`mt-3 font-bold ${c.text}`}>{p.title}</h4>
              <p className="mt-2 text-xs leading-5 text-ink/65">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Flow diagram */}
      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink/50 text-center">
          How CIE connects to your VR journey
        </p>
        <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between md:gap-0">
          {["Intake &\nassessment", "IPE\nplanning", "Training &\nservices", "Job search &\nplacement", "Competitive\nIntegrated\nEmployment"].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 md:flex-1">
              <div className={`grid h-14 w-14 flex-none place-items-center rounded-2xl text-center text-[10px] font-bold leading-tight md:w-full md:h-auto md:py-3 md:rounded-xl ${i === arr.length - 1 ? "grad-tealblue text-white" : "border border-ink/10 bg-cream/50 text-ink/75"}`}>
                {step.split("\n").map((line, li) => (
                  <span key={li} className="block">{line}</span>
                ))}
              </div>
              {i < arr.length - 1 && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none text-ink/25 md:mx-1" aria-hidden>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
        active
          ? "bg-accent text-white shadow-sm"
          : "border border-ink/15 bg-white text-ink/60 hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Tile({ icon, label, value, href }: { icon: string; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-ink/10 bg-white p-4 text-center transition hover:border-accent hover:shadow-sm">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-accent/5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
          <path d={icon} />
        </svg>
      </span>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</p>
    </Link>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-bold text-accent">
      {label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3">
      <dt className="flex-none text-xs font-bold uppercase tracking-wider text-ink/45 w-28">{label}</dt>
      <dd className="text-sm text-ink/75">{value || "—"}</dd>
    </div>
  );
}
