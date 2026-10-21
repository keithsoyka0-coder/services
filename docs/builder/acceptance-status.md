# Services demo slice 1 — acceptance status

## Current scope

An independently runnable internal-draft `/ai-integration/` form plus same-origin signed Services proxy. The API is **disabled by default**. Runtime PR #46 is merged at `c93795d976a5b3e05b5d932aed0cfa8271e4af79`; its frozen contract and synthetic signing fixture were reviewed read-only. Runtime, Netlify, Shopify, Corpus and live databases are unchanged by this slice.

Hub hero/canvas/liquid-glass refresh is deferred to a later independent PR. Original lane copy, approvals, service prices/scopes, $600 discovery credit boundary, fictional-sample labels and consultation boundaries remain unchanged. No claim of client results or inclusion of the demo embodiments in purchased services is made.

## Build and review

Vercel uses `npm run build`, output `dist`. `npm run verify:build` is local-only in `npm run check`. No environment-driven release/origin gate remains; missing settings/migration/WAF never prevent building. All pages and 404 keep the exact draft banner, noindex/nofollow metadata/header contract, robots disallowance, no sitemap and no canonical/OG/schema. Existing security headers and same-origin CSP remain. Noindex is not access control.

Only integration has one `active-in-draft` mount, meaning a rendered form, not live availability. Five other spokes stay disabled. Hub/404 have no mount. Consultation fieldset/button and its API remain unavailable.

The UI discloses all approved canonical profile material sent to Groq except private interior, possible profile material in replies, provider handling/retention and the exact Groq data link, stateless handling, pseudonymous quota counters and shared-network fixed UTC limits. Messages/answers stay in component memory only; Services/Runtime do not persist them. Four approved profiles only; browser calls only same-origin `/api/di-demo`.

## Verification evidence

See [slice evidence](di-demo-slice-1-evidence.md) for actual commands/results and RED/GREEN evidence. Unit/route tests use synthetic transport; browser tests block external requests and mock the same-origin endpoint. Neither establishes that a live Runtime, provider, migration or WAF has been activated. Local Vite does not execute Vercel Functions.

## Separate owner-controlled work

Hosted Runtime migration/RPC, server settings, Services-edge WAF (source-IP `POST /api/di-demo`, fixed 10 requests/10 minutes, default 429) and explicit enablement are required before admission. Do not apply Services' per-IP edge rule to Runtime. WAF is not code-verifiable; database quotas remain five per visitor per fixed UTC hour and 50 total per UTC day. Preserve direct Vercel ingress assumptions or review the trusted header path again.

This implementation configures none of those dependencies. Keith authorized the automatic preview resulting from this Services push/PR only—not merge, manual deployment, production release, publication, indexing, live migration or secrets/WAF changes. The API stays disabled unless separately enabled with all required settings.

Historical initial-draft acceptance is superseded here only where this slice changes the build/mount contract; no historical planning approval becomes publication approval. Final commercial/proof/privacy/consultation decisions remain separate.
