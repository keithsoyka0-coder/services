# Services demo slice 1 — verification evidence

## Result

Branch `feature/services-di-demo-slice-1` starts from Services main `066ce506b84b1843a62873b9cfd612065e9208f7`. It contains the integration-only draft form and signed same-origin proxy, focused offline coverage, and minimal runnable-build/local-verifier changes. Runtime PR #46 is already merged at `c93795d976a5b3e05b5d932aed0cfa8271e4af79`; the Runtime operations contract and immutable synthetic signature vector were reviewed read-only.

The short [slice plan](../superpowers/plans/2026-10-21-di-demo-slice-1.md) was written before feature code. Hub hero/canvas/liquid-glass changes remain a later independent PR. No lane copy, approvals, price/discovery source, generated draft content, consultation endpoint, Runtime, Netlify, Corpus or Shopify change is included. The only CSS addition wraps long demo answers; it is not a visual refresh.

## Commands actually run

| Check | Result |
|---|---|
| Clean lockfile installation (`npm ci`, temporary-memory install prefix) | 270 packages installed, exit 0. The sandbox root filesystem had exhausted inodes; the clean dependency tree was installed under `/dev/shm/services-slice-clean` and linked only in this ignored local worktree. No unrelated checkout/dependency tree was modified or deleted. npm reported its existing pending esbuild lifecycle-approval warning; subsequent tool/build runs passed. |
| `npm run check` | Exit 0: strict typecheck; **129 tests across 10 files**; draft generation; client and SSR builds; seven-route/404 prerender; local verifier. |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | Exit 0: **9/9 browser scenarios**, built SSR output on loopback. Every external request blocked; same-origin API requests mocked. |
| Build with demo variables explicitly unset and `PUBLIC_RELEASE=true CONTENT_APPROVED=true SITE_ORIGIN=https://synthetic-build-only.invalid VERCEL=1 VERCEL_ENV=preview` | `npm run build` then `npm run verify:build`, both exit 0. Release/origin values no longer gate builds or enable public SEO. |
| `git diff --check` | Exit 0. |
| Scope checks | Original worktree still has only its original untracked plan directory. Frozen lane/approval/records/generated-content paths have no diff. Main was fetched again and remained the stated base. |
| Read-only independent boundary review | No blocking findings. |

Vercel's repository command is only `npm run build`, output `dist`. The verifier remains local-only through `check`; existing security headers, same-origin CSP and loopback host restrictions remain unchanged.

## Behavioral RED → GREEN

The following failures were observed before their corresponding implementation/fixes, then passed:

- Browser assertion: integration draft had no named demo form; after implementation the same assertion passes.
- UI disclosure/control/route assertions, same-origin request shape, transient safe answers, duplicate-submit behavior, bounded replies, redirect refusal and generic errors.
- Proxy behavior assertions, duplicate JSON fields, stalled body deadline, strict origin configuration, Runtime-compatible response allowance and daily quota retry range.
- Release-policy/build hook assertions failed against main's old gates; removal and matching documentation now pass.
- Exact Groq URL acceptance failed before the minimal link helper; modified/unrelated URLs remain rejected.
- Real-verifier disposable fixtures: a valid draft-active integration mount was initially rejected; after permitting it, missing disclosure details, extra profiles/mounts/routes, unapproved external links and synthetic server-setting leakage produced their own intended failures. The final verifier suite passes 17 cases.
- The initial narrow-screen test exposed overflow inside the answer box for long unbroken text. A single `.di-demo-answer` wrapping rule fixes it; the browser regression now passes at 375px width.

Transient detailed logs are in `/tmp/services-slice-evidence/` on the task computer, not in the PR. Key logs: `browser-red.log`, `ui-red.log`, `ui-contract-red.log`, `ui-redirect-red.log`, `proxy-red-hardening.log`, `proxy-red-contract-alignment.log`, `no-gates-red.log`, `verifier-guards-red.log`, `mobile-red.log`, `check-final.log`, `browser-final.log`, `build-no-gates-final.log`. These include deliberate test failures, not unresolved final failures.

## What the tests establish

The 42 proxy cases use actual Node readable request streams and injected synthetic transport. The outbound signature and the published Runtime vector are independently recomputed. Strict input/raw-body/header/config rejection occurs before transport; only the trusted Vercel IP is used, never forwarded fallbacks. One fixed-origin, no-redirect signed call is made; full fetch/body time is bounded, output is sanitized/no-store and there is no retry, persistence or logging. The raw request cap is 8 KiB, messages 1,200 Unicode code points, answer allowance 32 KiB UTF-8, JSON envelope cap 256 KiB and coarse retry bound one UTC day.

UI and browser cases verify exactly four profiles, full disclosure before submission, one same-origin two-field request, safe text output, loading/429/generic error/network-failure behavior, no storage, no automatic requests/retries, reset/reload clearing, five dormant spokes, no hub mount, disabled consultation and initial readable HTML without JavaScript. The verifier additionally checks no 404 mount, no unexpected HTML routes, no public metadata/sitemap, no server-only settings in browser assets and the exact Groq data-policy link exception.

These checks do **not** prove live Runtime/provider connectivity, hosted migration/RPC availability, WAF enforcement or live quota admission. No live demo/provider/database call was made.

## Authorization and activation remain separate

At 17:26 EDT Keith said **“I approve a services preview”**; the explicit context permits the automatic preview resulting from pushing/opening this Services PR only. The earlier Runtime-only approval was not reused. No manual deployment, merge, production release, publication, Search Console/indexing, settings/secret changes, migration or WAF configuration is authorized or performed.

The API remains disabled by default. Separate owner-controlled configuration, reviewed Runtime migration/RPC, Services-edge source-IP WAF for `POST /api/di-demo` (10 requests per fixed ten minutes, default 429) and explicit enablement are needed before admission. Runtime owns all canonical fields except `memorySystem.privateInterior`, one Groq `openai/gpt-oss-20b` attempt, replay/cleanup and atomic five-per-visitor fixed UTC-hour / 50-global fixed UTC-day caps. No Services database or consultation enablement is introduced. Noindex is not access control.
