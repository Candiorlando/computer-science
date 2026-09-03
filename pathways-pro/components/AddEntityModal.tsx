"use client";

import { useState } from "react";
import type { CounselorUser } from "@/lib/users";
import {
  registerClient,
  registerBusinessUser,
  registerVendorUser,
  registerPartnerUser,
  type VendorType,
  type BusinessScopeRole,
  type PartnerOrgType,
} from "@/lib/users";

/* ═══════════════════════════════════════════════════════════════════════
   AddEntityModal — counselor-initiated entity creation with invite email.

   The counselor selects an entity type from a dropdown; the form
   dynamically renders the fields specific to that type. On submit:
     1. Creates the entity profile (localStorage in demo; Prisma after migration)
     2. POSTs to /api/entities/invite to send a claim-your-profile email
     3. Refreshes the case-search list
═══════════════════════════════════════════════════════════════════════ */

type EntityType = "client" | "business" | "vendor" | "partner";

const ENTITY_LABELS: Record<EntityType, string> = {
  client: "Vocational Client",
  business: "Business Client",
  vendor: "Vendor / Service Provider",
  partner: "Employment Partner",
};

const VENDOR_TYPES: { value: VendorType; label: string }[] = [
  { value: "crp", label: "Community Rehabilitation Provider (CRP)" },
  { value: "forensic", label: "Forensic Vocational Expert" },
  { value: "ergonomic", label: "Ergonomic / AT Assessment" },
  { value: "legal-consult", label: "Legal Consultant" },
  { value: "training", label: "Training / ETPL Provider" },
];

const BUSINESS_ROLES: { value: BusinessScopeRole; label: string }[] = [
  { value: "hr_director", label: "HR Director" },
  { value: "risk_manager", label: "Risk Manager" },
  { value: "adjuster", label: "Workers' Comp Adjuster" },
  { value: "attorney", label: "Attorney" },
];

const PARTNER_ORG_TYPES: { value: PartnerOrgType; label: string }[] = [
  { value: "small-employer", label: "Small Employer" },
  { value: "corporate-hr", label: "Corporate / Enterprise HR" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "community-org", label: "Community Organization" },
  { value: "school-district", label: "School District (K-12)" },
  { value: "government", label: "Government Agency" },
  { value: "social-enterprise", label: "Social Enterprise" },
];

interface InitialValues {
  entityType?: EntityType;
  firstName?: string;
  lastName?: string;
  email?: string;
  orgName?: string;
}

interface Props {
  counselor: CounselorUser;
  onClose: () => void;
  onSuccess: () => void;
  // Pre-fills the form — e.g. from a public marketplace quote request the
  // counselor/agency is converting into a business client.
  initial?: InitialValues;
}

export function AddEntityModal({ counselor, onClose, onSuccess, initial }: Props) {
  const [entityType, setEntityType] = useState<EntityType>(initial?.entityType ?? "client");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Shared fields
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  // Client-specific
  const [dob, setDob] = useState("");
  const [goal, setGoal] = useState("");

  // Business-specific
  const [orgName, setOrgName] = useState(initial?.orgName ?? "");
  const [jobTitle, setJobTitle] = useState("");
  const [scopeRole, setScopeRole] = useState<BusinessScopeRole>("hr_director");

  // Vendor-specific
  const [credentials, setCredentials] = useState("");
  const [vendorOrgName, setVendorOrgName] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("crp");

  // Partner-specific
  const [partnerOrgName, setPartnerOrgName] = useState("");
  const [partnerTitle, setPartnerTitle] = useState("");
  const [partnerOrgType, setPartnerOrgType] =
    useState<PartnerOrgType>("small-employer");
  const [participatesCE, setParticipatesCE] = useState(false);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setDob("");
    setGoal("");
    setOrgName("");
    setJobTitle("");
    setScopeRole("hr_director");
    setCredentials("");
    setVendorOrgName("");
    setVendorType("crp");
    setPartnerOrgName("");
    setPartnerTitle("");
    setPartnerOrgType("small-employer");
    setParticipatesCE(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // 1. Create the entity profile
      let result: { ok: true } | { ok: false; error: string };
      const tempPassword = `Pw${Date.now().toString(36)}!`;

      switch (entityType) {
        case "client":
          result = registerClient({
            firstName,
            lastName,
            email,
            password: tempPassword,
            dob,
            goal,
          });
          break;
        case "business":
          result = registerBusinessUser({
            firstName,
            lastName,
            email,
            password: tempPassword,
            title: jobTitle,
            scopeRole,
            orgName,
          });
          break;
        case "vendor":
          result = registerVendorUser({
            firstName,
            lastName,
            email,
            password: tempPassword,
            credentials,
            vendorOrgName,
            vendorType,
          });
          break;
        case "partner":
          result = registerPartnerUser({
            firstName,
            lastName,
            email,
            password: tempPassword,
            title: partnerTitle,
            partnerOrgName,
            partnerOrgType,
            participatesInCustomizedEmployment: participatesCE,
          });
          break;
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // 2. Send invitation email
      const inviteRes = await fetch("/api/entities/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          firstName,
          lastName,
          email,
          counselorName: counselor.name,
          counselorEmail: counselor.email,
          organizationName:
            entityType === "business"
              ? orgName
              : entityType === "vendor"
                ? vendorOrgName
                : entityType === "partner"
                  ? partnerOrgName
                  : undefined,
        }),
      });

      const inviteData = await inviteRes.json();

      setSuccess(
        `${ENTITY_LABELS[entityType]} "${firstName} ${lastName}" created. ` +
          (inviteData.emailSent
            ? `Invitation sent to ${email}.`
            : `Invitation ready — email delivery requires SMTP configuration.`),
      );

      // 3. Refresh the case-search list after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-ink/50 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-entity-heading"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-ink/10">
          <div className="flex items-center justify-between">
            <h2
              id="add-entity-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Add to your network
            </h2>
            <button
              onClick={onClose}
              className="text-ink/40 hover:text-ink transition text-xl leading-none"
              aria-label="Close"
            >
              &#10005;
            </button>
          </div>
          <p className="text-sm text-ink/60 mt-1">
            Create a profile and send an invitation to claim access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Entity type selector */}
          <FormField label="Entity type">
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as EntityType);
                resetForm();
              }}
              className="entity-input"
            >
              {(Object.entries(ENTITY_LABELS) as [EntityType, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </FormField>

          {/* Shared: name + email */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="entity-input"
              />
            </FormField>
            <FormField label="Last name">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="entity-input"
              />
            </FormField>
          </div>

          <FormField label="Email address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="they will receive an invitation here"
              className="entity-input"
            />
          </FormField>

          {/* ── Client-specific ──────────────────────────────── */}
          {entityType === "client" && (
            <>
              <FormField label="Date of birth">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="entity-input"
                />
              </FormField>
              <FormField label="Employment goal (optional)">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Medical office administration"
                  className="entity-input"
                />
              </FormField>
            </>
          )}

          {/* ── Business-specific ────────────────────────────── */}
          {entityType === "business" && (
            <>
              <FormField label="Organization name">
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="entity-input"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Job title">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    placeholder="Director of HR"
                    className="entity-input"
                  />
                </FormField>
                <FormField label="Role">
                  <select
                    value={scopeRole}
                    onChange={(e) =>
                      setScopeRole(e.target.value as BusinessScopeRole)
                    }
                    className="entity-input"
                  >
                    {BUSINESS_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </>
          )}

          {/* ── Vendor-specific ──────────────────────────────── */}
          {entityType === "vendor" && (
            <>
              <FormField label="Vendor organization name">
                <input
                  type="text"
                  value={vendorOrgName}
                  onChange={(e) => setVendorOrgName(e.target.value)}
                  required
                  className="entity-input"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Vendor type">
                  <select
                    value={vendorType}
                    onChange={(e) =>
                      setVendorType(e.target.value as VendorType)
                    }
                    className="entity-input"
                  >
                    {VENDOR_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Credentials">
                  <input
                    type="text"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    placeholder="CRC, CVE, ATP..."
                    className="entity-input"
                  />
                </FormField>
              </div>
            </>
          )}

          {/* ── Partner-specific ─────────────────────────────── */}
          {entityType === "partner" && (
            <>
              <FormField label="Organization name">
                <input
                  type="text"
                  value={partnerOrgName}
                  onChange={(e) => setPartnerOrgName(e.target.value)}
                  required
                  className="entity-input"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Contact title">
                  <input
                    type="text"
                    value={partnerTitle}
                    onChange={(e) => setPartnerTitle(e.target.value)}
                    placeholder="Hiring Manager"
                    className="entity-input"
                  />
                </FormField>
                <FormField label="Organization type">
                  <select
                    value={partnerOrgType}
                    onChange={(e) =>
                      setPartnerOrgType(e.target.value as PartnerOrgType)
                    }
                    className="entity-input"
                  >
                    {PARTNER_ORG_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={participatesCE}
                  onChange={(e) => setParticipatesCE(e.target.checked)}
                  className="accent-accent w-4 h-4"
                />
                Participates in Customized Employment
              </label>
            </>
          )}

          {/* Status messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !!success}
              className="flex-1 bg-accent text-cream font-semibold py-2.5 rounded-md hover:bg-accent/90 transition disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : `Add ${ENTITY_LABELS[entityType]} & send invite`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-ink/15 rounded-md text-ink/70 hover:bg-ink/5 transition"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-ink/50 text-center">
            An email will be sent to {email || "the provided address"} with
            instructions to claim their profile and access the platform.
          </p>
        </form>

        <style jsx>{`
          :global(.entity-input) {
            width: 100%;
            background: white;
            border: 1px solid rgba(31, 29, 26, 0.2);
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
          :global(.entity-input:focus) {
            outline: none;
            border-color: #0f6b54;
          }
        `}</style>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
