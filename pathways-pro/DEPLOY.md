# Deploying Pathways Pro to Vercel

Get the app live on a public URL in about 5 minutes. No special config needed — Vercel auto-detects Next.js.

## What you'll get

- A live URL like `pathways-pro-xxx.vercel.app` (or your own domain if you want)
- Auto-deploys on every push to `main` / your chosen branch
- Free for personal projects (Hobby tier)
- Every PR gets its own preview URL
- HTTPS automatic

## Before you start

You need:

- [ ] A GitHub account that owns or has access to `Candiorlando/computer-science`
- [ ] (Optional) An Anthropic API key for the AI coach — get one at https://console.anthropic.com → Settings → API Keys
- [ ] (Optional) CareerOneStop API credentials for in-app job listings — register free at https://www.careeronestop.org/Developers/WebAPI/registration.aspx

You **don't** need: a credit card, a Mac, Xcode, Apple/Google developer accounts, any installs.

## Steps

### 1. Sign up at Vercel

Go to **https://vercel.com/signup** → "Continue with GitHub". Authorize the Vercel app for your GitHub account.

### 2. Import the repo

On your Vercel dashboard, click **Add New → Project**. Pick `Candiorlando/computer-science` from the list.

### 3. Configure the project

This is the only step that matters:

| Field | Value |
|---|---|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `pathways-pro` ← **important, click "Edit" to set this** |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

The root directory matters because the repo has `pathways-pro/` as a subdirectory — Vercel needs to know to build from inside it, not from the repo root.

### 4. Add environment variables (optional)

Under **Environment Variables**, add:

| Name | Value | Required? |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Only if you want the coach to work |
| `CAREERONESTOP_USER_ID` | (from registration) | Only for in-app job listings |
| `CAREERONESTOP_TOKEN` | (from registration) | Pairs with USER_ID |

Skip them all if you just want to see the UI and assessment work — those pages don't need keys.

### 5. Branch to deploy

By default, Vercel deploys whatever's on your **production branch** (usually `main` or `master`). Pathways Pro lives on `claude/zealous-davinci-r6jac0` until you merge PR #7.

Two options:

- **Option A — Merge PR #7 first**, then deploy from your default branch. Cleanest.
- **Option B — Set the production branch to `claude/zealous-davinci-r6jac0`** in Vercel: Settings → Git → Production Branch. Lets you ship before merging.

### 6. Click Deploy

First build takes ~2 minutes. You'll get a URL when it's done.

## After the first deploy

- Every push to your production branch auto-deploys
- Every other branch / PR gets a preview URL like `pathways-pro-git-feature-x-xxx.vercel.app`
- Logs are at vercel.com/dashboard → your project → Deployments → (click one) → Logs

### Custom domain

If you own a domain (e.g. `pathwayspro.app`):

1. Vercel project → Settings → Domains → Add
2. Type the domain
3. Vercel gives you DNS records (A record + CNAME or NS records)
4. Add them at your registrar (Namecheap, GoDaddy, Cloudflare, etc.)
5. Wait 5–60 minutes for DNS to propagate
6. HTTPS provisions automatically

## Troubleshooting

**Build fails with "Module not found"**: Double-check Root Directory is set to `pathways-pro`, not the repo root.

**App loads but coach returns "ANTHROPIC_API_KEY missing"**: Add the env var in Vercel Settings → Environment Variables, then redeploy (Deployments → Latest → ⋯ → Redeploy).

**Pages render but no logs**: Vercel only streams logs while a function is running. Coach + local-jobs are functions; static pages don't generate logs.

**Slow cold starts on the coach**: First request after idle takes 1–2 seconds. Anthropic streaming kicks in after that.

## Costs

- **Vercel Hobby**: free, includes serverless functions, 100 GB bandwidth/month
- **Anthropic API**: ~$0.01–0.05 per coach turn, depends on length
- **Domain** (if you buy one): ~$12–20/year
- **Total expected**: $0–5/month for personal/demo use

## ⚠️ Reminder before you share the URL widely

The footer says "HIPAA-compliant" but the current build is **a demo** — auth is mock, data is in `localStorage`, no real backend. Don't put real client PII in. Consider:

1. Add a banner: "Demo only — do not enter real client information"
2. Remove the HIPAA claim from the footer until Phase 2 of the publishing roadmap is done

See `PUBLISHING-ROADMAP.md` for the full path to real production readiness.
