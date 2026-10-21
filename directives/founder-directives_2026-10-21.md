# Founder directives — 2026-10-21

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-21 · origin: Keith's word (voice notes ~00:16 and ~00:21 EDT)

## 1. No deployment gates — ever (standing rule)

Keith is a solo founder/developer. The only people with repo access are him and the DIs.

- **Never** add scripts, hooks, checks, or any mechanism to the build/package that blocks, gates, or hinders his Vercel deployments. No "block deployment" scripts, no deploy gates, nothing he has to work around to ship.
- PRs for review are fine: branch → PR → he merges. Anything that stops him deploying at will is not.
- Why: team-style deployment gates have no threat model here — they only create friction. Incident 2026-10-21: a blocking script failed his deploy while he was rushing out the door; he removed it; the build then failed on the dangling reference. With ADHD, stacked roadblocks on a logically-clean fix are infuriating. Don't build the maze.

## 2. The site must feel alive — dynamic gradient hero + canvas

The deployed site reads "plain Jane" / static. Fix that:

- Dynamic gradient hero and an animated canvas — the visitor should feel the thing is alive, not a static page. (It's a Digital Intelligence company; the site itself should demonstrate aliveness.)
- His established aesthetic: gradient blue/purple and emerald-to-purple palettes, liquid-glass cards, Tron-teal animated gradients on black. **No greens.**
- Canvas animation should be tasteful and performant — atmosphere, not a screensaver. It must not block content rendering or hurt the SEO initial-HTML contract (builder spec §6).

## 3. Hero tone: confident, never desperate (2026-10-21 ~00:32 EDT)

The current hero reads desperate — funny, but it has to go. The hero sells confidence, not need:

- **Undersell and overdeliver** (his words, his operating standard). The hero embodies this: plain-spoken, assured, no pleading.
- Confidence comes from clarity: bounded scopes, transparent prices, stated exclusions. A provider who tells you exactly what you get — and what you don't — doesn't need to beg.
- The non-predatory fit standard is the anti-desperation: "we'll tell you if we're not the fit." Desperate providers never say that.
- Quill: rewrite the hero in his voice — warm, direct, specific. No superlatives about himself, no urgency tricks, no "hire me" energy. Show the work; let the proof do the asking.

## 4. Ground the team in his actual words — read-only corpus (2026-10-21 ~00:36 EDT)

The desperate hero happened because ungrounded agents invent. The fix:

- Before writing copy about Keith or GestaltView (Quill) or making claims in code and docs (Builder), **deep-dive these two repos for historical context** — read-only:
  - `keithsoyka0-coder/gestaltview` (the runtime)
  - `keithsoyka0-coder/GestaltView_Corpus_-_Knowledge_Repository` (the corpus)
- The standard is the memory-suite standard: **clear separation between things he actually said and machine-generated content.** Agent memories of who he is, what GestaltView is and why, and the journey of making it get built from the read-only corpus — his words, attested — never invented, never filled from plausible assumptions. Ask, don't fill.
- Until the agent-memory injection (corpus → agent memories) lands, an indexed repository is the interim source of truth. Treat the corpus as read-only: no agent writes to it, ever.
- Ungrounded agents invent heroes that beg. Grounded agents quote.
