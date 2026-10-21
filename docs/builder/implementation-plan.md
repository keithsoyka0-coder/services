# Phase 1 builder execution plan — local draft rendering only

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-20 · origin: Builder

Keith separately approved **“Render locally as draft-only.”** This supersedes the prior prohibition on local draft integration, not the planning-only approval limits or any publication blocker. Preserve all `docs/lanes/` files and `docs/approvals/2026-10-20-lane-drafts-planning-approval.md` unchanged.

## Bounded design

Keep the existing React layout and portfolio-derived theme. Generate sanitized JSON from the seven Quill `Public copy` blocks, excluding their internal handoffs and document wrappers. Render the source draft title, public prose, source-price strings, FAQs and placeholder labels under a conspicuous internal-review banner. Show per-page unresolved scope, proof and consultation notices before the prose. External references are non-clickable until verified; placeholders are never manufactured URLs.

All page metadata is local-only: titles/descriptions with noindex, nofollow; no canonical, Open Graph, JSON-LD or public sitemap. Reject release flags and production-origin configuration. Bind local servers to loopback, reject non-local hosts, and fail the configured Vercel deployment build. No public preview URL is created or shared.

## Test-first work units

1. Write and run failing content-extraction, rendering and local-only safety tests.
2. Implement the public-block adapter and safe Markdown renderer, without bundling raw lane files or private handoffs.
3. Render all seven drafts with explicit pending-decision notices, conspicuous banner and dormant widget containers. Keep one H1 per page and all legitimate local routes/anchors intact.
4. Preserve the disabled four-field consultation form and unchanged fail-closed server endpoint. No receipt/success behavior is implemented.
5. Run actual tests, typecheck, build and generated-route validation. Verify document hashes, release/deployment rejection and loopback-only serving. Inspect the local built hub and a spoke in the browser.

## Still not authorized or decided

No final commercial scope, proof inventory or backlinks, production origin, final seller/site identity, ISO currency, social asset, discovery-credit expansion, database catalog strategy, contact validation, privacy disclosure, retention/deletion rules, access roles or rate limits are selected by this implementation. The reviewed lane proposals remain proposals, not approved database policy.

After local validation, Keith separately authorized committing the accumulated progress, pushing `feature/services-site-phase-1`, and opening a PR against `main`. The coordinator checked the Vercel account and reported that Services is not a linked project, so no automatic Vercel preview is expected. That check cleared the owner's preview-risk gate; it does not authorize creating or linking a project.

No merge, deployment, indexing/submission, project creation, Supabase provisioning, migration, credential lookup or database write is authorized. No assistant, checkout, account, tracking, external font, scheduling or model call is activated. Gated private commercial mechanisms stay out of rendered content and browser assets. Vercel remains the eventual hosting preference, not a deployment authorization.
