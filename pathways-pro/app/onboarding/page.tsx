"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ACCOMMODATION_CAPABILITIES,
  BUSINESS_INDUSTRIES,
  BUSINESS_SERVICE_INTERESTS,
  INDUSTRY_SECTORS,
  PARTNERSHIP_PROGRAMS,
  REHABILITATION_TITLES,
  ROLE_LABELS,
  ROLES,
  VENDOR_SERVICES,
  type OnboardingRole,
} from "@/lib/onboarding-constants";
import { ENTITY_TYPES } from "@/lib/ecosystem-profiles";
import { onboardingSchema } from "@/lib/onboarding-schema";

const ORG_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,001+"];

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const demoMode = searchParams.get("mode") === "demo";
  const [role, setRole] = useState<OnboardingRole>("COUNSELOR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [entityType, setEntityType] = useState("rehabilitation_provider");
  const [rehabilitationTitle, setRehabilitationTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [businessServices, setBusinessServices] = useState<string[]>([]);
  const [employmentPartner, setEmploymentPartner] = useState(false);
  const [orgSize, setOrgSize] = useState("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [placements, setPlacements] = useState(1);
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [partnerDetails, setPartnerDetails] = useState("");
  const [supportNeeds, setSupportNeeds] = useState("");
  const [publicDirectory, setPublicDirectory] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isBusiness = role === "BUSINESS";
  const isProvider = role === "COUNSELOR";
  const isVendor = role === "VENDOR";

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((current) => current.includes(value) ? current.filter((x) => x !== value) : [...current, value]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const payload = {
      role, name, email, password, sector: role === "CLIENT" ? undefined : sector,
      jobTitle: role === "CLIENT" ? undefined : jobTitle, organizationName, entityType,
      rehabilitationTitle, industry, services, businessServiceInterests: businessServices,
      employmentPartnerOptIn: employmentPartner, organizationSize: orgSize || undefined,
      partnershipPrograms: programs, placementOpportunities: employmentPartner ? placements : undefined,
      accommodationCapabilities: accommodations, partnerDetails, supportNeeds,
      publicDirectoryOptIn: publicDirectory, termsAccepted,
    };
    const parsed = onboardingSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { const key = String(issue.path[0] ?? "form"); if (!next[key]) next[key] = issue.message; });
      setErrors(next); return;
    }
    const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
    if (!res.ok) { setErrors({ form: "Unable to submit your profile." }); return; }
    setSubmitted(true);
  }

  if (submitted) return <div className="max-w-3xl mx-auto py-16 px-6 space-y-5"><h1 className="text-3xl font-bold text-ink">{demoMode ? "Demo profile complete." : "Profile submitted for review."}</h1><p className="text-ink/65">{demoMode ? "No production account was created. This preview shows how Pathways Pro classifies an entity and recommends a role-appropriate workspace." : "Your entity classification and requested profile have been captured. A platform or tenant administrator will provision the access appropriate to your role, contract, service relationship, and approved data scope."}</p></div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <header className="space-y-3"><p className="text-xs uppercase tracking-widest text-accent font-bold">{demoMode ? "Demo Entity Setup" : "Profile & Ecosystem Intake"}</p><h1 className="text-4xl tracking-tight">Set up your workspace.</h1><p className="text-ink/70">{demoMode ? "Explore the sign-up questions used to prepare an entity profile. This demo does not create a production account." : "Tell us about your entity, authority, services, and partnership interests so we can prepare your account for administrator review."}</p></header>
      <form onSubmit={submit} className="space-y-7">
        <Section title="1. Identity & Entity Classification">
          <ChoiceRow label="I am joining as" values={ROLES} selected={role} onChange={(v) => { setRole(v as OnboardingRole); setEntityType(v === "CLIENT" ? "vocational_client" : v === "PARTNER" ? "employment_partner" : v === "VENDOR" ? "vendor" : v === "BUSINESS" ? "business_partner" : "rehabilitation_provider"); }} labels={ROLE_LABELS} />
          <div className="grid sm:grid-cols-2 gap-4"><Input label="Full name" value={name} setValue={setName} error={errors.name} /><Input label="Work email" value={email} setValue={setEmail} error={errors.email} type="email" /><Input label="Organization / practice name" value={organizationName} setValue={setOrganizationName} /><Input label="Password" value={password} setValue={setPassword} error={errors.password} type="password" /></div>
          <Select label="Entity type" value={entityType} setValue={setEntityType} options={ENTITY_TYPES.map((x) => ({ value: x.value, label: x.label }))} error={errors.entityType} />
        </Section>
        {role !== "CLIENT" && <Section title="2. Professional Classification"><div className="grid sm:grid-cols-2 gap-4"><Select label="Industry sector" value={sector} setValue={setSector} options={INDUSTRY_SECTORS} error={errors.sector} /><Input label="Current title" value={jobTitle} setValue={setJobTitle} error={errors.jobTitle} /></div>{isProvider && <Select label="Rehabilitation specialty" value={rehabilitationTitle} setValue={setRehabilitationTitle} options={REHABILITATION_TITLES.map((x) => ({ value: x, label: x }))} />}{isBusiness && <Select label="Business industry" value={industry} setValue={setIndustry} options={BUSINESS_INDUSTRIES.map((x) => ({ value: x, label: x }))} />}</Section>}
        {(isVendor || isBusiness) && <Section title="3. Services & Engagement"><CheckboxGroup label={isVendor ? "Services you provide" : "Business services you want to receive"} items={isVendor ? VENDOR_SERVICES : BUSINESS_SERVICE_INTERESTS} selected={isVendor ? services : businessServices} onToggle={(x) => toggle(isVendor ? setServices : setBusinessServices, x)} error={isVendor ? errors.services : undefined} /></Section>}
        {(isBusiness || role === "PARTNER") && <Section title="4. Employment Partner Opt-In"><Toggle checked={employmentPartner} setChecked={setEmploymentPartner} label="We want to participate as an employment partner" description="Optional opt-in. Partner participation may qualify an organization for partnership or pricing incentives where contractually available." />{employmentPartner && <div className="space-y-5 pt-4"><div className="grid sm:grid-cols-2 gap-4"><Select label="Organization size" value={orgSize} setValue={setOrgSize} options={ORG_SIZES.map((x) => ({ value: x, label: `${x} employees` }))} error={errors.organizationSize} /><Select label="Placement opportunities" value={String(placements)} setValue={(x) => setPlacements(Number(x))} options={Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} opportunity${i ? "ies" : ""}` }))} error={errors.placementOpportunities} /></div><CheckboxGroup label="Programs you want to offer" items={PARTNERSHIP_PROGRAMS} selected={programs} onToggle={(x) => toggle(setPrograms, x)} error={errors.partnershipPrograms} /><CheckboxGroup label="Accommodation capabilities your workplace can support" items={ACCOMMODATION_CAPABILITIES} selected={accommodations} onToggle={(x) => toggle(setAccommodations, x)} /><Textarea label="Placement details, limitations, expectations, or accommodations" value={partnerDetails} setValue={setPartnerDetails} placeholder="Describe work environments, limits, schedule expectations, placement design, and any other relevant details." /><Textarea label="Support requested from rehabilitation providers" value={supportNeeds} setValue={setSupportNeeds} placeholder="Describe resources, networking, job coaching, support materials, communication, or provider involvement you expect." /><Toggle checked={publicDirectory} setChecked={setPublicDirectory} label="List our partnership profile publicly" description="Optional. Your organization may be shown as an accommodation, inclusion, and accessibility-minded partner after administrator review." /></div>}</Section>}
        <label className="flex gap-3 text-sm text-ink/70 items-start"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1" /><span>I accept the <a href="/terms" className="text-accent underline">Terms of Service and User Consent Agreement</a> and confirm that the information provided is accurate.</span></label>{errors.termsAccepted && <p className="text-sm text-red-600">{errors.termsAccepted}</p>}{errors.form && <p className="text-sm text-red-600">{errors.form}</p>}<button className="w-full bg-accent text-white font-semibold py-3 rounded-lg">{demoMode ? "Preview My Entity Workspace" : "Submit Profile for Provisioning"}</button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="bg-white border border-ink/10 rounded-2xl p-6 space-y-5"><h2 className="font-bold text-ink">{title}</h2>{children}</section>; }
function Input({ label, value, setValue, error, type = "text" }: { label: string; value: string; setValue: (x: string) => void; error?: string; type?: string }) { return <label className="space-y-1 block"><span className="text-xs font-bold text-ink/60">{label}</span><input type={type} value={value} onChange={(e) => setValue(e.target.value)} className="onb-input" />{error && <span className="text-xs text-red-600">{error}</span>}</label>; }
function Textarea({ label, value, setValue, placeholder }: { label: string; value: string; setValue: (x: string) => void; placeholder: string }) { return <label className="space-y-2 block w-full"><span className="text-xs font-bold text-ink/60">{label}</span><textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="onb-input w-full min-h-[180px] resize-y leading-relaxed" /></label>; }
function Select({ label, value, setValue, options, error }: { label: string; value: string; setValue: (x: string) => void; options: readonly { readonly value: string; readonly label: string }[]; error?: string }) { return <label className="space-y-1 block"><span className="text-xs font-bold text-ink/60">{label}</span><select value={value} onChange={(e) => setValue(e.target.value)} className="onb-input"><option value="">Select…</option>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{error && <span className="text-xs text-red-600">{error}</span>}</label>; }
function ChoiceRow({ label, values, selected, onChange, labels }: { label: string; values: readonly string[]; selected: string; onChange: (x: string) => void; labels: Record<string, string> }) { return <fieldset><legend className="text-xs font-bold text-ink/60 mb-2">{label}</legend><div className="grid sm:grid-cols-3 gap-2">{values.map((v) => <button type="button" key={v} onClick={() => onChange(v)} className={`rounded-lg p-3 text-sm text-left border ${selected === v ? "border-accent bg-accent/10 text-accent font-semibold" : "border-ink/10 text-ink/70"}`}>{labels[v]}</button>)}</div></fieldset>; }
function CheckboxGroup({ label, items, selected, onToggle, error }: { label: string; items: readonly string[]; selected: string[]; onToggle: (x: string) => void; error?: string }) { return <fieldset className="space-y-2"><legend className="text-xs font-bold text-ink/60">{label}</legend><div className="grid sm:grid-cols-2 gap-2">{items.map((item) => <label key={item} className="flex gap-2 text-sm text-ink/70"><input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} />{item}</label>)}</div>{error && <p className="text-xs text-red-600">{error}</p>}</fieldset>; }
function Toggle({ checked, setChecked, label, description }: { checked: boolean; setChecked: (x: boolean) => void; label: string; description: string }) { return <label className="flex gap-3 p-4 bg-cream rounded-xl cursor-pointer"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1" /><span><span className="font-semibold text-ink block">{label}</span><span className="text-sm text-ink/60">{description}</span></span></label>; }
