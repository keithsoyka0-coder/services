# Local draft preview quickstart

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-20 · origin: Builder

Keith separately authorized **“Render locally as draft-only.”** The seven Quill public-copy sections now render for internal review, with a conspicuous **DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION** banner on every route. The lane drafts and their planning-only approval record are preserved unchanged. This does not grant publication approval or settle any commercial, proof, database or privacy decision.

## Run on this computer only

```bash
cd /workspace/services-inspect-Fmea81
npm ci
npm run check
npm run preview -- --port 4174
```

Use `http://127.0.0.1:4174/` on this same computer. Do not forward the port. Development and preview remain loopback-only and reject non-local host access.

## Owner-controlled Vercel build

Keith requested removal of the repository's technical deployment blockers so he can create/connect the Vercel project and deliberately host the draft himself. The configured build is `npm run build && npm run verify:build`, with output directory `dist`. Vercel environment indicators are allowed; leave `SITE_ORIGIN` empty and keep `PUBLIC_RELEASE` and `CONTENT_APPROVED` unset or false. Those release/approval flags and any nonempty origin remain rejected; no new origin or API/CORS configuration is needed for this draft build.

Hosting is not public-copy approval. Every route retains the draft banner and noindex/nofollow metadata; Vercel adds the same `X-Robots-Tag` response header. Robots disallows crawling and there is no sitemap. No project creation/linking, deployment, indexing request, domain/API modification or database operation is performed by this change. Noindex is not access control; Keith can configure Vercel access protection himself if the hosted draft must be private.

`npm run dev` is available for local development. The generation step reads the source lane files and writes sanitized public-copy data to `src/generated/draft-pages.json`; it does not edit the source documents. Internal handoff text is excluded from the generated browser payload. Metadata uses the local draft titles/descriptions and noindex, nofollow. There are no production canonical, Open Graph, structured-data or sitemap outputs.

## What to review

The hub is `/`. The spokes are `/website-build/`, `/ai-opportunity-audit/`, `/ai-ops-sprint/`, `/codebase-audit/`, `/custom-software/` and `/ai-integration/`. Discovery remains a section, not an eighth service route.

Each page has visible unresolved-scope and proof notices. Original proof placeholders remain visibly labeled placeholders, never fake links. External runtime references remain unverified text, not clickable proof. Prices retain their source strings but are explicitly not finalized offers; the source's dollar symbols are not converted to an assumed ISO currency.

The hub consultation form is entirely disabled. No request is sent, stored, or acknowledged. It cannot be enabled until the contract is reviewed, privacy/policy choices are decided and a separate services database is explicitly authorized and implemented. The local server does not execute Vercel functions; endpoint tests directly exercise the fail-closed stub.

## Verification

`npm run check` runs strict TypeScript checks, tests, content generation, client/server builds, seven-route prerendering plus an internal-only 404, and generated-HTML checks. Tests cover draft rendering, safe Markdown handling, disabled consultation, noindex metadata, Vercel build permission, unsafe public-release rejection and local host policy. A local preview server's SPA fallback is not evidence of a deployed 404 status.

Keith separately authorized branch updates and PR maintenance after verification. This build change does not authorize an agent to merge, deploy, link/create a project, submit to Search Console, provision a database, run migrations or write data. Historical local-only approval records remain unchanged.
