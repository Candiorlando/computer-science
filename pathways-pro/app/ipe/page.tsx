"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadSession } from "@/lib/session";
import {
  CLIENTS,
  type AnyUser,
  type ClientUser,
  type CounselorUser,
} from "@/lib/users";
import {
  emptyIPE,
  loadIPE,
  saveIPE,
  type IPE,
  type IPEStatus,
} from "@/lib/ipe";
import { patchClientReport } from "@/lib/client-report";
import { Disclaimer } from "@/components/Disclaimer";

export default function IPEPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <IPEPageInner />
    </Suspense>
  );
}

function IPEPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = loadSession();
    if (!s) router.replace("/");
    else setUser(s);
  }, [router]);

  if (!mounted || !user) return null;
  if (user.role === "counselor")
    return <CounselorView user={user} caseIdParam={search.get("case")} />;
  return <ClientView user={user as ClientUser} />;
}

// ──────────────────────────────────────────────────────────────────────────
//  COUNSELOR VIEW
// ──────────────────────────────────────────────────────────────────────────
function CounselorView({
  user,
  caseIdParam,
}: {
  user: CounselorUser;
  caseIdParam: string | null;
}) {
  const router = useRouter();
  const clients = user.clientKeys
    .map((k) => CLIENTS[k])
    .filter((c): c is ClientUser => Boolean(c));

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    caseIdParam,
  );
  const selectedClient = useMemo(
    () => clients.find((c) => c.caseId === selectedCaseId),
    [clients, selectedCaseId],
  );

  if (!selectedCaseId || !selectedClient) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
            IPE Builder · WIOA Title IV § 102(b)
          </p>
          <h1 className="text-4xl mb-2">Generate an IPE</h1>
          <p className="text-ink/70 prose-narrow">
            Pick a client to draft an AI-assisted Individualized Plan for
            Employment. The draft includes accommodations tailored to the
            disability, services, and barriers — you edit before sending it
            to the client for signature.
          </p>
        </header>

        <Disclaimer kind="general" />

        <div className="grid md:grid-cols-2 gap-3">
          {clients.map((c) => {
            const existing = typeof window !== "undefined" ? loadIPE(c.caseId) : null;
            return (
              <button
                key={c.email}
                onClick={() => setSelectedCaseId(c.caseId)}
                className="text-left border border-ink/15 rounded-lg p-4 bg-cream hover:border-accent transition"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {existing && (
                    <StatusBadge status={existing.status} />
                  )}
                </div>
                <div className="text-xs text-ink/60 mt-1">
                  Goal: {c.goal} · {c.caseId}
                </div>
                <div className="text-xs text-accent mt-2">
                  {existing ? "Edit existing IPE →" : "Generate new IPE →"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <IPEBuilder
      counselor={user}
      client={selectedClient}
      onBack={() => {
        setSelectedCaseId(null);
        router.replace("/ipe");
      }}
    />
  );
}

function IPEBuilder({
  counselor,
  client,
  onBack,
}: {
  counselor: CounselorUser;
  client: ClientUser;
  onBack: () => void;
}) {
  const [ipe, setIpe] = useState<IPE>(() => {
    if (typeof window === "undefined")
      return emptyIPE(
        client.caseId,
        client.email,
        client.name,
        counselor.email,
        counselor.name + ", " + counselor.credentials,
        client.dob,
      );
    return (
      loadIPE(client.caseId) ||
      emptyIPE(
        client.caseId,
        client.email,
        client.name,
        counselor.email,
        counselor.name + ", " + counselor.credentials,
        client.dob,
      )
    );
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intake, setIntake] = useState({
    primaryDisability: ipe.primaryDisability,
    secondaryConditions: ipe.secondaryConditions,
    employmentGoal: ipe.employmentGoal || client.goal,
    educationLevel: "",
    workHistory: "",
  });

  async function generate() {
    if (!intake.primaryDisability.trim() || !intake.employmentGoal.trim()) {
      setError(
        "Primary disability and employment goal are required before generating.",
      );
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-ipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: client.name,
          dob: client.dob,
          primaryDisability: intake.primaryDisability,
          secondaryConditions: intake.secondaryConditions,
          employmentGoal: intake.employmentGoal,
          workHistory: intake.workHistory,
          educationLevel: intake.educationLevel,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = await resp.json();
      const timelineMonths = data.timelineMonths ?? 12;
      const estimatedDate = new Date();
      estimatedDate.setMonth(estimatedDate.getMonth() + timelineMonths);
      const next: IPE = {
        ...ipe,
        primaryDisability: intake.primaryDisability,
        secondaryConditions: intake.secondaryConditions,
        employmentGoal: intake.employmentGoal,
        functionalLimitations: data.functionalLimitations ?? [],
        goalRationale: data.goalRationale ?? "",
        laborMarketOutlook: data.laborMarketOutlook ?? "",
        vrServices: data.vrServices ?? [],
        serviceProviders: data.serviceProviders ?? [],
        accommodations: data.accommodations ?? ipe.accommodations,
        disabilityBarriers: data.disabilityBarriers ?? [],
        supports: data.supports ?? [],
        agencyResponsibilities: data.agencyResponsibilities ?? [],
        clientResponsibilities: data.clientResponsibilities ?? [],
        evaluationCriteria: data.evaluationCriteria ?? [],
        timelineMonths,
        estimatedAchievementDate: estimatedDate.toISOString().slice(0, 10),
      };
      setIpe(next);
      saveIPE(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function persist(patch: Partial<IPE>) {
    setIpe((cur) => {
      const next = { ...cur, ...patch };
      saveIPE(next);
      patchClientReport(client.caseId, client.name, {
        clientDob: client.dob,
        counselorName: ipe.counselorName,
        ipeStatus: next.status,
        ipeUpdatedAt: next.updatedAt,
        ipe: next,
      });
      return next;
    });
  }

  function counselorSign() {
    persist({
      counselorSignature: {
        signed: true,
        signedAt: new Date().toISOString(),
        signedBy: counselor.name + ", " + counselor.credentials,
      },
      status: ipe.clientSignature.signed
        ? "signed"
        : "pending-client-signature",
    });
  }

  function clientSignByCounselor() {
    if (
      !confirm(
        `Confirm: ${client.name} is present and authorizing this IPE in person. This will record their digital signature.`,
      )
    )
      return;
    persist({
      clientSignature: {
        signed: true,
        signedAt: new Date().toISOString(),
        signedBy: client.name,
      },
      status: ipe.counselorSignature.signed ? "signed" : "draft",
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-accent hover:underline mb-2"
          >
            ← Back to caseload
          </button>
          <h1 className="text-3xl">{client.name}</h1>
          <p className="text-sm text-ink/60">
            {client.caseId} · DOB {client.dob} · Counselor:{" "}
            {counselor.name}, {counselor.credentials}
          </p>
        </div>
        <StatusBadge status={ipe.status} large />
      </header>

      <Disclaimer kind="general" />

      <section className="border border-ink/15 rounded-lg p-5 bg-cream">
        <h2 className="text-xl mb-3">1. Intake — drives the AI draft</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <FormField
            label="Primary disability *"
            value={intake.primaryDisability}
            onChange={(v) => setIntake((s) => ({ ...s, primaryDisability: v }))}
            placeholder="e.g. Spinal cord injury C5-C6, complete"
          />
          <FormField
            label="Secondary conditions"
            value={intake.secondaryConditions}
            onChange={(v) =>
              setIntake((s) => ({ ...s, secondaryConditions: v }))
            }
            placeholder="e.g. Adjustment disorder with anxiety"
          />
          <FormField
            label="Employment goal *"
            value={intake.employmentGoal}
            onChange={(v) => setIntake((s) => ({ ...s, employmentGoal: v }))}
            placeholder="e.g. Software Developer (15-1252.00)"
          />
          <FormField
            label="Education level"
            value={intake.educationLevel}
            onChange={(v) => setIntake((s) => ({ ...s, educationLevel: v }))}
            placeholder="e.g. Associate degree in IT"
          />
          <FormField
            label="Work history"
            value={intake.workHistory}
            onChange={(v) => setIntake((s) => ({ ...s, workHistory: v }))}
            placeholder="e.g. 3 yrs retail, 6 mo data entry"
            full
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={generate}
            disabled={generating}
            className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
          >
            {generating
              ? "Generating with Claude Opus 4.8…"
              : ipe.functionalLimitations.length > 0
                ? "Regenerate with AI ↻"
                : "Generate IPE with AI ✨"}
          </button>
          <span className="text-xs text-ink/50">
            Powered by Claude Opus 4.8. Draft only — review before signing.
          </span>
        </div>
        {error && (
          <div className="mt-3 text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded">
            {error}
          </div>
        )}
      </section>

      {ipe.functionalLimitations.length > 0 && (
        <>
          <Section title="2. Functional limitations">
            <ListEditor
              items={ipe.functionalLimitations}
              onChange={(items) => persist({ functionalLimitations: items })}
            />
          </Section>

          <Section title="3. Goal rationale">
            <TextArea
              value={ipe.goalRationale}
              onChange={(v) => persist({ goalRationale: v })}
              rows={3}
            />
          </Section>

          <Section title="3a. Local labor market outlook (BLS OOH)">
            <TextArea
              value={ipe.laborMarketOutlook}
              onChange={(v) => persist({ laborMarketOutlook: v })}
              rows={3}
            />
            <p className="text-xs text-ink/50 mt-1">
              Median wage band · 10-year projected growth · typical entry pathway.
            </p>
          </Section>

          <Section title="4. VR services authorized">
            <ListEditor
              items={ipe.vrServices}
              onChange={(items) => persist({ vrServices: items })}
            />
          </Section>

          <Section title="4a. Service providers & settings">
            <p className="text-sm text-ink/70 mb-3">
              Who delivers each service, and whether the setting is
              integrated competitive employment (WIOA standard).
            </p>
            <ServiceProvidersEditor
              providers={ipe.serviceProviders}
              onChange={(p) => persist({ serviceProviders: p })}
            />
          </Section>

          <Section title="5. Accommodations">
            <h3 className="text-sm uppercase tracking-wider text-ink/60 mb-2">
              Workplace
            </h3>
            <ListEditor
              items={ipe.accommodations.workplace}
              onChange={(items) =>
                persist({
                  accommodations: { ...ipe.accommodations, workplace: items },
                })
              }
            />
            <h3 className="text-sm uppercase tracking-wider text-ink/60 mb-2 mt-4">
              Training / Education
            </h3>
            <ListEditor
              items={ipe.accommodations.training}
              onChange={(items) =>
                persist({
                  accommodations: { ...ipe.accommodations, training: items },
                })
              }
            />
            <h3 className="text-sm uppercase tracking-wider text-ink/60 mb-2 mt-4">
              Assistive technology
            </h3>
            <ListEditor
              items={ipe.accommodations.assistiveTech}
              onChange={(items) =>
                persist({
                  accommodations: { ...ipe.accommodations, assistiveTech: items },
                })
              }
            />
          </Section>

          <Section title="6. Disability-related barriers">
            <ListEditor
              items={ipe.disabilityBarriers}
              onChange={(items) => persist({ disabilityBarriers: items })}
            />
          </Section>

          <Section title="7. Natural supports">
            <ListEditor
              items={ipe.supports}
              onChange={(items) => persist({ supports: items })}
            />
          </Section>

          <Section title="7a. Agency responsibilities">
            <p className="text-sm text-ink/70 mb-3">
              What the VR agency commits to deliver — funding, services,
              coordination, communication. Forms one half of the WIOA
              client–agency contract.
            </p>
            <ListEditor
              items={ipe.agencyResponsibilities}
              onChange={(items) => persist({ agencyResponsibilities: items })}
            />
          </Section>

          <Section title="7b. Client responsibilities">
            <p className="text-sm text-ink/70 mb-3">
              What the client commits to do — communication cadence, training
              attendance, treatment participation, reporting changes.
            </p>
            <ListEditor
              items={ipe.clientResponsibilities}
              onChange={(items) => persist({ clientResponsibilities: items })}
            />
          </Section>

          <Section title="7c. Evaluation criteria & milestones">
            <p className="text-sm text-ink/70 mb-3">
              Objective, measurable check-in metrics for tracking progress.
              Each milestone should be SMART: Specific, Measurable, Achievable,
              Relevant, Time-bound.
            </p>
            <ListEditor
              items={ipe.evaluationCriteria}
              onChange={(items) => persist({ evaluationCriteria: items })}
            />
          </Section>

          <Section title="8. Timeline & review">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <FormField
                label="Time-to-employment (months)"
                value={String(ipe.timelineMonths)}
                onChange={(v) => {
                  const months = parseInt(v) || 0;
                  const d = new Date();
                  d.setMonth(d.getMonth() + months);
                  persist({
                    timelineMonths: months,
                    estimatedAchievementDate: d.toISOString().slice(0, 10),
                  });
                }}
              />
              <FormField
                label="Estimated achievement date"
                value={ipe.estimatedAchievementDate}
                onChange={(v) => persist({ estimatedAchievementDate: v })}
              />
              <FormField
                label="Annual review date"
                value={ipe.reviewDate}
                onChange={(v) => persist({ reviewDate: v })}
              />
            </div>
          </Section>

          <Section title="9. Signatures">
            <p className="text-sm text-ink/70 mb-4">
              Both signatures are required under WIOA Title IV § 102(b). The
              client may sign on their own device by logging into their
              portal, or — if they&apos;re here in person — you can capture
              their signature directly using the button below.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <SignatureCard
                label="Counselor"
                role={counselor.credentials}
                name={counselor.name}
                signature={ipe.counselorSignature}
                onSign={counselorSign}
                buttonLabel="Sign as counselor"
              />
              <SignatureCard
                label="Client"
                role={client.caseId}
                name={client.name}
                signature={ipe.clientSignature}
                onSign={clientSignByCounselor}
                buttonLabel={`Sign as ${client.name.split(" ")[0]} (present in person)`}
                accent
              />
            </div>
            {ipe.status === "signed" && (
              <div className="mt-4 border border-green-300 bg-green-50 rounded p-4 text-sm">
                <strong className="text-green-800">✓ IPE fully executed.</strong>{" "}
                Both signatures recorded. This plan is active under WIOA Title IV.
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  CLIENT VIEW
// ──────────────────────────────────────────────────────────────────────────
function ClientView({ user }: { user: ClientUser }) {
  const [ipe, setIpe] = useState<IPE | null>(null);

  useEffect(() => {
    setIpe(loadIPE(user.caseId));
  }, [user.caseId]);

  if (ipe === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl">Your IPE Plan</h1>
        <div className="border border-ink/15 rounded-lg p-6 bg-cream">
          <p className="text-ink/70">
            Your counselor hasn&apos;t created your Individualized Plan for
            Employment yet. Your next appointment is{" "}
            <strong>{user.nextAppt}</strong> — ask about it then.
          </p>
        </div>
      </div>
    );
  }

  if (ipe.status === "draft") {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl">Your IPE Plan</h1>
        <div className="border border-amber-300 bg-amber-50 rounded-lg p-6 text-sm">
          <strong className="text-amber-900 block mb-1">In progress</strong>
          <p className="text-amber-900/80">
            {ipe.counselorName} is still preparing your plan. You&apos;ll be
            able to review and sign it once they finish. Last updated{" "}
            {new Date(ipe.updatedAt).toLocaleString()}.
          </p>
        </div>
      </div>
    );
  }

  function sign() {
    if (!ipe) return;
    const next: IPE = {
      ...ipe,
      clientSignature: {
        signed: true,
        signedAt: new Date().toISOString(),
        signedBy: user.name,
      },
      status: "signed",
    };
    saveIPE(next);
    setIpe(next);
    patchClientReport(user.caseId, user.name, {
      clientDob: user.dob,
      counselorName: ipe.counselorName,
      ipeStatus: next.status,
      ipeUpdatedAt: next.updatedAt,
      ipe: next,
    });
  }

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Individualized Plan for Employment · {ipe.caseId}
        </p>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-3xl">Your IPE Plan</h1>
          <button
            onClick={() => window.print()}
            className="grad-tealblue text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
        <p className="text-ink/60 mt-1 text-sm">
          Prepared by {ipe.counselorName} · WIOA Title IV § 102(b)
        </p>
      </header>

      {ipe.status === "signed" ? (
        <div className="border border-green-300 bg-green-50 rounded-lg p-6 print:hidden">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            ✓ Plan signed
          </h2>
          <p className="text-sm text-green-900/80">
            Signed by you on{" "}
            {new Date(ipe.clientSignature.signedAt!).toLocaleString()}. Your
            counselor signed{" "}
            {new Date(ipe.counselorSignature.signedAt!).toLocaleString()}.
          </p>
        </div>
      ) : (
        <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 print:hidden">
          <h2 className="text-lg font-semibold text-accent mb-2">
            Ready for your signature
          </h2>
          <p className="text-sm text-ink/80">
            Read your plan below. When you&apos;re ready, click{" "}
            <strong>Sign IPE</strong>. By signing, you agree to participate in
            the services listed.
          </p>
        </div>
      )}

      <article
        className="ipe-printable space-y-6"
        aria-label="Individualized Plan for Employment"
      >
        <header className="hidden print:block border-b border-ink/20 pb-3 mb-4">
          <h1 className="text-2xl font-semibold">
            Individualized Plan for Employment
          </h1>
          <p className="text-sm text-ink/65 mt-1">
            Case {ipe.caseId} · Prepared for {ipe.clientName} ·{" "}
            Counselor of record: {ipe.counselorName}
          </p>
          <p className="text-xs text-ink/55 mt-0.5">
            Authority: WIOA Title IV § 102(b) · Printed{" "}
            {new Date().toLocaleDateString()}
          </p>
        </header>

      <ReadOnlySection title="Your employment goal">
        <p className="text-lg">
          <strong>{ipe.employmentGoal}</strong>
        </p>
        <p className="text-sm text-ink/70 mt-2">{ipe.goalRationale}</p>
      </ReadOnlySection>

      <ReadOnlySection title="Services your counselor will arrange">
        <BulletList items={ipe.vrServices} />
      </ReadOnlySection>

      <ReadOnlySection title="Accommodations at work">
        <BulletList items={ipe.accommodations.workplace} />
      </ReadOnlySection>

      <ReadOnlySection title="Accommodations during training">
        <BulletList items={ipe.accommodations.training} />
      </ReadOnlySection>

      <ReadOnlySection title="Assistive technology">
        <BulletList items={ipe.accommodations.assistiveTech} />
      </ReadOnlySection>

      <ReadOnlySection title="Things we&apos;re working through together">
        <BulletList items={ipe.disabilityBarriers} />
      </ReadOnlySection>

      <ReadOnlySection title="People and resources supporting you">
        <BulletList items={ipe.supports} />
      </ReadOnlySection>

      <ReadOnlySection title="Timeline">
        <p>
          <strong>{ipe.timelineMonths} months</strong> to employment, with an
          annual review on{" "}
          <strong>{new Date(ipe.reviewDate).toLocaleDateString()}</strong>.
        </p>
      </ReadOnlySection>

      <section className="hidden print:block border-t border-ink/20 pt-4">
        <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-3">
          Signatures
        </h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-semibold mb-1">
              Client: {ipe.clientName}
            </div>
            {ipe.clientSignature.signed ? (
              <>
                <div className="border-b border-ink/40 h-6 italic text-ink/70">
                  {ipe.clientSignature.signedBy}
                </div>
                <div className="text-xs text-ink/55 mt-0.5">
                  Signed{" "}
                  {new Date(
                    ipe.clientSignature.signedAt!,
                  ).toLocaleDateString()}
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-ink/60 h-8" aria-hidden />
                <div className="text-xs text-ink/55 mt-0.5">Date: ____________</div>
              </>
            )}
          </div>
          <div>
            <div className="font-semibold mb-1">
              Counselor: {ipe.counselorName}
            </div>
            {ipe.counselorSignature.signed ? (
              <>
                <div className="border-b border-ink/40 h-6 italic text-ink/70">
                  {ipe.counselorSignature.signedBy}
                </div>
                <div className="text-xs text-ink/55 mt-0.5">
                  Signed{" "}
                  {new Date(
                    ipe.counselorSignature.signedAt!,
                  ).toLocaleDateString()}
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-ink/60 h-8" aria-hidden />
                <div className="text-xs text-ink/55 mt-0.5">Date: ____________</div>
              </>
            )}
          </div>
        </div>
      </section>
      </article>

      {ipe.status !== "signed" && (
        <div className="border border-ink/15 rounded-lg p-6 bg-cream sticky bottom-4 print:hidden">
          <h2 className="text-xl mb-2">Sign your IPE</h2>
          <p className="text-sm text-ink/70 mb-4">
            By clicking the button below, you, <strong>{user.name}</strong>,
            digitally sign this Individualized Plan for Employment on{" "}
            {new Date().toLocaleDateString()}.
          </p>
          <button
            onClick={sign}
            className="px-6 py-3 bg-accent text-cream rounded text-lg font-semibold w-full md:w-auto"
          >
            ✍️ Sign IPE — {user.name}
          </button>
          <p className="text-xs text-ink/50 mt-3">
            You can talk to {ipe.counselorName} before signing if you have
            questions.
          </p>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .ipe-printable,
          .ipe-printable * {
            visibility: visible;
          }
          .ipe-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-family: Georgia, "Times New Roman", Times, serif;
          }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  SHARED PIECES
// ──────────────────────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ink/10 rounded-lg p-5 bg-cream">
      <h2 className="text-xl mb-3">{title}</h2>
      {children}
    </section>
  );
}

function ReadOnlySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm uppercase tracking-wider text-ink/50 mb-2">
        {title}
      </h2>
      <div className="bg-cream border border-ink/10 rounded p-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
      />
    </label>
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent text-sm"
    />
  );
}

function ServiceProvidersEditor({
  providers,
  onChange,
}: {
  providers: import("@/lib/ipe").ServiceProvider[];
  onChange: (next: import("@/lib/ipe").ServiceProvider[]) => void;
}) {
  const typeLabels: Record<import("@/lib/ipe").ProviderType, string> = {
    "state-agency": "State VR agency (internal)",
    "community-rehab-provider": "Community Rehab Provider (CRP)",
    "training-provider": "Training / educational provider",
    "employer-partner": "Employer partner",
    vendor: "Vendor",
  };

  function update(
    idx: number,
    patch: Partial<import("@/lib/ipe").ServiceProvider>,
  ) {
    const next = [...providers];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function add() {
    onChange([
      ...providers,
      {
        name: "",
        type: "state-agency",
        services: "",
        integratedSetting: true,
      },
    ]);
  }

  return (
    <div className="space-y-3">
      {providers.map((p, idx) => (
        <div key={idx} className="border border-ink/10 rounded p-3 bg-white/60">
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={p.name}
              onChange={(e) => update(idx, { name: e.target.value })}
              placeholder="Provider name (e.g. State VR Agency — Local Office)"
              className="bg-white border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <select
              value={p.type}
              onChange={(e) =>
                update(idx, {
                  type: e.target.value as import("@/lib/ipe").ProviderType,
                })
              }
              className="bg-white border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {(Object.keys(typeLabels) as import("@/lib/ipe").ProviderType[]).map(
                (k) => (
                  <option key={k} value={k}>
                    {typeLabels[k]}
                  </option>
                ),
              )}
            </select>
          </div>
          <textarea
            value={p.services}
            onChange={(e) => update(idx, { services: e.target.value })}
            placeholder="Services delivered by this provider…"
            rows={2}
            className="w-full bg-white border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={p.integratedSetting}
                onChange={(e) =>
                  update(idx, { integratedSetting: e.target.checked })
                }
              />
              Integrated competitive setting (WIOA standard)
            </label>
            <button
              onClick={() => onChange(providers.filter((_, i) => i !== idx))}
              className="text-xs text-ink/40 hover:text-accent"
            >
              ✕ Remove
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="text-sm text-accent hover:underline"
      >
        + Add provider
      </button>
    </div>
  );
}

function ListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <span className="text-ink/40 mt-2.5 text-sm">•</span>
          <textarea
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[idx] = e.target.value;
              onChange(next);
            }}
            rows={2}
            className="flex-1 bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent text-sm"
          />
          <button
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="text-ink/40 hover:text-accent text-sm mt-2"
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="text-sm text-accent hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-sm text-ink/50 italic">None listed.</p>;
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="text-accent">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SignatureCard({
  label,
  role,
  name,
  signature,
  onSign,
  buttonLabel,
  accent,
}: {
  label: string;
  role: string;
  name: string;
  signature: import("@/lib/ipe").IPESignature;
  onSign: () => void;
  buttonLabel: string;
  accent?: boolean;
}) {
  if (signature.signed) {
    return (
      <div className="border border-green-300 bg-green-50 rounded-lg p-4">
        <div className="text-xs uppercase tracking-wider text-green-800 mb-2">
          {label} ✓ Signed
        </div>
        <div
          className="text-xl font-semibold text-green-900 mb-2"
          style={{
            fontFamily: "'Brush Script MT', cursive",
            fontStyle: "italic",
          }}
        >
          {signature.signedBy}
        </div>
        <div className="text-xs text-green-900/70 border-t border-green-300 pt-2 mt-2">
          Digitally signed{" "}
          {new Date(signature.signedAt!).toLocaleString()}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`border rounded-lg p-4 ${
        accent ? "border-accent/40 bg-accent/5" : "border-ink/20 bg-cream"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-ink/60 mb-2">
        {label} signature required
      </div>
      <div className="text-sm text-ink/80 mb-1">{name}</div>
      <div className="text-xs text-ink/50 mb-4">{role}</div>
      <div className="border-b-2 border-dashed border-ink/30 h-10 mb-3 flex items-end pb-1 text-xs text-ink/40 italic">
        ✍️ Awaiting signature
      </div>
      <button
        onClick={onSign}
        className={`w-full px-4 py-2.5 rounded font-semibold text-sm ${
          accent
            ? "bg-accent text-cream"
            : "bg-ink text-cream"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function StatusBadge({ status, large }: { status: IPEStatus; large?: boolean }) {
  const styles: Record<IPEStatus, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    "pending-client-signature": "bg-blue-100 text-blue-800",
    signed: "bg-green-100 text-green-800",
    active: "bg-purple-100 text-purple-800",
  };
  const labels: Record<IPEStatus, string> = {
    draft: "Draft",
    "pending-client-signature": "Pending client signature",
    signed: "Signed",
    active: "Active",
  };
  return (
    <span
      className={`uppercase tracking-wider font-semibold rounded-full ${large ? "text-sm px-3 py-1.5" : "text-[10px] px-2 py-1"} ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
