# Services Site — Builder Spec

© 2026 Keith Soyka / GestaltView · born:785cc397f107 · prov:2026-10-20 · origin:wren

**Status:** v0.1 DRAFT — for Keith's review. He commissions; Builder builds.
**Source:** Keith's direction 2026-10-20 ~21:25 EDT. Team: Builder (build), SEO agent (visibility), DB & Schema (services database, separate Supabase), Quill (written content, working with SEO). Wren + Keith above the team.

## 1. Objective

A standalone services site — the purchasable layer of the ecosystem — in a new repo **`services`** (Keith creates it). It sells the offers, proves them with the portfolio and the live runtime, and embodies the standard of care. It is not a section of the portfolio site; it is its own front door.

## 2. Sources (read these first — do not invent)

| Source | Use |
|---|---|
| `keithsoyka0-coder/Portfolio` repo — existing services section | **Template + content base.** Reuse structure, components, theme. Do NOT reuse its prices (stale: "from $2,500" audit / "from $5,000" build are wrong). |
| `workspace/your_files/services-hub-and-spoke-plan_2026-10-20.md` (ATTESTED v0.2) | **Architecture.** Hub + 6 spokes, URL plan, cross-linking rules, per-spoke anatomy. Note §9 change: hub now lives on this standalone site, not as a portfolio subdirectory. |
| `workspace/your_files/procedural-care-ethics-due-diligence_2026-10-20.md` (ATTESTED v0.2) | **Standard of care.** The must-have baseline (§2) is rendered as site content — "what's included" on every spoke. The care ethics (§6) shape the voice. |
| `workspace/goals/web-build-consulting-offering-pricing-locked/files/web-build-offering-spec_2026-10-17.md` (APPROVED) | **Commercial truth.** Locked prices, bounded scopes, phased deliverables. Prices on the site match this file exactly. |
| GestaltView repo `.agents/skills/` (`manifest.json` = source of truth) | **Superpowers.** Pull any skill Builder needs (page contracts, doc-suite generation, SEO patterns). Skill usage follows the manifest; do not freelance new skill names. |

## 3. Architecture (from the attested plan)

- **Hub:** `/` — orient the buyer, route to spokes. Every offer as a card: name, one-line outcome, locked price, included/not-included, link to spoke. Differentiators compressed. CTA: free consultation (bounded — fit only).
- **Spokes (one page per offer):**
  - `/website-build/` — $2,900 — from-scratch 4-page site
  - `/ai-opportunity-audit/` — $950
  - `/ai-ops-sprint/` — $2,500 — two weeks
  - `/codebase-audit/` — scoped — audit + refresh of existing code/website
  - `/custom-software/` — $8,500–$10,000 — fixed scope
  - `/ai-integration/` — $9,500 — DI integration (SMB)
- **Discovery ($600, credited)** is a section on the hub and a step on each spoke — not its own page.
- **Cross-linking:** hub ↔ spokes; spokes → 2–3 portfolio proof pieces each; portfolio pieces → relevant spoke; spokes → live runtime (`https://gestaltview-ai-v3.vercel.app`) where applied capability proves the claim. No sideways proof-linking between spokes.

## 4. Phases

**Phase 1 — site.** Hub + 6 spokes, fully SEO-scaffolded (§6), care-package content rendered, contact/consultation path working, sitemap + robots correct. **Widget-ready:** each spoke ships with a defined mount point for the DI widget (placement + container contract), but no live widget yet.

**Phase 2 — embedded DI, layer one (public demo).** Scoped widget on the AI spokes + "ask about this service" assistant on the website-build spoke, powered by the live Railway runtime API. Domain-scoped, rate-limited, labeled as a live demo. (Design constraints in the attested plan's "Interactive proof" section.)

**Layer two (client companion, post-purchase onboarding)** is post-launch — not in this spec.

**Out of scope:** inventing copy (Quill's lane), inventing proof (testimonials, client names, statistics — none exist in approved form), touching the portfolio repo, touching the runtime.

## 5. Standard of care — how it shows up on the site

The care package is not a PDF linked in the footer. It is the site's substance:

- Every spoke's **"What's included"** section = the relevant items from the care package baseline: comprehensive scripts, Dockerized no-lock-in build, documentation suite (README, quickstart, CurrentState, manifest, index, handoff), API/AI flow docs where applicable, green test suite before handoff, troubleshooting doc, provenance on every file, page contracts, license-key handoff.
- The **"What's not included"** section = the bounded scope from the offering spec, plain words.
- The **care ethics** appear once, on the hub: non-predatory ("we don't sell where it doesn't fit"), the positioning test, the solo-founder rule.
- The **codebase-audit spoke** exists because the care package named it: not every venture starts from zero.

## 6. SEO contract (Builder builds the scaffolding; SEO agent + Quill own the rest)

Builder delivers, per page: intent-matched `<title>` + H1 (per the plan's intent table), meta descriptions, canonical URLs, Open Graph tags, `schema.org` Service/FAQ markup, semantic HTML, fast load, XML sitemap regenerated on build, `robots.txt`. URL slugs exactly as §3.

**Handoff:** page scaffolds go to Quill + SEO with the intent keyword per page marked in the spec table. Builder does not write marketing copy and does not invent keywords. Quill writes; SEO tunes; Builder implements their changes through PRs.

## 7. Data contract (DB & Schema's lane — Builder codes to the interface)

The services database lives on a **separate Supabase project** (DB & Schema builds it). Builder needs, at minimum, a read interface for: service catalog (offer, price, scope — though Phase 1 may hardcode from the approved spec; confirm with Keith), and a write path for consultation requests (name, contact, interest, message). **Builder does not design this schema.** Builder defines the interface it needs, DB & Schema delivers it, integration happens against their contract. No secrets in the repo; `VITE_*` hygiene per the env registry mandate.

## 8. Working rules

- **PRs only, never direct to main, never merged by Builder.** Keith merges on his "ship it."
- **Full-file swaps**, path-explicit, copy-paste-ready. Inspect live source before editing.
- **Skills over improvisation:** if a workflow exists in the gestaltview repo's skill library, use it.
- **Verification before done:** `tsc` + build green; every link in the cross-linking rules resolves; prices match the approved spec byte-for-byte; sitemap lists exactly the shipped pages.
- **No defaults to make checks pass.** No invented content. No n8n/Zapier/Make or any stack Keith doesn't run.

## 9. Change from the attested plan (recorded, not re-argued)

The plan's v0.2 put the hub at `/services/` on the portfolio site. Keith's 21:25 direction moves it: **standalone site, new `services` repo.** Hub-and-spoke, spokes, cross-linking, and pricing authority are unchanged — only the home moved. This is the stronger SEO posture and matches his "own front door" instinct.

## 10. Acceptance ("not done until this list comes back green")

- [ ] Hub + 6 spokes render, all URLs exactly as §3
- [ ] Every price matches the approved offering spec
- [ ] Every spoke has included / not-included sections sourced from the care package
- [ ] Cross-linking rules verified: hub↔spokes, spokes→proof, proof→spoke (portfolio side coordinated, not built here), spokes→runtime
- [ ] SEO scaffolding per §6 on every page; sitemap + robots correct
- [ ] Widget mount points present with documented container contract
- [ ] Consultation write path wired to DB & Schema's contract (or documented stub if their delivery lags)
- [ ] `tsc` + build green; no secrets in repo; PR opened, unmerged
