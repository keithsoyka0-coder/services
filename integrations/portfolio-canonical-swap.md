# Builder Task Brief — Portfolio Canonical Domain Swap

© 2026 Keith Soyka / GestaltView · born:a4f8e835ddb1 · prov:2026-10-20 · origin:wren

**Repo:** `keithsoyka0-coder/Portfolio`
**Why:** the portfolio's new live domain is `keith-soyka.vercel.app`, but the site still declares the old domain everywhere — and the old domain is dead.

## Evidence (verified 2026-10-20 ~21:45 EDT)

- `https://keith-soyka-portfolio.vercel.app/` → **HTTP 402** (paused — unpaid Vercel invoice).
- `https://keith-soyka.vercel.app/` → 200, live — but its `<link rel="canonical">` points at the dead `keith-soyka-portfolio.vercel.app`.
- `https://keith-soyka-portfolio.netlify.app/` → 200, live — its canonical also points at the dead domain.
- The new domain's own `sitemap.xml` lists 9 URLs, **all** on the dead domain, zero on itself.
- Code search: 31 hits for `keith-soyka-portfolio.vercel.app` across the repo (per-page canonical tags in the HTML files, `sitemap.xml`, `sitemap.txt`, `sitemap.html`, `robots.txt`).

## The fix

Bulk replace `keith-soyka-portfolio.vercel.app` → `keith-soyka.vercel.app` in every file. Nothing else changes — same string, every occurrence.

## Verify ("not done until this list comes back green")

- [ ] Zero remaining occurrences of the old domain in the repo (code search confirms)
- [ ] `curl` the deployed `sitemap.xml` — all URLs on the new domain
- [ ] `curl` a page — canonical is self-referencing on the new domain
- [ ] PR opened for Keith's review — never direct to main, never merged by Builder

## Out of scope

- The Netlify duplicate (`keith-soyka-portfolio.netlify.app` still serving the same content) — Keith's call: redirect to Vercel or retire. One canonical, redirect the other.
- Portfolio ↔ runtime ↔ services cross-linking — separate task once the services site deploys (rules are in the services repo's hub-and-spoke plan).
