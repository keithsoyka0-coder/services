# Services

The purchasable layer of the Keith Soyka ecosystem.

## Current implementation: internal draft only

The React hub and six spokes render Quill's draft copy for review. Every route is marked **DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION** and remains noindex. Scope/proof notices and disabled consultation remain. Only `/ai-integration/` renders a disclosed DI demo form backed by a same-origin signed proxy; its API is disabled by default. This slice does not change offers, prices, proof, fictional-sample labels or the hub hero/visual system. Hosting does not approve the copy for publication.

```bash
npm ci
npm run check
npm run preview -- --port 4174
```

Open `http://127.0.0.1:4174/` on the same computer. See the [draft quickstart](docs/builder/quickstart.md), [acceptance status](docs/builder/acceptance-status.md), and [build contract](docs/builder/seo-build-contract.md). Vercel uses only `npm run build`, output `dist`. `npm run verify:build` is local-only, included in `npm run check`; no release/origin variable gates a build or enables SEO. No demo settings are needed to build. Server-only configuration names with blank values are in `.env.example`.

Offline browser checks: `npx playwright install chromium`, then `npm run test:e2e`. Vite does not run Vercel Functions; browser tests intercept the same-origin endpoint with synthetic responses and block external traffic. Proxy tests inject transport, never call Runtime/Groq. Services does not persist visitor messages or answers. See the quickstart for a preinstalled Chromium option.

Runtime PR #46 is merged; hosted migration/RPC and Runtime/Services configuration, Services-edge WAF and separate explicit enablement remain owner-controlled activation requirements, not deployment gates. Keith approved the automatic Services preview from pushing/opening this PR only. No manual deployment, merge, production release, publication, indexing, live migration, secrets/WAF setup or consultation enablement is authorized. No Services database, Runtime or Netlify change is included.

## The three layers

| Layer | Role | Home |
|---|---|---|
| **Capability** | Portfolio — proof of what I can build | keith-soyka-portfolio.netlify.app |
| **Applied capability** | Runtime — the thing live in production | gestaltview-ai-v3.vercel.app |
| **Services** | Purchasable offers — this repo | (this site) |

## The offers

| Offer | Price |
|---|---|
| Standard 4-page website | $2,900 |
| DI opportunity audit | $950 |
| AI Ops Sprint (two weeks) | $2,500 |
| Codebase / website audit + refresh | scoped |
| Custom software (fixed scope) | $8,500–$10,000 |
| DI integration (SMB) | $9,500 |
| Discovery (credited to build) | $600 |

## Specs

- `specs/hub-and-spoke-plan.md` — site architecture: hub + six spokes, cross-linking rules (ATTESTED)
- `specs/care-package.md` — procedural care ethics & due diligence: what every build includes standard (ATTESTED)
- `specs/builder-spec.md` — build spec for the team: phases, SEO contract, data contract, acceptance (DRAFT — under Keith's review)

## Ops & outbound

- `ops/revenue-sprint-7-day_2026-10-20.md` — the 7-day revenue integration sprint (Oct 20–27, 2026)
- `outbound/pancake-context-pack_2026-10-20.md` — Pancake AI Brain context: locked prices, bounded scopes, voice rules, never-claim list

## Integrations


- `integrations/portfolio-canonical-swap.md` — Builder brief: portfolio canonical domain swap (fold-in for the portfolio repo)

## Records

- `records/lane-drafts-internal-planning-approval_2026-10-20.md` — approval record: Keith approved the Quill, DB & Schema, and SEO lane drafts for **internal planning only** (2026-10-20 21:55 EDT). Not publication, deployment, or database writes.

## SEO

- `seo/seo-plan-and-page-matrix.md` — SEO lane draft: seven-page intent matrix, canonical/OG contract, structured data, proof briefs, robots/sitemap rules (for Builder + Quill, not published copy)

## Where things come from

- **Runtime** (Railway API + gestaltview-ai-v3.vercel.app) — APIs, skills, and the DI widget backend.
- **Portfolio** (`keithsoyka0-coder/Portfolio`) — template, theme, content, and proof, merged in per the hub-and-spoke plan.
- **This repo** — the site itself, and the single home for the operation's docs (internal and external).

## Working rules

- PRs only. Nothing merges without Keith's "ship it."
- Prices match the approved offering spec byte-for-byte. Never invent testimonials, client names, or statistics.
- Skills and superpowers come from the GestaltView repo's `.agents/skills/` (`manifest.json` is source of truth).
- Stack: React with prerendered draft HTML. DI demo admission is separately controlled; consultation remains unavailable.
- Verification before done: typecheck, focused/full tests, build, local verifier, offline browser checks and diff whitespace; no sitemap or secrets in draft output.

## Team lanes

Builder builds · SEO agent owns visibility · DB & Schema owns the services database (separate Supabase project) · Quill owns the written content, working with SEO · Wren + Keith above the team.
