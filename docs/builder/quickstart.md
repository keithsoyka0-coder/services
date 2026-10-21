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

Use `http://127.0.0.1:4174/` on this same computer. Do not forward the port, share a public preview URL or deploy these artifacts. Development and preview are loopback-only and reject non-local host access. The Vercel build configuration deliberately blocks deployment. Release flags and production-origin configuration are rejected rather than used to publish these drafts.

`npm run dev` is available for local development. The generation step reads the source lane files and writes sanitized public-copy data to `src/generated/draft-pages.json`; it does not edit the source documents. Internal handoff text is excluded from the generated browser payload. Metadata uses the local draft titles/descriptions and noindex, nofollow. There are no production canonical, Open Graph, structured-data or sitemap outputs.

## What to review

The hub is `/`. The spokes are `/website-build/`, `/ai-opportunity-audit/`, `/ai-ops-sprint/`, `/codebase-audit/`, `/custom-software/` and `/ai-integration/`. Discovery remains a section, not an eighth service route.

Each page has visible unresolved-scope and proof notices. Original proof placeholders remain visibly labeled placeholders, never fake links. External runtime references remain unverified text, not clickable proof. Prices retain their source strings but are explicitly not finalized offers; the source's dollar symbols are not converted to an assumed ISO currency.

The hub consultation form is entirely disabled. No request is sent, stored, or acknowledged. It cannot be enabled until the contract is reviewed, privacy/policy choices are decided and a separate services database is explicitly authorized and implemented. The local server does not execute Vercel functions; endpoint tests directly exercise the fail-closed stub.

## Verification

`npm run check` runs strict TypeScript checks, tests, content generation, client/server builds, seven-route prerendering plus an internal-only 404, and generated-HTML checks. Tests cover draft rendering, safe Markdown handling, disabled consultation, noindex metadata, deployment refusal and local host policy. A local preview server's SPA fallback is not evidence of a deployed 404 status.

Keith separately authorized a branch commit/push and an unmerged PR against `main` after verification. The coordinator reported that Services is not linked to a Vercel project, so no automatic preview is expected. No merge, deployment, project linking, Search Console action, database provisioning, migration or database write is authorized.
