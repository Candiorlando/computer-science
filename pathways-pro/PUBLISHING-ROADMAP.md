# Pathways Pro — Publishing Roadmap

Plan for taking Pathways Pro from web demo → real iOS / Android apps in the App Store and Google Play.

---

## Where you are today

- **Pathways Pro is a Next.js web app.** It runs in any browser.
- Auth is **mock** — credentials live in `lib/users.ts`, sessions in `localStorage`. No server.
- Assessment results & profile are stored **only in the user's browser**.
- The coach calls Anthropic from a Next.js API route — that's the only outbound network call.
- **HIPAA**: the footer claims it but the implementation isn't there yet. The labels are aspirational, not accurate, until everything below is done.

## What's between you and the App Store

You need **four things** done before submitting to either store. Doing fewer means real risk of rejection, or worse, a HIPAA incident.

| # | Block | Why it matters | Effort |
|---|---|---|---|
| 1 | Real backend + auth | Mock users can't ship. Counselors and clients need real accounts. | 2–4 weeks |
| 2 | HIPAA-compliant infrastructure | You're processing health-adjacent PII for people with disabilities. | 2–6 weeks |
| 3 | Mobile wrapper (Capacitor) | App stores only accept native binaries, not web URLs. | 1–2 weeks |
| 4 | Developer accounts + store metadata | Required submissions. | 1 week |

Total realistic timeline: **2–4 months** of work + **$500–1,500** first-year cost.

---

## Phase 1 — Real backend & auth (2–4 weeks)

Replace `lib/users.ts` mock + `localStorage` with a proper auth backend.

**Recommended stack** (lowest-friction for a solo developer, all sign HIPAA BAAs):

- **Supabase** ($25/mo Pro plan + HIPAA BAA) — PostgreSQL database + auth + row-level security in one. Works natively with Next.js.
- **Alternative**: Clerk + Vercel Postgres, or Auth0 + AWS RDS.

What you'll build:

- `users` table (counselors + clients, separate from auth user)
- `cases` table replacing the mock client list
- `assessments` table to persist Big Five + RIASEC results across devices
- `case_notes` table for counselor case management
- Row-level security: counselors only see their caseload, clients only see their own data
- Replace `loadSession()` / `saveSession()` with Supabase auth hooks
- Move `lib/users.ts` mock to `seed/users.sql` for dev environments only

## Phase 2 — HIPAA-compliant infrastructure (2–6 weeks)

This is the part most solo developers underestimate. Brief checklist:

**Legal & operational** (do these first — they take longer than the code):

- [ ] Designate a HIPAA Security Officer (can be you — but it's a named role)
- [ ] Designate a HIPAA Privacy Officer (also can be you)
- [ ] Write Notice of Privacy Practices (NPP) — give it to every user at signup
- [ ] Write Business Associate Agreements (BAAs) with every sub-processor: Supabase, Vercel, Anthropic, Sentry, etc.
- [ ] Annual HIPAA risk assessment (NIST 800-66 is the reference)
- [ ] Breach notification policy and incident response plan
- [ ] Workforce HIPAA training (for you and anyone you hire)
- [ ] 6-year retention policy for PHI access logs

**Technical** (the engineering work):

- [ ] Encryption at rest (Postgres TDE — Supabase handles this) and in transit (TLS 1.2+ everywhere)
- [ ] Audit logging: who accessed what PHI when, retained 6 years
- [ ] Automatic session timeout (15 min inactive)
- [ ] MFA for counselor accounts (required by most state VR agencies in 2026)
- [ ] Backups + tested restore procedure
- [ ] Disable the coach's "share my profile" toggle by default; require explicit per-message opt-in
- [ ] Anthropic API: route through your backend, never expose API keys in mobile bundle
- [ ] Review the Anthropic BAA — Anthropic does sign BAAs for Claude on AWS Bedrock; the direct API has different terms

**Sub-processor BAAs you'll specifically need**:

| Service | Signs BAA? | Cost |
|---|---|---|
| Supabase Pro | Yes ($25/mo + HIPAA add-on) | ~$599/mo for HIPAA tier |
| Vercel Enterprise | Yes | Contact sales (~$400+/mo) |
| AWS / Google Cloud | Yes (free, just sign) | $50–200/mo for small load |
| Anthropic (Claude on Bedrock) | Yes via AWS Bedrock | Pay per token |
| Twilio (if you add SMS) | Yes | Pay per message |

> 💡 **Cost-effective alternative**: host on AWS yourself. AWS signs BAAs for free, and EC2/RDS/S3 are HIPAA-eligible. Trade more setup work for ~$100/mo instead of $600+.

## Phase 3 — Mobile wrapper with Capacitor (1–2 weeks)

This is the easy part. Capacitor wraps your existing Next.js app as a native iOS/Android app — no rewrite.

```bash
cd pathways-pro
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Pathways Pro" "app.pathwayspro.app"
```

Add to `next.config.js`:

```js
module.exports = { output: "export" };
```

Build & wrap:

```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

Then open Xcode (`npx cap open ios`) or Android Studio (`npx cap open android`) for the actual build & signing.

**You'll need**:

- A Mac (for iOS — required, no way around it)
- Xcode (free)
- Android Studio (free)
- 1–2 days for app icons (1024x1024 + variants) and splash screens

**Trade-offs**:

- ✅ Same codebase for web, iOS, Android
- ✅ Hot-reload during development
- ❌ Some native features (background location, advanced biometrics) need plugins
- ❌ Larger binary than a true native app

## Phase 4 — Developer accounts & store submission (1 week of waiting)

### Apple Developer Program

- **Cost**: $99/year
- **Sign up**: developer.apple.com → "Enroll"
- **Required**: Valid Apple ID, government ID, credit card, U.S. tax info (W-9)
- **For an LLC**: D-U-N-S number (free from Dun & Bradstreet, takes 1–2 weeks)
- **Review time**: 24–48 hours for most apps; longer for medical-adjacent

**App Store requirements**:

- Privacy policy URL (host on your own site)
- App Privacy "nutrition label" — declare every type of data collected, who it's shared with
- Screenshots at multiple device sizes (use Xcode simulator)
- App description, keywords, support URL
- Age rating questionnaire
- Category: **Medical** or **Health & Fitness** — both trigger extra scrutiny

**Likely review questions you'll get**:

- "Are you a HIPAA-covered entity or business associate?" → yes
- "What credentials does the user need to operate this professionally?" → CRC / LPC
- "Is medical data transmitted off-device?" → yes, to backend
- "Provide BAA documentation for any sub-processors handling PHI"

### Google Play Console

- **Cost**: $25 one-time
- **Sign up**: play.google.com/console
- **Required**: Government ID, credit card, "Personal" or "Organization" account choice
- **Review time**: 1–7 days for new accounts; later much faster

Google asks for similar metadata as Apple but is less strict on medical-app review. **However**: Google Play Family Programs and Health policies have specific rules about apps that mention disability — review them at play.google.com/about/developer-content-policy.

---

## Estimated total cost (first year)

| Item | Cost |
|---|---|
| Apple Developer Program | $99 |
| Google Play Console | $25 (one-time) |
| Supabase Pro + HIPAA | $599/mo × 12 = $7,188 (or self-host AWS for ~$1,200) |
| Anthropic API (estimated low usage) | $20–100/mo |
| Domain (pathwayspro.app) | $20/yr |
| SSL certificate | Free (Let's Encrypt) |
| HIPAA risk assessment (consultant) | $1,500–5,000 one-time (DIY: $0 + your time) |
| **Total Year 1 (low estimate)** | **~$2,800** |
| **Total Year 1 (Supabase HIPAA tier)** | **~$9,300** |

## Decision tree — what to actually do first

```
Is Pathways Pro a hobby/portfolio project?
├── YES → Deploy to Vercel free tier, drop HIPAA claims from footer,
│         add "Demo only — not for real PHI" banner. Done in 2 hours.
│
└── NO, this is your product
    │
    Do you have 1+ year runway to build it properly?
    ├── YES → Phase 1 → 2 → 3 → 4 in order. Don't skip Phase 2.
    │
    └── NO, you want revenue in <6 months
        │
        Target: VR agencies as B2B SaaS, not app stores
        ├── Skip Phase 3 + 4 entirely
        ├── Do Phase 1 + 2 (backend + HIPAA)
        ├── Sell to one Illinois DRS office as a pilot
        └── Use that revenue/case study to fund Phase 3 later
```

## Things I want to flag

1. **Your HIPAA exposure is real.** If you put one real client's name + disability + benefits info into the current build and it leaks, that's a reportable breach. The mock-data demo is safe; turning it on real users is not.

2. **App Stores are not the easiest distribution.** State VR agencies typically deploy software via their internal IT, not the App Store. If your customer is IDHS-DRS, you may never need the App Store — you'd need a SOC 2 report and state procurement paperwork instead.

3. **Capacitor is fine but not required.** If most users are on desktop (likely for counselors), keep it web. Build native later when client-side use cases justify it.

4. **The "HIPAA-compliant" claim in the footer should come off** until Phase 2 is done. As-is, it's marketing copy that creates legal exposure.

---

## Recommended next step

If you want to get to "real" — start with **Phase 1** (real backend + auth on Supabase) **and** remove the HIPAA claim from the footer. That's 2–4 weeks of work and unblocks everything else.

I can scaffold Phase 1 (Supabase schema, auth wiring, replacing `lib/users.ts`) whenever you're ready — just say the word.
