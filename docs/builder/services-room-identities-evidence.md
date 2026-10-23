# Six room identities — Slice 1 evidence

The six full-copy service cards now have their own static glow identities, 16px glass surfaces, an obsidian-to-navy base, and local Geist. This slice does **not** add low-bandwidth controls, particles, fog, entrance animations, dependencies, or motion-policy changes.

## Review and run

- Refreshed upstream base: `be01425e8c44dfb56e2c5acecd19ad55130f14db`, unchanged from the approved planning baseline.
- Implementation commit: `477c68552b968fdd1ea375c5c68207644a0514d5`.
- Branch/worktree: `feature/services-room-identities`, `/workspace/services-room-identities`.
- Approved design/plan: commit `a40dc25967e0ed883410c2d36e541baf785baf93` on `docs/services-alive-design-plan`, files `docs/superpowers/specs/2026-10-22-services-alive-design.md` and `docs/superpowers/plans/2026-10-22-services-alive.md`. Only Slice 1 tasks 1–3 are implemented. Planning files remain on that separate branch.

```bash
git fetch origin
git switch --track origin/feature/services-room-identities
npm ci
npm run dev -- --port 5173 --strictPort
# Open the loopback URL through Codespaces port forwarding.
```

This branch is independently runnable without another unmerged implementation branch. No provider credentials are needed. The existing draft demo remains on the integration route only; its rendered state does not establish live provider availability.

## Changes and test-first evidence

`ServiceCards` adds only `data-room={card.id}`. The palette contract maps website-build/cyan `#00E5FF`, opportunity-audit/purple `#B026FF`, sprint/teal `#00FFD4`, codebase-audit/blue `#0088FF`, custom-software/pink `#FF007F`, and integration/ultraviolet `#8A5CFF`. CSS-token assertions prevent drift from that contract; no inline color styles are added under CSP.

New glass rules are scoped to hub cards. The structural border stays white/10 while the always-visible edge and inner/outer shadows use each room's color. Hover/focus strengthen that same color; the existing 4px lift and reduced-motion no-lift behavior remain. Full paragraphs use neutral `#cbd0d5`; headings, prices, scope labels, card order, markup, links, and all Markdown-derived offer fields are preserved. Cards retain 28px/26px padding, 18px gaps and the existing 3/2/1 layout. Opaque navy is the default no-blur surface; black/20 and 24px blur are progressive enhancement. Ambient base tokens are separate from `--bg`, preserving button foreground colors.

Observed RED runs preceded implementation:

- Task 1: 9 intended failures for the empty palette stub and missing mounted/SSR room IDs; the focused/content GREEN run then passed 49 tests.
- Task 2 unit RED: 9 intended failures for missing room CSS, base, local font and fallback rules. GREEN passed 41 focused tests.
- Task 2 browser RED: 4 intended failures for missing base tokens, non-neutral paragraphs, absent opaque glass enhancement, and absent font request. The initial styling/font GREEN passed all 10 then-current card browser tests.
- Existing satisfied content, markup, security and motion contracts remained characterization tests; they were not artificially broken. No snapshots were regenerated.

## Complete local validation

All final commands exited 0, with no skipped browser cases:

| Command | Final result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | 12 files, 166 tests passed |
| `npm run build` | Seven prerendered review routes and a noindex 404 built |
| `npm run verify:build` | Existing route, link, security and draft checks passed |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- tests/e2e/service-cards.spec.ts tests/e2e/hero-atmosphere.spec.ts tests/e2e/di-demo.spec.ts` | 24 passed; synthetic same-origin fixtures only |
| `git diff --check` | Passed |
| Protected source hashes and full rendered-section comparison | 29/29 hashes matched; all seven complete hero/ReviewStatus pairs matched |

The unchanged baseline passed 150 unit tests and 19 browser tests. The first dependency installation failed with `ENOSPC` because sandbox file-entry capacity was exhausted; the follow-on missing-module failures were environmental, not behavioral RED. Recovery used the exact package/lock copied into `/dev/shm/services-room-identities-deps`, `npm ci --prefix /dev/shm/services-room-identities-deps --cache /dev/shm/services-room-identities-npm-cache`, and a worktree-local ignored `node_modules` symlink. A stalled background monitor produced no recovery artifacts; the successful recovery and baseline were run explicitly in the foreground. Other worktrees were preserved. No package or lock changes were made. The existing dependency audit reported 14 vulnerabilities (2 moderate, 10 high, 2 critical); dependency remediation is outside this visual slice.

Detailed RED/GREEN, baseline and final logs remain in `/workspace/services-room-identities-evidence/`, particularly `task1-red.log`, `task1-green.log`, `task2-unit-red.log`, `task2-browser-red.log`, `final-*.log`, `protected-final.log` and `protected-sections-final.log`.

## Viewports, fonts and readability

Checks passed at 1200×900, 768×1024 and 375×812, plus exact widths 901/900 and 641/640: three columns above 900, two from 641–900, one through 640. All six complete outcomes, inclusions, exclusions and safe scope links remain present once, with no horizontal overflow. Keyboard traversal, visible unclipped scope-link outlines, own-color hover/focus, reduced-motion no-lift, opaque no-blur fallback and JavaScript-disabled content passed.

[Desktop](evidence/services-room-identities/service-cards-1200.png) · [Tablet](evidence/services-room-identities/service-cards-768.png) · [Mobile](evidence/services-room-identities/service-cards-375.png)

These are real grid crops, not mockups. Capture freezes decorative animation and hides sticky navigation/banner only in the screenshot so they do not cover card headings. Actual page disclosures and positioning are unchanged.

Controlled loading observed **0px maximum change** across all six card, heading, outcome, inclusion, exclusion and link bounding boxes, and layout-shift values **0 before/0 after** font readiness in cold/delayed, warm-cache and blocked-font cases without user input. The warm font transfer was **0 bytes**; the cold asset returned 200; the blocked asset failed once while all text remained readable. FontFaceSet additionally parsed/loaded Geist successfully. Chromium's platform-font inspection confirmed actual warm-rendered `Geist-Regular`, custom font, 84 glyphs in the sampled outcome—not merely a successful HTTP response. Full measurements are in [font-layout-observations.json](evidence/services-room-identities/font-layout-observations.json). These are local Chromium observations, not a universal cross-platform zero-shift guarantee.

Computed paragraph contrast is approximately **12.21:1 against `#0A1020`**; all full paragraphs passed the neutral/4.5:1 checks at rest, hover and focus, including the longest offer. The opaque fallback was checked separately. This contrast calculation uses the specified navy reference, not a pixel-by-pixel audit of every animated backdrop. The exact existing self-only CSP was applied to a browser response: the local font loaded with no policy violations. There were no third-party requests in the checked font/card scenarios.

Measured built assets: entry JavaScript 284,165 → 284,182 bytes; CSS 16,119 → 17,544 bytes. The new WOFF2 is 69,760 bytes; its retained license is 4,368 bytes (74,128 bytes combined on disk, not all transferred on every visit). No new JavaScript dependency or optional animation chunk exists in Slice 1.

## Official font provenance and license

The unmodified font comes from Vercel's official [`vercel/geist-font` v1.8.2 release](https://github.com/vercel/geist-font/releases/tag/v1.8.2), published October 21, 2026, pinned to commit `1d6dfdb6e58c0ddd841c1e24e59aef01ec3916e4`. [Vercel's font page](https://vercel.com/font) identifies the WOFF2/variable distribution and OFL license.

| Local asset | Exact official source | SHA-256 |
| --- | --- | --- |
| `public/fonts/Geist.woff2` | [Geist variable Sans](https://raw.githubusercontent.com/vercel/geist-font/1d6dfdb6e58c0ddd841c1e24e59aef01ec3916e4/fonts/Geist/webfonts/Geist%5Bwght%5D.woff2) | `2ffebe993e969069a9789d15164b7715d42491b5835516c5e3b935d5f81b05f1` |
| `public/fonts/OFL.txt` | [Original LICENSE.txt](https://raw.githubusercontent.com/vercel/geist-font/1d6dfdb6e58c0ddd841c1e24e59aef01ec3916e4/LICENSE.txt) | `930853ee1daa68554d9e35c8a9175affb74f699fad9a5da6ee5ebe76379d9137` |

Local Git blob IDs matched the official pinned GitHub records. OFL 1.1 permits bundling, embedding and redistribution with software when copyright/license notices accompany it; the font is not sold by itself and remains under OFL. Both original bytes are retained. The release is v1.8.2 while its internal font version is 1.800; variable weight range is 100–900.

FontTools measured UPM 1000, ascent 1005, descent −295, line gap 0. The `abcdefghijklmnopqrstuvwxyz ` sample's average advance was 0.52333em for Geist versus 0.48170em for local Liberation Sans, the Arial-compatible fallback. The resulting fallback face uses size-adjust 108.64%, ascent-override 92.50%, descent-override 27.15%, line-gap-override 0%. These are measured sample/fallback values, not invented universal platform metrics. `font-display: optional` prevents a delayed swap; other system fallbacks remain available. No external stylesheet/font service or Cabin Sketch asset was added.

## Preserved boundaries and remote authorization

The [protected hash manifest](evidence/services-room-identities/protected-source.sha256) includes all seven content pages plus their README, generated JSON, App/complete hero and ReviewStatus implementation, renderer, demo UI/API, content/type modules, scripts, package/lock, metadata/hosting files and environment-name template. All 29 hashes match. Fourteen original hero/review/shared-glass CSS lines also match; the original seven full markup snapshots pass unchanged. No commercial strings, review-note arrays, proof labels, discovery credit, consultation behavior or demo contract were rewritten.

Vercel remains exactly `npm run build`, output `dist`; `verify:build` remains local-only. There are no new scripts, hooks, checks, gates, release requirements, CSP exceptions or header changes. Routes, draft/noindex, robots and SEO posture remain unchanged. Existing canvas behavior and hero drift are untouched; no Slice 2 control or atmosphere behavior is claimed.

Before push, GitHub inspection found Vercel's automatic preview on [prior PR #18](https://github.com/keithsoyka0-coder/services/pull/18#issuecomment-6331465482). Keith separately approved **only this Slice 1 PR's automatic preview** on October 22 at 20:09 EDT, in addition to requesting the PR. Push/open PR is permitted after verification. This does not authorize manual deployment, merge, publication, production release, indexing or live-provider testing; none is performed by this slice. Remote PR/preview status is reported separately after the push rather than predicted here.
