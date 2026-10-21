# Services widget container contract

Every spoke has one semantic `section` with stable `data-widget-mount` and `data-service-id` identifiers matching its route slug. Hub and 404 have no widget mount. Attributes and readable content are present in initial HTML.

Five spokes retain `data-widget-state="disabled"` and the dormant no-network notice. Only `/ai-integration/` uses `data-widget-state="active-in-draft"` for the disclosed four-profile form. This means the UI is rendered, **not** that its API is activated or that deployment/publication is approved. The proxy is disabled by default, requires separate configuration/admission, and returns generic unavailable errors when dependencies are absent.

The integration form calls only same-origin `POST /api/di-demo`. Services validates bounded input, derives a pseudonymous digest only from Vercel's trusted client-IP header, signs an exact-body request to the fixed Runtime endpoint, and relays only a minimal no-store result. Runtime owns canonical profile eligibility/context, quota/replay, provider work and cleanup. No visitor message/answer/session is persisted by Services or Runtime. No automatic request, retry, tracking, consultation collection or purchase unlock is added.

Mount state is descriptive, not a security boundary. Preserve static HTML readability, labels/keyboard access, safe text output, responsive layout and existing reduced-motion behavior. Do not mount through arbitrary innerHTML or advertise live availability before separately approved activation. The full Groq/profile/privacy/limits disclosure must precede the submission controls.
