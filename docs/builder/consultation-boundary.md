# Consultation boundary — intentionally blocked

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-20 · origin: Builder

The source spec requires name, contact, interest and message. DB & Schema has supplied an internal proposal, not an approved schema or running database. Builder has not selected email-only contact, retention, project region, costs, credentials or restricted database roles on the owner's behalf.

## Implemented scaffold

The hub's `#consultation` form displays the four field labels, with the six structural service identifiers in the selector. Its entire fieldset and submit button are disabled. There is no submission handler making a request, no local storage, and no model or external-service call. The form explicitly says no details are sent or saved. Unknown options, validation limits and privacy promises have not been invented.

`api/consultation-requests.ts` matches DB & Schema's proposed same-origin endpoint name. Every POST returns HTTP 503 with the static response below, without inspecting, echoing, logging, validating or saving request content:

```json
{"ok":false,"code":"SERVICE_UNAVAILABLE"}
```

Other methods return 405, `Allow: POST`, and `METHOD_NOT_ALLOWED`. All responses are `Cache-Control: no-store`. There is no success branch. The local Vite server does not execute Vercel functions; unit tests invoke the stub handler directly.

## Required before enabling the form

Obtain the owner's decision on the catalog strategy and DB contract; finalize contact format, validation rules, privacy disclosure, retention/deletion and server access mode. Provision only the authorized separate services database and restricted writer. Implement bounded body reading, exact field validation, trusted-origin checks, approved abuse protection and parameterized writes. Await a committed insert before returning `{ "ok": true }`; never claim an appointment was booked or an email sent.

Test success, rejected input, oversized bodies, unavailable storage, duplicate submits, errors, RLS and browser denial. Update hosting CSP/form rules only to the necessary approved behavior. Do not simply toggle a browser environment variable to enable the current stub.

No database provisioning, migration, credential lookup, billing action or external submission occurred in this builder task.
