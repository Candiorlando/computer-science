"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadProfile, type UserProfile } from "@/lib/storage";
import {
  rankOccupations, jobZoneDescription, wageBandDescription, getOohUrl, type Occupation,
} from "@/lib/onet-data";
import { riasecNames, traitNames } from "@/lib/assessments";
import { Disclaimer } from "@/components/Disclaimer";

const educationCeilingMap: Record<string, number> = {
  "Still in high school": 2,
  "Some high school": 2,
  "High school diploma / GED": 3,
  "Some college": 3,
  "Associate degree / vocational certificate": 4,
  "Bachelor's degree": 5,
  "Graduate / professional degree": 5,
};

export default function ResultsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [filter, setFilter] = useState<"all" | "no-degree" | "apprenticeship">("all");

  useEffect(() => setProfile(loadProfile()), []);

  const ranked = useMemo(() => {
    if (!profile?.riasec) return [];
    const opts: { maxJobZone?: number; requireApprenticeship?: boolean } = {};
    if (filter === "no-degree") opts.maxJobZone = 3;
    if (filter === "apprenticeship") opts.requireApprenticeship = true;
    return rankOccupations(profile.riasec, opts).slice(0, 15);
  }, [profile, filter]);

  if (!profile) return <p>Loading…</p>;

  if (!profile.riasec || !profile.bigFive) {
    return (
      <div className="space-y-4 prose-narrow">
        <h1 className="text-3xl">Take the assessments first</h1>
        <p>You'll need to complete the personality and interests assessments to see matches.</p>
        <Link href="/assessment" className="text-accent underline">Go to assessment →</Link>
      </div>
    );
  }

  const userEducationCeiling = profile.intake?.educationLevel
    ? educationCeilingMap[profile.intake.educationLevel] ?? 5
    : 5;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl mb-2">Your matches</h1>
        <p className="text-ink/70">
          Holland code <strong className="text-accent">{profile.hollandCode}</strong> ·
          based on your interests and the O*NET occupation database.
        </p>
      </section>

      <ScoreSummary profile={profile} />

      <Disclaimer />

      <section>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All occupations</FilterPill>
          <FilterPill active={filter === "no-degree"} onClick={() => setFilter("no-degree")}>No degree required</FilterPill>
          <FilterPill active={filter === "apprenticeship"} onClick={() => setFilter("apprenticeship")}>Apprenticeship paths</FilterPill>
        </div>

        <div className="space-y-3">
          {ranked.map(({ occ, fit }, idx) => (
            <OccupationCard
              key={occ.socCode}
              occ={occ}
              fit={fit}
              rank={idx + 1}
              userLocation={profile.intake?.location}
              userEducationCeiling={userEducationCeiling}
            />
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-ink/10">
        <h2 className="text-2xl mb-3">Next: talk to the coach</h2>
        <p className="text-ink/70 prose-narrow mb-4">
          Ready to plan how to actually get into one of these careers? The coach can walk
          through application strategy, training options, accommodations, and follow-up.
        </p>
        <Link href="/coach" className="inline-block px-5 py-2.5 bg-accent text-white rounded">
          Open the coach →
        </Link>
      </section>
    </div>
  );
}

function ScoreSummary({ profile }: { profile: UserProfile }) {
  return (
    <section className="grid md:grid-cols-2 gap-6 bg-white/40 border border-ink/10 rounded-lg p-5">
      <div>
        <h3 className="text-sm uppercase tracking-wide text-ink/60 mb-2">RIASEC interest profile</h3>
        <ul className="space-y-1.5">
          {(Object.entries(profile.riasec!) as ["R"|"I"|"A"|"S"|"E"|"C", number][])
            .sort((a, b) => b[1] - a[1])
            .map(([t, v]) => (
              <li key={t} className="flex items-center gap-2 text-sm">
                <span className="w-32 text-ink/80">{riasecNames[t]}</span>
                <div className="flex-1 h-2 bg-ink/10 rounded">
                  <div className="h-2 bg-accent rounded" style={{ width: `${v}%` }} />
                </div>
                <span className="w-10 text-right tabular-nums">{v}</span>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm uppercase tracking-wide text-ink/60 mb-2">Big Five</h3>
        <ul className="space-y-1.5">
          {(Object.entries(profile.bigFive!) as ["E"|"A"|"C"|"N"|"O", number][]).map(([t, v]) => (
            <li key={t} className="flex items-center gap-2 text-sm">
              <span className="w-36 text-ink/80">{traitNames[t]}</span>
              <div className="flex-1 h-2 bg-ink/10 rounded">
                <div className="h-2 bg-accent rounded" style={{ width: `${v}%` }} />
              </div>
              <span className="w-10 text-right tabular-nums">{v}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink/50 mt-2">
          Scores are percentile-style 0–100 relative to the response scale, not the population.
        </p>
      </div>
    </section>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border ${
        active ? "bg-accent text-white border-accent" : "border-ink/20 hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

function OccupationCard({
  occ, fit, rank, userLocation, userEducationCeiling,
}: {
  occ: Occupation;
  fit: number;
  rank: number;
  userLocation?: string;
  userEducationCeiling: number;
}) {
  const meetsEducation = occ.jobZone <= userEducationCeiling;
  const loc = userLocation ?? "";
  const careerOneStop = `https://www.careeronestop.org/Toolkit/Jobs/find-jobs-results.aspx?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(loc)}&radius=25`;
  const onetUrl = `https://www.onetonline.org/link/summary/${occ.socCode}`;
  const apprUrl = `https://www.apprenticeship.gov/apprenticeship-job-finder?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(loc)}`;
  const oohUrl = getOohUrl(occ);
  // Funding: CareerOneStop financial aid finder — scholarships, grants, loans
  // filtered by occupation and (where available) state.
  const fundingUrl = `https://www.careeronestop.org/Toolkit/Training/find-financial-aid.aspx?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(loc)}`;
  // WIOA programs: American Job Centers (Title I — Adult, Dislocated Worker,
  // Youth) located by zip/city.
  const wioaUrl = `https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx?location=${encodeURIComponent(loc)}&radius=25`;
  // Training programs near you (eligible training provider list under WIOA)
  const trainingUrl = `https://www.careeronestop.org/Toolkit/Training/find-local-training.aspx?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(loc)}`;

  return (
    <article className="border border-ink/15 rounded-lg p-5 bg-white/60">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="text-xs text-ink/50">#{rank} · O*NET {occ.socCode}</div>
          <h3 className="text-xl">{occ.title}</h3>
        </div>
        <div className="text-right text-sm">
          <div className="text-accent font-medium">{Math.round(fit * 33)}% fit</div>
          <div className="text-ink/50 text-xs">RIASEC {occ.riasec.join("")}</div>
        </div>
      </div>

      <p className="text-sm text-ink/75 mb-3">{occ.blurb}</p>

      <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <div className="text-ink/50 text-xs uppercase tracking-wide">Typical preparation</div>
          <div>{jobZoneDescription[occ.jobZone]}</div>
          {!meetsEducation && (
            <div className="text-xs text-accent mt-1">
              Above your current education — would require additional schooling
              {occ.apprenticeshipPath && " (or an apprenticeship)"}.
            </div>
          )}
        </div>
        <div>
          <div className="text-ink/50 text-xs uppercase tracking-wide">Median pay band</div>
          <div>{wageBandDescription[occ.medianWageBand]}</div>
        </div>
      </div>

      <div className="text-xs uppercase tracking-wider text-ink/50 mb-2 mt-1">
        Find work
      </div>
      <div className="flex flex-wrap gap-2 text-sm mb-3">
        <a className="link-btn" href={careerOneStop} target="_blank" rel="noreferrer">
          Find openings near {userLocation || "you"} ↗
        </a>
        {occ.apprenticeshipPath && (
          <a className="link-btn" href={apprUrl} target="_blank" rel="noreferrer">
            Apprenticeships ↗
          </a>
        )}
      </div>

      <div className="text-xs uppercase tracking-wider text-ink/50 mb-2">
        Pay for training
      </div>
      <div className="flex flex-wrap gap-2 text-sm mb-3">
        <a className="link-btn link-btn-money" href={fundingUrl} target="_blank" rel="noreferrer">
          💰 Funding & financial aid ↗
        </a>
        <a className="link-btn link-btn-money" href={wioaUrl} target="_blank" rel="noreferrer">
          🏛️ WIOA programs near {userLocation || "you"} ↗
        </a>
        <a className="link-btn link-btn-money" href={trainingUrl} target="_blank" rel="noreferrer">
          🎓 Training programs ↗
        </a>
      </div>

      <div className="text-xs uppercase tracking-wider text-ink/50 mb-2">
        Learn more about this career
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <a className="link-btn" href={onetUrl} target="_blank" rel="noreferrer">
          Full O*NET profile ↗
        </a>
        <a className="link-btn" href={oohUrl} target="_blank" rel="noreferrer">
          BLS OOH outlook ↗
        </a>
      </div>

      <style jsx>{`
        :global(.link-btn-money) {
          background-color: rgba(185, 92, 60, 0.08);
          border-color: rgba(185, 92, 60, 0.35) !important;
        }
        :global(.link-btn-money:hover) {
          background-color: rgba(185, 92, 60, 0.15);
        }
        :global(.link-btn) {
          border: 1px solid rgba(31, 29, 26, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
        }
        :global(.link-btn:hover) {
          border-color: #b95c3c;
          color: #b95c3c;
        }
      `}</style>
    </article>
  );
}
