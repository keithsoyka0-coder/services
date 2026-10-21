# Services hero and atmosphere — independent slice

Base: `ff0c4adf2070591cf418ba6f46bd73ea92a3b418` (`origin/main`). Branch: `feature/services-hero-atmosphere`. Fresh worktree: `/workspace/services-hero-atmosphere`. Implements only the approved design's next independent PR; founder directive §5 requires this runnable vertical slice. The owner approved this slice's automatic Services preview on 2026-10-21; no manual deployment, merge, release, publication, indexing, settings changes or activation is authorized.

## Paths and test-first steps

1. `tests/app.test.tsx`, `src/App.tsx`: establish RED for the exact approved hub H1 and lede, then render them only in the hub hero. Preserve generated body content, all spoke copy, terms, prices, consultation and demo behavior. Mount one shared decorative atmosphere behind every route; retain initial server text.
2. `tests/atmosphere-canvas.test.tsx`, `src/AtmosphereCanvas.tsx`: test-first client effect, decorative aria-hidden/noninteractive canvas, bounded resolution/work, reduced-motion changes, hidden-tab pause, resize and unmount cleanup, unavailable-context fallback. No network, inputs or content dependency. SSR must not execute animation.
3. `tests/e2e/hero-atmosphere.spec.ts`, `src/styles.css`: establish browser RED for shared gradient, black/blue/violet/Tron-teal body, restrained glass cards, reduced motion and mobile overflow. Use a static readable baseline; enable decorative gradient motion only after hydration and when motion is allowed. No external assets or packages.
4. Fresh `npm run typecheck`, focused/full tests, build, local verifier, offline browser tests and `git diff --check`. Record evidence in `docs/builder/hero-atmosphere-slice-evidence.md`; independently review scope before commit.
5. Commit only this slice, push branch, open PR to main and report automatic preview URL/status via GitHub connector. Do not merge or manually deploy.

## Preserved boundaries

Do not modify prior worktrees. No DI demo/proxy/API, Runtime, Netlify, Shopify, Corpus, prices, metadata, robots, CSP/security headers or deployment configuration changes. Keep exact draft banner/noindex, crawl disallowance, absent canonical/OG/schema/sitemap, disabled consultation and fictional sample labels. Approved source notes stay internal and are not rendered. No new copy beyond the exact approved hero pair.
