# Hero and atmosphere slice — implementation evidence

Date: 2026-10-21
Branch: `feature/services-hero-atmosphere`
Base: `ff0c4adf2070591cf418ba6f46bd73ea92a3b418` (`origin/main` at slice start)
Scope: the approved inspection-first hub hero and sitewide decorative atmosphere; no DI demo/proxy/API behavior changes.

## Implemented

- The internal hub source now uses the approved H1, `Look at the work. See how it’s put together.` The page renders the previously approved refined lede only in the hub hero. Generated content and the rendered H1 now agree, so the draft verifier accepts the local build.
- A shared `aria-hidden` canvas renders in server HTML on every route. Animation starts only after hydration, is paused for reduced-motion users and hidden tabs, and resumes when appropriate. It caps pixel work and frame rate, handles resize, and cleans up on unmount. It never receives input or issues network calls.
- The shared visual layer uses black, blue, violet, and Tron-teal accents, with restrained glass treatment on the hero, review cards, consultation surfaces, and the DI disclosure. The visible draft-status banner and proof placeholders now use violet/teal accents rather than the prior gold. The layout keeps the canvas behind controls and text.
- The draft banner, `noindex, nofollow`, robots disallowance, absent canonical/OG/schema/sitemap, disabled consultation form, fictional-sample labels, and unconfigured demo state remain in place. No external assets or dependencies were added.
- Updated two existing tests whose fixtures disagreed with the already-shipped behavior: the verifier fixture now uses the actual `div.di-demo-disclosure` structure, and the Unicode UI test now checks the existing 1,200-code-point clamp rather than expecting an over-limit value to reach the handler.

## Test-first evidence

- The new hub/canvas SSR test first failed with zero canvases; it passes after mounting the shared component.
- Canvas behavior tests first failed against the empty component seam; all seven now pass, covering SSR, decorative accessibility, reduced-motion preference changes, frame/pixel limits, resize, hidden-tab pause, unmount cleanup, and no-context fallback.
- Offline browser checks first failed for the missing atmosphere, blocked CTA hit testing, missing glass treatment, and old palette. All four visual scenarios now pass, including reduced motion, a narrow mobile viewport, and initial HTML without JavaScript.
- A new H1-content assertion first failed because the source draft still held the old headline. The internal source and generated content contract were aligned; route tests and the local build verifier now pass.

## Validation

- `npm run check` — typecheck, all 137 unit tests across 11 files, client/SSR build, seven draft routes plus noindex 404, and `scripts/verify-build.ts` all passed.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` — all 13 offline browser scenarios passed, including the four visual scenarios and existing demo/draft behavior.
- `git diff --check` — passed.

## External-action boundary

No production release, manual deployment, publication, indexing, Vercel setting or project change, live Runtime request, WAF configuration, environment secret change, or database migration was performed. The owner approved an automatic Services preview for this slice; PR creation may cause Vercel to generate that preview. The branch remains unmerged pending owner review.
