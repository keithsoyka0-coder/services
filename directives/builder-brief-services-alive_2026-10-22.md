# Builder Brief — Services Page: Alive Like the Runtime

**Source:** Keith, 2026-10-22. Reference material: Museum of Impossible Things (design DNA, ~1yr) + runtime Home/Welcome themes (current).

## The direction

The services page should **embody the care and intention of the runtime** — not generic palette matching. The model is the runtime home screen (`client/src/pages/Home.tsx`): it doesn't list features, it opens **rooms**. Each room is a glass card with its own neon glow identity, floating embers, fog, motion.

**Treat the six services as rooms, not rows.**

## Deltas (3, same as before — now specified)

### 1. List → room cards
Replace the text list with glass cards in the runtime's card language:
- Card: dark glass — `bg-black/20`-equivalent over the obsidian base, `backdrop-blur-xl`, `border-white/10`, `rounded-2xl`, hover lift (`translateY(-4px)`) + glow shadow intensify.
- **Each service gets its own glow color**, like the runtime's room cards (Blackboard Room = cyan, Sanctuary = electricPurple, Dynamic Inner World = neonPink…). Assign per service, e.g.:
  - Website Build — cyan `#00E5FF`
  - DI Opportunity Audit — electricPurple `#B026FF`
  - AI Ops Sprint — teal `#00FFD4`
  - Codebase Audit — blue `#0088FF`
  - Custom Software — neonPink `#FF007F`
  - DI Integration — ultraviolet `#8A5CFF`
- Card copy keeps Quill's voice (one-line, plain). Price lives on the card as a fact, not a pitch.
- Card patterns to lift: Portfolio repo cards first, then runtime `GlassCard` (`client/src/components/ui/GlassCard`), then Museum `GlassCard`.

### 2. Wake the atmosphere
The canvas exists but is asleep (`data-atmosphere-state="static"`). Wake it with the runtime's alive layer:
- **Floating embers** — lift `FloatingEmbers` from the runtime (`client/src/components/FloatingEmbers`; Museum's `useEmbers` hook is the older version of the same idea). Cyan/teal/gold hues, slow rise, sparse.
- **Depth** — aurora/fog layer behind: large soft radial gradients (ultraviolet + electric cyan at low opacity), slow drift. Runtime uses `FogOverlay`; Museum uses `AuroraBackground` (40s/50s rotation). Either vocabulary, same feeling.
- **Base** — obsidian `#05070B` → void-navy `#0A1020` (design spec tokens), not flat black, not light.
- **Motion** — framer-motion entrances, staggered. Respect `prefers-reduced-motion` and a low-bandwidth toggle (runtime has `UserSurfaceSettings` — mirror the pattern, don't import it).
- Must not break the SEO initial-HTML contract (founder directive §2): atmosphere is progressive enhancement, content renders in first HTML.

### 3. Keep what landed
- Quill's hero rewrite stays ("Look at the work. See how it's put together").
- The honest review-status section stays — it's load-bearing machinery, not scaffolding.
- Type: Geist for UI, Cabin Sketch accents only where the runtime uses them (logo moments). No new font introductions.

## Out of scope for this slice
- Copy changes beyond card one-liners (Quill's lane).
- Pricing/tiers changes (locked).
- Production domain, deployment protection (Keith's call, separate).
- Interactive proof widgets (separate slice, attested spec exists).

## Acceptance
- Services render as six glowing room cards on obsidian, embers drifting, no layout shift on load.
- `data-atmosphere-state` reads live, not static.
- Reduced-motion respected; first-HTML SEO contract intact.
- Keith reviews in a PR before anything merges (standing rule).
