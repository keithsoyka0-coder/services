# Services Hub-and-Spoke — Page & URL Plan

© 2026 Keith Soyka / GestaltView · born:f6301e53a836 · prov:2026-10-20 · origin:wren

**Status:** v0.2 ATTESTED by Keith 2026-10-20 ~19:14 EDT (voice note).
**Source:** Keith 2026-10-20 ~19:08 EDT. Hub-and-spoke affirmed by him as the architecture.
**Home:** the portfolio site (keith-soyka-portfolio.netlify.app) — the client-facing brand for paid work. GestaltView (gestaltview-ai-v3.vercel.app) stays the platform/DI brand and appears as proof, not as the seller.

## The three layers (Keith's frame)

| Layer | Role | Home |
|---|---|---|
| **Capability** | Portfolio — proof of what he can build | keith-soyka-portfolio.netlify.app |
| **Applied capability** | Runtime — the thing live in production | gestaltview-ai-v3.vercel.app |
| **Services** | Purchasable offers — the hub and spokes | portfolio site, `/services/` |

Each layer links to the other two, but each has its own front door. Crawlers and humans get one clear intent per page.

## The hub: `/services/`

One page. Job: orient the buyer and route them to the right spoke.

- Headline intent: hire Keith Soyka — web builds, audits, AI integration.
- Every offer as a card: name, one-line outcome, locked price, "what's included / what's not" (bounded scope), link to its spoke.
- The differentiators, compressed: no lock-in (Docker, deploy anywhere), documentation suite standard, green tests before handoff, provenance on every file.
- The care ethics, one line: non-predatory — we don't sell where it doesn't fit.
- CTA: free consultation (bounded — fit only, no free spec work).

## The spokes (one page per purchasable offer)

| Spoke URL | Offer | Locked price | Search intent it owns |
|---|---|---|---|
| `/services/website-build/` | Standard 4-page website | $2,900 | "freelance web developer", "small business website build" |
| `/services/ai-opportunity-audit/` | DI opportunity audit | $950 | "AI opportunity audit", "should my business use AI" |
| `/services/ai-ops-sprint/` | AI Ops Sprint, two weeks | $2,500 | "operations automation consultant", "AI ops sprint" |
| `/services/codebase-audit/` | Codebase / website audit + refresh | scoped | "codebase audit", "website refresh service" |
| `/services/custom-software/` | Custom software, fixed scope | $8,500–$10,000 | "custom software developer", "small business software build" |
| `/services/ai-integration/` | DI integration (SMB) | $9,500 | "AI integration consultant", "AI chatbot integration small business" |

Discovery ($600, credited) lives as a section on the hub and a step on each spoke — not its own page.

### What every spoke page carries

1. **Intent-matched title + H1** — the page ranks for its row in the table above.
2. **The outcome, not the tech** — what the buyer walks away with.
3. **Locked price, visible.** The "incredibly wise use of funds" test happens here.
4. **Included / not included** — the bounded scope, in plain words.
5. **Proof links (the spokes into capability):** 2–3 portfolio pieces or deliverable-kit samples relevant to *this* offer — not the whole portfolio.
6. **The relevant differentiators** — e.g., the website-build spoke names Docker/no-lock-in and page contracts; the audit spoke names the written audit format and the "including where AI doesn't fit" clause.
7. **CTA** — free consultation → discovery.

## Cross-linking rules (the spokes of the hub-and-spoke)

- Hub → every spoke. Every spoke → hub.
- Spoke → 2–3 proof links (portfolio pieces, deliverable kit). Proof → back to the relevant spoke ("built as part of the website-build service").
- Spokes → runtime (gestaltview-ai-v3.vercel.app) where applied capability proves the claim — e.g., the AI integration spoke points at the live 179-route backend as "the platform I built and run."
- Portfolio homepage → hub ("Services" in primary nav, not buried).
- No spoke links to another spoke's proof. Keep the intent clean.

## Interactive proof: embedded DI on the spokes (attested addition 2026-10-20)

Keith's signature — the look, the themes, the decades-honed work ethic and hygiene — is displayed and discovered through the service pages, with UI/UX on point. And the pages demonstrate the product itself: a scoped DI component on the spoke pages, powered by an API call to the live runtime (Railway, 179 routes).

The sales logic, in his framing: *"Well, what am I buying? Well — what are you looking at right now?"* A contained taste of it, for the buyer.

- **Where:** the AI spokes first (ai-integration, ai-opportunity-audit); the website-build spoke gets a "ask about this service" assistant. Not every page needs it — match the widget to the offer.
- **Scope:** the widget answers questions *about the service and the process* — it is a sales-room demo, not open Billy. Domain-scoped, rate-limited.
- **Cost control:** a public widget will get poked at. Rate-limit per session/IP, cap the demo's context, and keep it on the cheapest capable model path. The runtime is already live, so this is integration, not new infrastructure.
- **Honesty:** label it as a live demo of the builder's own system.
- **Layer two — the client companion (attested direction 2026-10-20):** when someone pulls the trigger, the widget graduates. A dedicated assistant walks the new client through everything: what happens next, what we need from them, the timeline, what each phase delivers, what to expect at handoff. Most freelancers go quiet after the deposit; our system greets them with a guide. This is the care-ethics package ("never leave the client in the dark") running as software — the onboarding layer of the same widget, unlocked by the purchase.
 No fake testimonials, no invented capabilities — the widget is the proof.

## Build notes (for Builder)

- Repo: `keithsoyka0-coder/Portfolio`, PR for Keith's review, never direct to main.
- 6 new pages + 1 hub. Static-friendly; follow the existing portfolio patterns.
- Update the sitemap after merge (the 56-page sitemap from Oct 20 predates this).
- The Oct 19 staleness sweep found wrong prices on the homepage ("from $2,500" audit / "from $5,000" build) — the spoke pages are the fix: locked prices live here, homepage points here.
- Do not invent testimonials, client names, or outcome statistics. None exist in approved form.

## Addendum 2026-10-20 ~21:25 — standalone services repo (Keith's direction)

Keith moved the hub off the portfolio site: the services site gets its own repo, **`services`** (he creates it), as a standalone site. Hub-and-spoke, spokes, cross-linking rules, and pricing authority are unchanged — only the home moved. Builder spec: `services-site-builder-spec_2026-10-20.md`. Team: Builder (build), SEO agent (visibility), DB & Schema (separate Supabase services DB), Quill (written content with SEO). Wren + Keith above the team.
