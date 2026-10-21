# Services draft build contract

The seven content routes remain `/`, `/website-build/`, `/ai-opportunity-audit/`, `/ai-ops-sprint/`, `/codebase-audit/`, `/custom-software/`, `/ai-integration/`. The generated draft 404 is not an eighth content route. `docs/lanes/**`, approvals and generated source content are not changed by this slice.

## Readable draft HTML

SSR exports `renderPage(path)`, `pages` and `metadataHtml` through `dist-server/entry-server.js`. Content generation reads the frozen lane files and writes sanitized data with `source: 'draft-internal'` and string-array review notes. Initial HTML contains the content, review notices and full Groq disclosure without waiting for JavaScript.

Every route and 404 visibly includes **DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION**, `noindex, nofollow` metadata and `X-Robots-Tag: noindex, nofollow`. Robots disallows all crawling. No sitemap, canonical, Open Graph, JSON-LD/schema or Search Console action. Release/origin values cannot enable SEO. These safeguards are not access control.

Each spoke has one `data-widget-mount`. Only `/ai-integration/` has `data-widget-state="active-in-draft"`; it denotes rendered draft UI, not live admission. The API is disabled by default. The five other spokes remain `disabled`; hub/404 have no mount. Consultation fieldset/button stay disabled and cannot submit.

## Runnable build, separate activation

Vercel's build command is exactly `npm run build`, output `dist`. Draft generation remains in `predev` and `prebuild`; there are no release/origin preflights or environment-based deployment gates. `npm run verify:build` is local-only and remains part of `npm run check`, not Vercel's command. Dev/preview remain loopback-only with restricted hosts and noindex headers. All existing hosting security headers, including `connect-src 'self'`, are preserved.

Missing demo settings, migration/RPC, WAF or enablement make live admission unavailable; they never prevent building. Configuration names are server-only and documented without values in `.env.example`. The owner must separately configure/apply/enable them. Automatic preview approval is not production release, publication, indexing, migration or activation approval.

## Local verification

The verifier checks seven exact routes; metadata/title/H1; exact banner and noindex posture including 404; scope/proof notices; one integration draft mount and five disabled mounts; no hub/404 mount; complete disclosure and four-profile selector; disabled consultation; local links/hash targets; robots disallowance; no sitemap; and absence of server-only configuration names/values from browser output. The **only external clickable exception** is the exact `https://console.groq.com/docs/your-data` disclosure URL. Other external links and modified Groq URLs remain prohibited. Internal handoff and invented proof links never render.

Typecheck, focused/full unit tests, build, local verifier, offline browser checks and `git diff --check` provide local evidence. Injected transport/browser fixtures are not live Runtime/provider verification. Runtime PR #46 owns eligibility, complete canonical serialization except `memorySystem.privateInterior`, one Groq `openai/gpt-oss-20b` attempt and atomic fixed UTC quotas. Services keeps browser traffic same-origin and no message/answer persistence.

Hub hero/canvas/visual changes are excluded for a later independent PR.
