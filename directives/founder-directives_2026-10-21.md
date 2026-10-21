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
