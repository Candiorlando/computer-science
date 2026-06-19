"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { loadCaseNotes, type CaseNote } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";

export default function CaseNotesIndex() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setUser(s);
    setNotes(filterForUser(s));
  }, [router]);

  if (!user) return null;

  const subtitle = user.role === "counselor"
    ? "Auto-generated DAP notes across every action your clients and business partners have taken."
    : user.role === "client"
      ? "A read-only audit log of the platform actions tied to your case."
      : "Read-only log of actions tied to your organization's case file.";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Case Notes
        </p>
        <h1 className="text-3xl font-semibold">
          DAP-format documentation feed
        </h1>
        <p className="text-ink/70 mt-1 prose-narrow">{subtitle}</p>
      </header>

      <CaseNotesPanel
        notes={notes}
        title=""
        emptyLabel="No case notes recorded for your account yet."
      />
    </div>
  );
}

function filterForUser(user: AnyUser): CaseNote[] {
  const all = loadCaseNotes();
  if (user.role === "counselor") return all;
  if (user.role === "client" && "caseId" in user) {
    return all.filter((n) => n.clientCaseId === user.caseId);
  }
  if (user.role === "business" && "orgId" in user) {
    return all.filter((n) => n.businessOrgId === user.orgId);
  }
  if (user.role === "vendor" && "vendorOrgId" in user) {
    return all.filter((n) => n.businessOrgId === user.vendorOrgId);
  }
  return [];
}
