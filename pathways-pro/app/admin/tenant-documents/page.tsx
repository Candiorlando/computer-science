"use client";

// Tenant legal & business document repository — the Tenant Administrator's
// view of their agency's contract, policies, privacy practices, and
// liability disclaimer with Pathways Pro. Master Admin can view (business/
// contractual, not client PHI) but not edit; ordinary counselors have no
// access at all.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ShieldCheck, ScrollText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { loadSession } from "@/lib/session";
import { isTenantAdmin, isMasterAdmin } from "@/lib/rbac";
import { getTenant } from "@/lib/tenants";
import {
  loadTenantDocuments,
  isAcknowledged,
  acknowledgeDocument,
  TENANT_DOC_CATEGORY_LABELS,
  type TenantDocument,
  type TenantDocCategory,
} from "@/lib/tenant-documents";
import type { CounselorUser } from "@/lib/users";

const CATEGORY_ICON: Record<TenantDocCategory, React.ReactNode> = {
  contract: <FileText className="w-4 h-4" />,
  policy: <ScrollText className="w-4 h-4" />,
  "privacy-practice": <ShieldCheck className="w-4 h-4" />,
  disclaimer: <AlertTriangle className="w-4 h-4" />,
};

export default function TenantDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [selected, setSelected] = useState<TenantDocCategory>("contract");
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "counselor") return void router.replace("/portal");
    if (isTenantAdmin(s)) {
      setUser(s);
      setReadOnly(false);
    } else if (isMasterAdmin(s)) {
      // Platform admin can view the contractual relationship (business,
      // not clinical) but never edits or acknowledges on the tenant's
      // behalf.
      setUser(s);
      setReadOnly(true);
    } else {
      router.replace("/case-search");
    }
  }, [router]);

  const tenant = useMemo(() => (user ? getTenant(user.tenantId) : null), [user]);
  const docs = useMemo(
    () => (tenant ? loadTenantDocuments(tenant.id, tenant.name) : []),
    [tenant],
  );
  const activeDoc = docs.find((d) => d.category === selected);

  if (!user) return null;

  if (!tenant) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <div className="text-4xl" aria-hidden>
          📄
        </div>
        <h1 className="text-2xl font-semibold">No agency selected</h1>
        <p className="text-ink/65 text-sm">
          {isMasterAdmin(user)
            ? "Open a specific agency from Master Admin to review its documents."
            : "Your account is not currently associated with an agency tenant."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">
          {readOnly ? "Master Admin · Read Only" : "Tenant Administrator"}
        </p>
        <h1 className="text-3xl tracking-tight">Legal &amp; Business Documents</h1>
        <p className="text-ink/65 text-sm">
          {tenant.name}&rsquo;s contract, policies, privacy practices, and liability
          disclaimer with Pathways Pro.
        </p>
      </header>

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <nav aria-label="Document categories" className="space-y-1">
          {(Object.keys(TENANT_DOC_CATEGORY_LABELS) as TenantDocCategory[]).map((cat) => {
            const doc = docs.find((d) => d.category === cat);
            const ack = doc ? isAcknowledged(tenant.id, doc.id) : null;
            return (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                aria-current={selected === cat ? "true" : undefined}
                className={[
                  "w-full flex items-center gap-2 text-left px-3 py-2.5 min-h-[44px] rounded-md text-sm transition-colors",
                  selected === cat
                    ? "bg-accent text-cream font-semibold"
                    : "hover:bg-ink/5 text-ink/80",
                ].join(" ")}
              >
                {CATEGORY_ICON[cat]}
                <span className="flex-1">{TENANT_DOC_CATEGORY_LABELS[cat]}</span>
                {ack && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Acknowledged" />}
              </button>
            );
          })}
        </nav>

        {activeDoc && (
          <article className="saas-card space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold">{activeDoc.title}</h2>
                <p className="text-xs text-ink/55">
                  Version {activeDoc.version} · Effective {activeDoc.effectiveDate}
                </p>
              </div>
              {(() => {
                const ack = isAcknowledged(tenant.id, activeDoc.id);
                if (ack) {
                  return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged {new Date(ack.acknowledgedAt).toLocaleDateString()}
                    </span>
                  );
                }
                if (readOnly) {
                  return (
                    <span className="text-xs text-ink/45 px-3 py-1.5">
                      Not yet acknowledged by tenant
                    </span>
                  );
                }
                return (
                  <button
                    onClick={() => {
                      acknowledgeDocument(tenant.id, activeDoc.id, user.email);
                      forceRerender((n) => n + 1);
                    }}
                    className="min-h-[44px] px-4 rounded-md grad-tealblue text-white text-sm font-semibold"
                  >
                    Acknowledge on behalf of {tenant.name}
                  </button>
                );
              })()}
            </div>

            <div className="prose-narrow text-sm text-ink/80 leading-relaxed space-y-3">
              {activeDoc.body.split("\n\n").map((para, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>

            <p className="text-xs text-ink/45 border-t border-ink/10 pt-3">
              Working document for the pilot program, provided for transparency — not
              legal advice. Review with Agency&rsquo;s own counsel before relying on it.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
