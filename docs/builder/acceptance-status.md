# Builder acceptance status — internal draft progress

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-20 · origin: Builder

## Current build scope

Keith requested removing the technical Vercel build blockers while retaining every draft/content/data safeguard. The configured Vercel command is now `npm run build && npm run verify:build`; Vercel environment indicators are allowed, while release/approval flags and a nonempty `SITE_ORIGIN` remain rejected. Vercel responses add `X-Robots-Tag: noindex, nofollow` without relaxing existing security headers. Keith handles project setup and any deliberate deployment himself. No agent deployment, project linking, merge, indexing request, database write or API/CORS domain change is authorized. See the [current quickstart](quickstart.md).

## Historical local-draft handoff

The original validation and authorization record below describes the initial local-only implementation; its deployment-blocker checks are superseded by the current build scope above, not by public-copy approval.

This is a local draft implementation, **not** acceptance of the complete published Phase 1 site. Keith authorized local draft rendering and, separately, committing/pushing a branch and opening an unmerged PR. The coordinator reported that the Services repository is not currently linked to a Vercel project, so an automatic Vercel preview is not expected. No project was created or linked.

## What is verified

`npm run check` runs strict typechecking, the complete unit/UI suite, client and server builds, draft generation/prerendering and built-route verification. The full run passed **38 tests across six test files**, typechecking, build, and verification of the seven exact service routes plus a noindex 404.

The local browser check covered the built hub and website-build spoke: correct draft H1/title, conspicuous review banner, one H1, disabled hub fieldset, functioning hub-to-spoke navigation, non-clickable proof placeholders, and a disabled widget mount. Both checked pages had no horizontal overflow at the inspected viewport. Preview responses carry `X-Robots-Tag: noindex, nofollow`.

All original lane drafts and the planning-only approval document were checked against their pre-integration SHA-256 hashes and remain unchanged. No raw internal handoff text is included in generated page data. A negative invocation of the Vercel deployment-blocker script exits unsuccessfully as intended. No generated `dist`, `dist-server`, `node_modules`, `.vercel` or credential file belongs in the commit.

The full staged whitespace check reports fourteen original two-space Markdown line breaks in the frozen Quill drafts (route and title lines). These intentional source formatting marks are preserved, not normalized. The staged implementation whitespace check excludes only `docs/lanes/**` and passes; this exception is not a code, test or build failure.

## Original spec acceptance, without overstating it

| Original criterion | Local draft status |
|---|---|
| Hub + six spokes, exact routes | Verified. All seven render the bounded Quill public-copy sections, and the internal-only 404 is separate. |
| Prices match their source | Verified in tests: `$2,900`, `$950`, `$2,500`, `scoped`, `$8,500–$10,000`, `$9,500`; hub discovery remains `$600`. Dollar symbols are preserved, not assigned an invented ISO currency. Prices are labeled draft details, not finalized offers. |
| Included/not-included sections | Quill's sourced sections render on all spokes. Audit-only services do not acquire build deliverables by implication. Unresolved package boundaries remain explicit. |
| Cross-linking and real proof | Hub ↔ spokes and local hash targets verified. Real portfolio proof, portfolio backlinks and runtime evidence remain blocked pending approved assets/URLs; placeholders are not live proof. No portfolio/runtime repo was modified. |
| SEO and sitemap | Local-only titles/descriptions and noindex are verified. Robots disallows crawling. Canonical, Open Graph, schema, production-origin and public sitemap output are intentionally prohibited; this is not fulfillment of the production SEO contract. |
| Widget mounts and contract | Six mounts verified disabled, one per spoke. The container contract is documented; no demo, tracking, session or model call runs. |
| Consultation path | Documented unavailable stub is present. Hub fieldset/button are disabled, submit events are canceled, and tests verify no network request or success/receipt claim. API POST returns unavailable without reading/storing content. A reviewed contract and a separately authorized services DB are still required. |
| Typecheck/build/security and PR | Local code checks pass. Repository handoff is branch + PR only; no merge. Deployment/release guards remain enabled. |

## What still needs decisions

Final offer scope—particularly opportunity-audit outputs, sprint deliverables, and audit/refresh boundaries—plus approved proof assets/backlinks, seller/site naming, currency, domain, social asset, hosting/terms responsibilities, timing/revisions/payment details and discovery conditions remain unresolved. Form contact validation, privacy disclosure, retention/deletion, catalog strategy, server roles and rate limits remain unapproved proposals. No database provisioning or write is authorized.

The earlier planning-only record is preserved; local rendering and a GitHub PR do not upgrade those drafts to publication approval. Gated private commercial material remains omitted from the rendered site and its browser data. The eventual release requires a separate owner-approved process, not environment flags.
