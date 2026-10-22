# Six service cards — implementation evidence

Six bounded cards now render from the existing hub Markdown in initial HTML. Each carries its original heading, price, outcome, Included and Not included paragraphs, and one scope link. The Portfolio supplies visual structure only; no commercial copy was imported.

## Review this slice

- Base: `21513b21d0dae8c96ef26dfb7e71ecb13bf1ac0d` (verified current `origin/main`).
- Branch: `feature/services-offer-cards`.
- Implementation commit: `4c292649c33736a4f40007068b2c5219f09c37b6`.
- This evidence document is a separate documentation commit on the same PR.
- Worktree: `/workspace/services-offer-cards`.
- Approved spec and plan: `docs/superpowers/specs/2026-10-21-services-cards-and-atmosphere-design.md` and `docs/superpowers/plans/2026-10-21-services-cards-and-atmosphere.md` on the approved planning branch/worktree, not copied into this implementation branch.
- Portfolio reference: `f7f4b232c43866569355e54be32bb17a139cdfc0`, read-only `/workspace/portfolio-reference-t5cAE2`; `services.html` card structure and `styles.css` lines 130–155, 238–245.

## Run in Codespaces

```bash
git fetch origin
git switch --track origin/feature/services-offer-cards
npm ci
npm run dev -- --port 5173 --strictPort
# Open http://127.0.0.1:5173/ via Codespaces port forwarding.
```

This branch runs independently; no atmosphere branch is required. No environment variables or live providers are needed for these local checks.

## What changed

The generator tokenizes only the bounded starting-point section, validates six ordered offers, and produces typed `beforeHtml`, cards, and `afterHtml`. Full `bodyHtml` remains available and semantically parity-tested. Prices, prose, and labels come from Markdown, not a second handwritten offer store. Structural IDs and spoke paths are allowlisted configuration. Malformed input produces source/offer/line errors in the existing generator, not a new deployment gate.

The hub composes those fragments around six named semantic card articles. Spokes retain their original renderer. Safe label fragments exclude the anchor wrapper, so each card has exactly one scope anchor. CSS lifts Portfolio radius, border, glass, padding, grid gap, hierarchy and restrained hover/focus treatment using existing blue/violet/Tron-teal tokens; no green fields or external assets were added.

### Exact changed files

```text
scripts/generate-draft-content.ts
src/App.tsx
src/ServiceCards.tsx
src/content.ts
src/service-card-types.ts
src/generated/draft-pages.json
src/styles.css
tests/app.test.tsx
tests/content.test.ts
tests/draft-content.test.ts
tests/e2e/service-cards.spec.ts
docs/builder/evidence/services-cards/service-cards-1200.png
docs/builder/evidence/services-cards/service-cards-768.png
docs/builder/evidence/services-cards/service-cards-375.png
docs/builder/services-cards-slice-evidence.md
```

## Verification outcomes

| Command | Actual result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm test` | Passed: 11 files, 150 tests. |
| `npm run build` | Passed: seven prerendered review routes and noindex 404. |
| `npm run verify:build` | Passed: existing link, route, security/draft posture checks. Local-only; hosting command unchanged. |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- tests/e2e/service-cards.spec.ts tests/e2e/hero-atmosphere.spec.ts tests/e2e/di-demo.spec.ts` | Passed: 19 tests. Same-origin synthetic demo fixtures only; no live provider requests. |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- tests/e2e/service-cards.spec.ts` | Passed again: six tests, after a screenshot-only capture adjustment. |
| `git diff --check` | Passed. |
| `npm run generate:drafts` twice with `sha256sum` comparison | Byte-identical output after the final extraction correction. |
| Local baseline comparison script | Passed: complete hero JSX, complete `ReviewStatus`, all generated review-note arrays, all seven source Markdown files, full hub `bodyHtml`, six complete generated spokes, atmosphere component, package/lock and hosting/test configuration unchanged. |

TDD RED preceded implementation: extraction/content tests failed for missing presentation/cards (10 expected failures); mounted/SSR tests failed for missing grid (two expected failures); responsive tests failed at 900px and on reduced-motion lift. Added regression RED exposed nested scope anchors and acceptance of stray section content; those now pass. The first combined browser run passed 18/19: focus-border sampling raced its 250ms CSS transition. The assertion now polls for the exact settled border color rather than weakening the expected focus treatment; the rerun passed all 19.

The baseline full-hero/full-review markup snapshot covers all seven routes. Unit/SSR checks compare every card field and inline markup with the original source representation, preserve all heading IDs, enforce single rendering, and keep review status before draft copy. Existing demo and atmosphere checks pass unchanged; this is regression evidence, not a new deployed-canvas diagnosis.

## Viewport evidence

Browser checks confirmed 3 columns at 1200px and 901px; 2 at 900px, 768px and 641px; 1 at 640px and 375px. All six outcomes, inclusions, exclusions and links remain visible with no horizontal overflow. Keyboard traversal, focus-within emphasis, reduced-motion no-lift, no-blur fallback and JavaScript-disabled complete cards passed.

[Desktop — 1200px viewport](evidence/services-cards/service-cards-1200.png) · [Tablet — 768px viewport](evidence/services-cards/service-cards-768.png) · [Mobile — 375px viewport](evidence/services-cards/service-cards-375.png)

These are card-grid crops, with decorative animation frozen and sticky navigation/banner hidden only inside the screenshot capture so it does not cover the first-row headings. The real page and all disclosure markup/styles remain unchanged. The screenshots show the lifted Portfolio card language, not a redesigned mockup.

## Preserved boundaries and limitations

The entire hero JSX and complete `ReviewStatus` implementation are byte-for-byte unchanged, including position before draft copy. Source terminology, including “AI Ops Sprint, two weeks,” is retained. Source files remain the only editorial store. Scope/proof/publication notices, disabled consultation, proof placeholders, anchors and all seven routes remain intact.

No canvas code/behavior, hero styling, review styling, package/build hooks, security headers/CSP, robots/noindex policy, sitemap/canonical/OG/schema, database, provider configuration, payment or activation changed. Vercel's build command is still exactly `npm run build`. Automatic preview is authorized by the owner; no manual deployment, production publication, indexing or merge is authorized or performed. Preview state is reported separately on the PR handoff, not guessed here before push.

The initial sandbox `npm ci` failed because file-entry capacity was exhausted (`ENOSPC`), not because of the lockfile. Recovery installed the exact package/lock in `/dev/shm/services-cards-deps` using `npm ci --prefix /dev/shm/services-cards-deps --cache /dev/shm/services-cards-npm-cache`; that completed successfully. Only disposable npm download cache was removed; repositories and other worktrees were preserved. No dependency or lockfile changes were made. System Chromium supplied the local browser prerequisite. Commit identity was provided per command from the authenticated GitHub account's no-reply identity; no global Git configuration changed.

Local detailed logs and baseline checks remain in `/workspace/services-cards-evidence/`, especially `final-green-verification.log`, `cards-screenshot-verification.log`, `extraction-log.md`, `visual-log.md`, and `protected-final.log`. The PR intentionally does not diagnose or implement the separate atmosphere slice.
