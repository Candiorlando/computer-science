# Pathways Pro Ecosystem Entity Profiles and Access Manual

**Internal operations document. Not for public marketing.**

## Design principle

Each profile receives only the features required for its approved work, contractual authority, tenant membership, assigned cases, and explicit record shares. Feature visibility is not authorization: server-side tenant, role, assignment, and share checks remain mandatory.

## 1. Corporate Master Administrator

**Typical entity:** Pathways Pro corporate owner/operator.

**Authority:** Creates and manages state, city, agency, and individual counselor tenants; assigns tenant administrators; configures contracted counselor and active-case capacity; manages platform pricing, contracts, global operations, and aggregate analytics.

**Limitations:** Must not access tenant PHI, client case notes, assessments, IPEs, or provider records unless separately provisioned as a normal tenant user for that purpose.

**Automatic workspace:** Master Admin, Pricing Engine, tenant provisioning, contract capacity views, aggregate operational analytics.

## 2. State or City Agency Administrator

**Typical entity:** State VR agency, municipal workforce office, public rehabilitation authority.

**Authority:** Tenant-scoped administrative oversight; may create or remove approved tenant staff up to contract limits, manage agency settings, monitor agency caseloads, coordinate approved community providers, and restrict lower-level staff access.

**Limitations:** Cannot access another tenant’s data; cannot exceed agreed counselor/case capacity; must apply least-privilege access; may not use corporate pricing or Master Admin tools.

**Automatic workspace:** Oversight case search, agency caseload views, approved provider coordination, compliance/reporting tools, tenant user management, contract/document access when authorized.

## 3. Community Rehabilitation Provider / Agency Administrator

**Typical entity:** CRP, nonprofit provider, transition program, supported employment agency.

**Authority:** Manages counselors and assigned clients inside its own tenant, coordinates approved service orders and partner interactions, and manages agency-level workflow within contract limits.

**Limitations:** No access to state/city client records outside shared or assigned authority; no platform-level pricing or tenant provisioning.

**Automatic workspace:** Caseload, case notes, approved IPE/assessment workflows, service orders, partner coordination, scheduling, agency reports.

## 4. Rehabilitation Counselor / Individual Practitioner

**Typical entity:** State counselor, CRP counselor, vocational evaluator, workers’ compensation vocational specialist, forensic provider, transition specialist.

**Authority:** Manages only assigned cases and approved business/provider relationships. A solo practitioner may administer their own practice where contractually enabled.

**Limitations:** No tenant-wide user administration unless designated tenant admin; no access to unassigned cases; no external records without a valid share.

**Automatic workspace:** Case search, caseload, case notes, IPEs, assessments, scheduling, AI-assisted documentation drafts, self-advocacy resources for assigned clients, approved service coordination.

## 5. Vocational Client

**Typical entity:** Individual receiving vocational rehabilitation, transition, workers’ compensation, or related support.

**Authority:** Views only their own approved plan, appointments, courses, documents, messages, progress, and self-advocacy resources.

**Limitations:** Cannot view other clients, provider internal notes, agency administration, billing, or unshared partner data.

**Automatic workspace:** My Vocational Journey, appointments, assigned courses, self-advocacy, shared documents, secure messages, benefits and progress resources.

## 6. Business / Corporate Partner

**Typical entity:** Employer, HR team, workers’ compensation employer, corporate accommodation client.

**Authority:** Views approved service orders, shared documents, placement/engagement information, and requested consulting services. May opt into employment partnership programming.

**Intake classification:** Industry; requested business services; whether it seeks accommodation consulting, return-to-work support, inclusive hiring, forensic services, retention support, or EAP coordination; optional employment-partner opt-in.

**Limitations:** Cannot view client PHI or unshared case data; only receives record-level information explicitly shared through the service relationship.

**Automatic workspace:** Business Portal, service orders, documents explicitly shared with the organization, secure messages, accounts payable if authorized.

## 7. Employment Partner

**Typical entity:** Employer, internship host, social enterprise, community organization, education partner.

**Intake classification:** Industry, organization size, program selections, 1–20 placement opportunity capacity, accommodation capabilities, placement limitations/expectations, requested provider support, optional public directory listing.

**Program choices:** Student disability internships; short-term work experience; first-time employment exposure; supported employment; customized employment; veteran pathway; incumbent worker disability adjustment; accessibility and values adoption.

**Accommodation capabilities:** Developmental/cognitive/intellectual disability support; veterans; new disability adjustment; mobility and wheelchair access; limited hand use/cerebral palsy; brain injury; sensory/neurodivergent/mental health accommodations.

**Limitations:** Cannot browse client records; sees only approved opportunities, placements, documents, messages, and explicitly shared support materials.

**Automatic workspace:** Employment Partner Portal, opportunities, supported employment coordination, shared documents, secure messages, accommodation requests when authorized.

## 8. Vendor / Specialized Service Provider

**Typical entity:** Vocational evaluator, job coach, benefits planner, assistive technology specialist, training provider, forensic evaluator, accommodation consultant.

**Authority:** Receives and completes approved service orders only; can provide deliverables, documentation, and secure messages related to authorized work.

**Limitations:** No unrelated client records, agency administration, general caseload access, or billing authority beyond approved service relationships.

**Automatic workspace:** Vendor Portal, service orders, offered services, shared documents, secure messages, settings.

## Provisioning decision flow

1. Classify entity and legal/contract relationship.
2. Identify tenant and administrator authority.
3. Capture specialty, industry, requested services, and employment-partner program choices.
4. Evaluate contract limits, assignment boundaries, record shares, and data sensitivity.
5. Provision only relevant workspace features.
6. Re-review permissions when a user changes role, employer, tenant, contract status, or assignment.

## Security controls

- Tenant ID included in every tenant-owned query.
- Counselor access limited to assigned cases unless tenant admin authority is explicitly granted.
- External entities use record-level shares; access expires when the relationship ends.
- Corporate Master Admin controls platform/contract administration but does not receive tenant PHI by default.
- UI visibility is supplemented by API/database authorization enforcement.
