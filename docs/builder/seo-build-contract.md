# Local draft preview build contract

© 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder

This contract describes the current **draft-only internal review build** for seven Quill drafts, including Keith's requested Vercel build compatibility. It does not approve or supply public copy, commercial scope, proof, an origin, agent deployment, or publication. `docs/lanes/**` and `docs/approvals/**` remain frozen; generation reads the lane content without modifying it.

## SSR and generated content

The Vite SSR build produces `dist-server/entry-server.js` with `renderPage(path)`, `pages`, and `metadataHtml`. Draft content is generated into the checked-in `src/generated/draft-pages.json` by `scripts/generate-draft-content.ts`; the SSR contract includes `source: 'draft-internal'` and a `reviewNotes: string[]` for each route. The `PageContent.bodyHtml` must be sanitized public-only copy, with its first H1 excluded. Do not import lane markdown into the Node prerender process.

The seven and only seven content routes are `/`, `/website-build/`, `/ai-opportunity-audit/`, `/ai-ops-sprint/`, `/codebase-audit/`, `/custom-software/`, and `/ai-integration/`. Each spoke renders exactly one dormant `data-widget-mount` whose `data-widget-state` is `disabled`; the hub has no mount. The hub consultation preview must be visibly unavailable and its fieldset and button disabled.

Every content route and the generated 404 render this exact visible banner:

> DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION

Each spoke also visibly states `Scope approval pending` and `Proof approval pending`. Visible `PROOF PLACEHOLDER` text is allowed as a conspicuous placeholder and is not proof. Do not include internal handoff, license, degraded-mechanics, TODO, invented proof links, or any external clickable URL in local preview HTML.

## Draft build and local serving policy

- `npm run dev` and `npm run preview` bind only to `127.0.0.1`; Vite also permits only the `localhost` and `127.0.0.1` Host values, and rejects a non-loopback CLI host override.
- Both Vite dev and preview emit `X-Robots-Tag: noindex, nofollow`; dev injects a matching robots meta tag if absent. Prerendered HTML carries the same robots metadata.
- `npm run dev` and `npm run build` preflight the environment and regenerate the draft JSON. `npm run preview` preflights before startup.
- `VERCEL` and `CI` indicators are allowed. `PUBLIC_RELEASE=true`, `CONTENT_APPROVED=true`, and any nonempty `SITE_ORIGIN` remain blocked, including in Vercel environments. Hosting permission does not grant content approval.
- `vercel.json` runs `npm run build && npm run verify:build` and serves `dist`. All existing security headers remain; a global `X-Robots-Tag: noindex, nofollow` header also covers hosted responses. Keith creates/connects the project and makes any deployment decision himself; this change performs neither operation.

Metadata is deliberately restricted to the escaped `<title>`, optional description, and `noindex, nofollow` robots tag for **every** page, regardless of source, origin, production, or approval flags. No canonical, Open Graph, JSON-LD/schema, or sitemap output is available. `safeOrigin()` remains only as an inert utility; it is not used in generated output. `/robots.txt` disallows crawling, and any stale sitemap is removed.

## Verification

`npm run verify:build` checks the exact route list and `draft-internal` source, string-array review notes, title/H1, the visible draft banner including 404, all route noindex and no canonical/OG/schema output, required spoke approval statuses and exactly one disabled widget mount, disabled hub form, prohibited internal mechanics/TODO text, no external clickable URLs, local link/hash integrity, crawl disallowance, and absence of a sitemap. Verification is a technical safeguard, not a release or approval decision.

`tests/metadata.test.ts` tests that metadata remains noindex and schema-free even under release-like arguments. `tests/draft-safety.test.ts` tests the deployment environment and loopback safety rules. Use the focused tests with `npm test -- tests/metadata.test.ts tests/draft-safety.test.ts`; run broader project tests only after the content adapter integration is ready.
