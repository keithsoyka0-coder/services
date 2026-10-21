# Services

The purchasable layer of the Keith Soyka ecosystem.

## Current implementation: internal draft only

The React hub and six spokes render Quill's draft copy for review. Every route is marked **DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION**. Unresolved scope and proof remain visible, consultation submission is disabled, and public-release flags remain blocked. Keith can deliberately build and host this draft on Vercel after setting up the project himself; hosting does not approve the copy for publication. This is accumulated progress, not a publication-ready Phase 1 handoff.

```bash
npm ci
npm run check
npm run preview -- --port 4174
```

Open `http://127.0.0.1:4174/` on the same computer only; do not forward the port. See the [draft quickstart](docs/builder/quickstart.md), [acceptance status and remaining blockers](docs/builder/acceptance-status.md), and [original implementation boundaries](docs/builder/implementation-plan.md). Vercel uses `npm run build && npm run verify:build` with output `dist`; leave `SITE_ORIGIN` empty and do not enable `PUBLIC_RELEASE` or `CONTENT_APPROVED`. This change does not authorize an agent to merge, deploy, create/link a Vercel project, or perform database operations.

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
- Stack: React — not a static site. Live API calls (DI widget, consultation path), and the most comprehensive footing for multi-dimensional interactive UI.
- Verification before done: typecheck + build green, every link resolves, sitemap current, no secrets in the repo.

## Team lanes

Builder builds · SEO agent owns visibility · DB & Schema owns the services database (separate Supabase project) · Quill owns the written content, working with SEO · Wren + Keith above the team.
