"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { loadPartnerOrgs } from "@/lib/employment-partners";
import { getAssessmentTool } from "@/lib/assessment-tools";
import { AssessmentRunner } from "@/components/AssessmentRunner";

export default function PartnerAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = String(params.id);
  const toolId = String(params.toolId);
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const org = useMemo(() => loadPartnerOrgs()[partnerId], [partnerId]);
  const tool = useMemo(() => getAssessmentTool(toolId), [toolId]);

  if (!user) return null;
  if (!org || !tool) {
    return (
      <div className="space-y-3">
        <Link
          href={`/dashboard/partners/${partnerId}`}
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Back to case
        </Link>
        <h1 className="text-2xl">Not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/dashboard/partners/${partnerId}`}
          className="text-xs text-emerald-700 hover:underline mb-1 inline-block"
        >
          ← Back to {org.legalName}
        </Link>
        <p className="text-xs uppercase tracking-widest text-ink/55 mt-1">
          Administering · {tool.title}
        </p>
        <h1 className="text-2xl font-semibold mt-1">
          {tool.title} — {org.legalName}
        </h1>
      </header>

      <AssessmentRunner
        tool={tool}
        scopeKind="partner-org"
        scopeId={partnerId}
        administeredByEmail={user.email}
        administeredByName={user.name}
        onComplete={() => {
          setTimeout(() => router.push(`/dashboard/partners/${partnerId}`), 1200);
        }}
      />
    </div>
  );
}
