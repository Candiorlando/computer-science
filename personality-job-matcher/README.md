# Career Compass

A personality-and-interest-based career matcher with an AI career coach. Built with Next.js 14, TypeScript, Tailwind, and the Claude API.

**This is an educational tool. It is not a substitute for a licensed vocational rehabilitation counselor, career counselor, or other qualified professional.** See the disclaimers in the app footer and on every page.

## What it does

1. **Intake** — short form gathers education, work history, location, constraints (including disability-related), and goals. Stored only in browser `localStorage`.
2. **Assessments** — two validated, public-domain instruments:
   - **Mini-IPIP Big Five** (Donnellan et al., 2006) — 20 items measuring Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.
   - **Holland RIASEC interests** — 24 items adapted from the public-domain O*NET Interest Profiler.
3. **Matches** — ranks ~60 curated O*NET occupations against your RIASEC profile (cosine-style fit). Filter by "no degree required" or "apprenticeship paths." Each match links to live openings on CareerOneStop, apprenticeship listings on apprenticeship.gov, and the full O*NET profile.
4. **AI coach** — chat with Claude Opus 4.7 about applications, training, accommodations, trajectory. Profile is sent with each turn (toggleable). Hard rules in the system prompt prevent it from posing as a licensed counselor.

## Data sources (all free / public-domain)

- [O*NET 28.0](https://www.onetcenter.org/database.html) — US Dept of Labor occupation database
- [O*NET Interest Profiler](https://www.onetonline.org/explore/interests/) — RIASEC items
- [IPIP](https://ipip.ori.org/MiniIPIP.htm) — Mini-IPIP Big Five items (public domain)
- [apprenticeship.gov](https://www.apprenticeship.gov/) — registered apprenticeship listings
- [CareerOneStop](https://www.careeronestop.org/) — local job openings (optional API; falls back to web search UI)
- [askjan.org](https://askjan.org/) — Job Accommodation Network (referenced by the coach)

## Setup

```bash
cd personality-job-matcher
npm install
cp .env.local.example .env.local
# Edit .env.local — at minimum set ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required? | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** for coach | Coach uses Claude Opus 4.7. Without this, every other page works but the coach returns a friendly error. |
| `CAREERONESTOP_USER_ID` | No | Live in-app job results. Get one free at careeronestop.org/Developers. |
| `CAREERONESTOP_TOKEN` | No | Pairs with `CAREERONESTOP_USER_ID`. |

Without CareerOneStop credentials, "Find openings" links open the public CareerOneStop search instead of fetching results in-app.

## What's intentionally not in v1

- **No backend / no database / no accounts.** Profile lives in `localStorage`. Better for privacy, but doesn't persist across devices.
- **No voice mode.** Easy add via Web Speech API (`SpeechRecognition` for input, `speechSynthesis` for output) — wire it into `app/coach/page.tsx`.
- **No RAG over state VR program PDFs.** The coach knows the *categories* (state VR, JAN, apprenticeship.gov) and points users at the right authority rather than making up specifics.
- **No paid job APIs** (Adzuna, JobSpikr, LinkedIn). CareerOneStop is the legal, free starting point. If you want richer results, plug them in at `app/api/local-jobs/route.ts`.

## Architecture notes

- **Big Five and RIASEC are scored client-side** (`lib/assessments.ts`). No PII leaves the browser at this stage.
- **Occupation matching is client-side** too (`lib/onet-data.ts` ranking against the user's RIASEC vector). This means the matches page works offline once loaded.
- **The coach is the only network call to a model.** Prompt caching is enabled on the system prompt (~1.5K tokens) so repeated turns are cheap.
- **Streaming.** Coach uses raw `text/plain` streaming (one byte chunk per delta) to keep the UI simple. No SSE framing required.

## Disclaimers and safety

The app surfaces disclaimers in:
- Site footer (every page)
- `<Disclaimer>` component on intake, results, and coach pages
- Coach's system prompt forbids posing as a licensed counselor and requires referrals to human professionals (CRC counselors, askjan.org, state VR, employment attorneys) for licensed-territory questions
- Privacy note on the coach page about what gets sent to the Claude API

## License

MIT for the application code. The bundled IPIP items are public domain. O*NET data is in the public domain (US Government work).
