# Services draft quickstart

## Run the slice

From this repository checkout:

```bash
npm ci
npm run check
npm run preview -- --port 4174
```

Open `http://127.0.0.1:4174/` on the same computer. Dev and preview bind to loopback; `npm run dev` regenerates the unchanged draft content before serving. The hub and six exact spokes remain draft/noindex. The consultation form is disabled. No Services database is used by the demo.

Vercel's command is `npm run build`, output `dist`. `npm run verify:build` is a local-only quality check included in `npm run check`, not a deployment gate. Release/origin variables neither prevent a build nor enable SEO. No demo settings are needed to build; the API is disabled by default. Build success and an automatic preview are not demo activation or publication approval.

## Inspect the integration draft

Only `/ai-integration/` mounts the demo UI. The other five spoke mounts stay dormant; the hub and 404 have none. Four profiles, full pre-submit Groq disclosure, transient text output and generic unavailable/quota states are included. The UI's `active-in-draft` state describes a rendered form, not live service availability.

The local Vite server does not execute Vercel Functions. Without mocking, submitting locally gets a generic unavailable result. Test the proxy through its injected offline transport; do not use a live Runtime call for verification.

```bash
npx playwright install chromium
npm run test:e2e
```

For an already installed Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path for the test command. Browser tests use loopback only, block all external requests, and intercept `/api/di-demo` with synthetic responses. They do not contact Runtime, Groq, Supabase or telemetry.

## Separate activation, not a build gate

Server-only names, with blank values only, are in `.env.example`: `GESTALTVIEW_RUNTIME_API_BASE`, `DI_DEMO_SERVICE_SIGNING_SECRET`, `DI_DEMO_VISITOR_HMAC_SECRET`, `DI_DEMO_ENABLED`. No client-prefixed settings or Services database credentials. Signing and visitor-HMAC keys are distinct. Direct Vercel ingress is assumed: only `x-vercel-forwarded-for` supplies client identity. Re-evaluate that trust path if adding an upstream/Trusted Proxy.

Runtime PR #46 is merged; its hosted migration/settings remain separate owner work. Before separately enabling admission, the owner must configure Runtime and Services, apply the reviewed Runtime migration/RPC, and install the **Services-edge only** WAF rule: source-IP fixed window, `POST /api/di-demo`, 10 requests per 10 minutes, default 429. Do not apply that per-IP rule to Runtime, which sees the proxy as caller. Regional WAF counters do not replace Runtime's atomic five-per-visitor UTC-hour / 50-per-UTC-day caps. Code cannot establish that WAF exists.

Signing-key rotation must retain compatible Runtime verification keys for at least ten minutes with a stable replay key. Replay-key changes require disabled admission and a ten-minute drain before rotation and separate re-enablement. Rotate visitor-HMAC keys only at a UTC-hour boundary with admission drained, absent a reviewed cross-version design, to avoid resetting hourly caps. These are operator notes, not actions performed here.

## Draft and review boundaries

Every page and 404 keeps `DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION`, noindex/nofollow metadata and response headers, crawler disallowance, no sitemap, no canonical/OG/schema and existing security headers. Same-origin `connect-src 'self'` is unchanged. Noindex is not access control.

Keith approved only the automatic Services preview resulting from this slice's push/PR. No manual deployment, merge, production release, publication, indexing, live migration, secrets/WAF setup or consultation enablement is authorized. Hub hero/canvas/visual refresh, Shopify and Netlify are later/separate lanes. Frozen lane copy, prices, discovery credit, fictional-sample labels and other commercial boundaries remain unchanged.
