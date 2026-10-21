# Services database & data contract — lane draft

**Status: APPROVED FOR INTERNAL PLANNING ONLY — NOT APPROVED FOR PUBLICATION**

See the [planning-only approval record](../../approvals/2026-10-20-lane-drafts-planning-approval.md). Existing release blockers and proposed decisions remain in force.

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-20 · origin: DB & Schema lane

**Internal review draft, not a migration or launch authorization.** Keith approved preparation of this lane at 21:48 EDT on 2026-10-20. The choices below are proposals unless explicitly sourced to the repository. No project, database connection, migration, runtime code, or deployment is created by this document.

## Recommendation

For Phase 1, keep the six approved offers in a versioned, hardcoded catalog and persist only consultation requests in a **separate services Supabase project**. Put one server-owned submission endpoint between the React form and the database. Visitors do not need accounts and cannot read, list, update, or delete consultation rows directly.

Alternatives: a database-backed catalog supports editing without a site release but adds synchronization, publication, and access-control work; direct anonymous database inserts remove an API hop but make validation and abuse control harder to enforce. Neither is recommended for Phase 1. Keith must confirm the hardcoded-catalog option allowed by the spec.

## Repository basis and boundaries

- [Builder spec §7](../../../specs/builder-spec.md#7-data-contract-db--schemas-lane--builder-codes-to-the-interface): separate Supabase project; catalog read interface or approved hardcoding; consultation writes with name, contact, interest, message; no secrets in the repo; `VITE_*` hygiene.
- [Builder spec §§3–4](../../../specs/builder-spec.md#3-architecture-from-the-attested-plan): standalone hub `/`, six exact spoke slugs, discovery as a section/step, React Phase 1, widget in Phase 2.
- [Hub-and-spoke plan, addendum](../../../specs/hub-and-spoke-plan.md#addendum-2026-10-20-2125--standalone-services-repo-keiths-direction): standalone services site supersedes the earlier portfolio `/services/` home.
- [Root README](../../../README.md): current offer prices, workflow, and team boundaries. The referenced approved October 17 commercial offering document is **not present in this repository**. Values below mirror the README and builder spec; final catalog approval must still be checked against that authority. Do not invent full commercial scopes from the short summaries available here.

Inspection found only README/spec source files tracked at the start of this lane: no application, package manifest, server adapter, migrations, env registry, or existing database contract. Endpoint and table names below are proposed interfaces, not existing paths or deployed resources. Other lanes' draft documents are not commercial authority.

This lane does not add checkout, deposits, customer accounts, scheduling, CRM, consultation transcripts, widget history, DI processing, analytics attribution, or integration with the portfolio/runtime database. Consultation content must not be sent to a model or copied into another ecosystem datastore by default.

**Public-copy gate:** license-key and degraded-mode mechanics remain internal/gated. Despite broader care-package wording in the builder spec, do not expose these mechanics in catalog DTOs, public scope text, structured data, errors, notifications to visitors, or generated public content. Keith decides separately whether to discuss them in discovery. This file is internal design material, not publishable site copy.

## 1. Service catalog contract

### Stable identifiers and current displayed prices

Use these exact IDs, independent of labels. Public labels and scope copy belong to Quill/SEO and Keith's approved source, not to the schema lane.

| `id` | `href` | Price kind | Current `displayPrice` | Short scope evidence only |
|---|---|---|---|---|
| `website-build` | `/website-build/` | `fixed` | `$2,900` | From-scratch, four-page website |
| `ai-opportunity-audit` | `/ai-opportunity-audit/` | `fixed` | `$950` | DI opportunity audit |
| `ai-ops-sprint` | `/ai-ops-sprint/` | `fixed` | `$2,500` | Two-week sprint |
| `codebase-audit` | `/codebase-audit/` | `scoped` | `scoped` | Existing code/website audit + refresh |
| `custom-software` | `/custom-software/` | `range` | `$8,500–$10,000` | Fixed scope |
| `ai-integration` | `/ai-integration/` | `fixed` | `$9,500` | DI integration for SMBs |

Discovery is not a seventh service/spoke. Represent it separately in approved page content as `$600`, credited, with exact credit eligibility confirmed by Keith: the builder spec says “credited,” while the README says “credited to build.” Do not silently expand eligibility.

### Builder-facing read shape

The following TypeScript is an interface sketch inside this draft, not an implementation:

```ts
type ServiceId =
  | 'website-build'
  | 'ai-opportunity-audit'
  | 'ai-ops-sprint'
  | 'codebase-audit'
  | 'custom-software'
  | 'ai-integration';

type ServicePrice =
  | { kind: 'fixed'; displayPrice: string }
  | { kind: 'range'; displayPrice: string }
  | { kind: 'scoped'; displayPrice: 'scoped' };

type PublicService = {
  id: ServiceId;
  href: `/${ServiceId}/`;
  label: string;                 // Approved copy only.
  outcome: string;               // Approved copy only.
  scope: {
    included: readonly string[]; // Approved public scope only.
    excluded: readonly string[];
  };
  price: ServicePrice;
};

type CatalogResponse = {
  schemaVersion: 1;
  services: readonly PublicService[];
};

// Phase 1: local, read-only module used by hub, spokes and form options.
// Proposed adapter contract; no network request required.
declare function getServiceCatalog(): CatalogResponse;
```

The adapter must return exactly six unique records, validate each ID/href pair, and expose no arbitrary metadata or internal fields. Price strings are presentation, not quotes or payment amounts. Avoid adding numeric money/currency fields until a consumer needs them and Keith confirms currency/tax treatment; the repo uses `$` but does not explicitly define those policies.

### If a database catalog is later required

Defer its creation. Proposed `services_private.service_catalog` has `id text PRIMARY KEY` constrained to the six IDs, `href text UNIQUE NOT NULL` constrained to `'/' || id || '/'`, `label text NOT NULL`, `outcome text NOT NULL`, `included text[] NOT NULL`, `excluded text[] NOT NULL`, `price_kind text NOT NULL`, `display_price text NOT NULL`, `published boolean NOT NULL DEFAULT false`, and server-maintained `updated_at timestamptz NOT NULL`.

Constrain nonblank label/outcome/display price, nonempty included/excluded arrays with nonblank elements, `price_kind IN ('fixed','range','scoped')`, and exact approved price/ID combinations for the current version. Proposed text limits: label 120 characters, outcome 300, display price 40, each scope item 500, at most 30 items per array. Publication requires editorial approval and private-mechanics review, not merely passing length checks.

RLS and revoked public grants apply here too. Only a server-owned public adapter may project published, allowlisted fields into `CatalogResponse`; no direct visitor writes or admin browser key. If an HTTP catalog read is needed later, propose `GET /api/services` returning this same shape with public caching and no visitor identifiers. Do not maintain competing hardcoded and database sources: switch the adapter only with a deliberate versioned transition.

## 2. Consultation table

**Proposed relation:** `services_private.consultation_requests`, in a schema not exposed through the public Data API. A server database adapter with a restricted credential is the preferred access path; the concrete hosting/connection mode must be decided before implementation.

| Column | Proposed SQL type / rule | Purpose |
|---|---|---|
| `id` | `uuid PRIMARY KEY`, server-generated random default | Internal reference, never a browser-supplied owner ID |
| `name` | `text NOT NULL`, trimmed length 1–120 | Person's chosen name; no legal-name requirement |
| `contact` | `text NOT NULL`, trimmed length 3–254 | Proposed Phase 1 format: one email address only |
| `interest` | `text NOT NULL`, allowlist below | Offer selection or uncertainty |
| `message` | `text NOT NULL`, trimmed length 1–4000 | Inquiry in plain text |
| `created_at` | `timestamptz NOT NULL`, database time default | Submission time in UTC |
| `delete_after` | `timestamptz NOT NULL`, database-derived | Proposed absolute purge deadline |

Required fields preserve the spec's four-field interface. Email-only contact, required message, lengths, `not-sure`, and retention are **proposed decisions**, not claims of prior approval. If Keith prefers phone contact or optional message, revise this contract explicitly before Builder implements it.

### Database invariants

- Reject blank/whitespace-only required values; require stored values to equal their trimmed form. Character limits use PostgreSQL character length; the API must mirror Unicode code-point counting rather than JavaScript UTF-16 `.length` alone.
- `interest` is one of the six service IDs or `not-sure`. Do not add discovery as a service or allow arbitrary strings. No catalog foreign key is needed for the recommended hardcoded version; use a database CHECK with the same explicit IDs. A later catalog relation may replace the six-ID check with a reference, preserving a distinct `not-sure` case.
- Contact must be a single email-shaped value, contain exactly one `@`, and contain no whitespace/control characters. The API performs the fuller supported-email validation. Neither a CHECK nor a form validator proves deliverability; do not claim a verified address or require DNS lookup.
- Name/message reject NUL and unsafe control characters; message permits line breaks and tabs. Treat message as plain text, never executable HTML/Markdown/SQL. Do not strip accents, require ASCII names, or silently truncate content.
- Database assigns `id`, `created_at`, and `delete_after`. Use a BEFORE INSERT trigger to assign timestamps and a BEFORE UPDATE guard to prevent deadline/creation-time extension. Check `delete_after = created_at + interval '90 days'` for the proposed policy. No visitor-supplied timestamps or lifecycle fields.
- Default order/index: `(delete_after)` for purge batches and `(created_at DESC, id)` for internal chronological review. Primary key is the only uniqueness constraint. Never make email unique: repeat inquiries are valid.
- No IP, user agent, referrer, fingerprint, company, address, telephone, budget, attachment, marketing opt-in, account linkage, or inferred profile columns. Do not retain failed/abusive submissions as rows.

## 3. Ownership, RLS and least privilege

There are **no visitor-owned accounts or rows** in Phase 1. Keith is the business owner of consultation handling; the database has a non-login owner role distinct from the submission runtime role. Row IDs are not access tokens. Do not create an `owner_id = auth.uid()` policy for unauthenticated visitors or an email-equals-claim policy.

1. Use a separate services project and server credential; never reuse the live runtime/portfolio database or credentials. Put the table in a non-exposed schema; revoke schema/table access from `PUBLIC`, `anon`, and `authenticated`, including default privileges for future objects.
2. Enable **and force RLS** on consultation requests. No policies grant visitor roles any CRUD operation. Default deny is intentional.
3. Proposed `consultation_writer` role is `NOINHERIT`, not the owner, with no superuser/BYPASSRLS capability. Grant only schema USAGE and INSERT on the four input columns, with an INSERT policy for this role checking the same input constraints. No SELECT/UPDATE/DELETE; no `RETURNING` clause. Database-owned trigger execution must be narrowly scoped; if SECURITY DEFINER is necessary, fix its search path, fully qualify names, revoke public execution, and ensure the function returns no row data.
4. A separate backend-only reviewer role has SELECT only via an explicit RLS policy for Keith's authorized review process. A separate purge role has DELETE only for `delete_after <= now()` via RLS; full early deletion requires a distinct authorized deletion role. No public HTTP review/delete endpoints in Phase 1.
5. RLS does not protect against Supabase service-role/BYPASSRLS credentials or privileged project administrators. Do not ship such credentials to the browser or treat FORCE RLS as fixing a bypass role. Prefer the restricted database role above. If the chosen hosting adapter requires a Supabase privileged API key instead, stop for an explicit least-privilege review and revise the access contract; do not quietly replace the restricted writer with it.
6. Browser builds need no Supabase key for the recommended design. All database connection strings/credentials remain server-only, absent from `VITE_*`, source, screenshots, logs, error bodies and client bundles. Add variable **names only** to the future env registry once the hosting adapter is chosen. No real credentials belong in this draft or test fixtures.

Exact role provisioning and transport compatibility must be verified against the selected Supabase/hosting setup during later implementation; none is provisioned or tested here.

## 4. Consultation HTTP interface

**Proposed route:** `POST /api/consultation-requests`, same origin as the services frontend, JSON only. The platform/file route is undecided because the repository has no server framework yet.

```json
{
  "name": "Example Visitor",
  "contact": "visitor@example.test",
  "interest": "website-build",
  "message": "I would like to discuss a four-page site."
}
```

This is a synthetic fixture, not a real inquiry. Exact request keys are `name`, `contact`, `interest`, `message`; reject unknown keys, arrays, null, non-string values, malformed JSON, nested contact objects, and client-supplied IDs/timestamps. Proposed raw request-body limit is **32 KiB**, checked while reading the body, before parsing. Trim leading/trailing whitespace; preserve meaningful internal message formatting. Validate all fields server-side even when the React form validates too. Do not silently rewrite the email local part or lowercase it for identity matching.

**Write flow:** check method/content type/body size → exact trusted Origin allowlist → edge abuse limit → parse and normalize → field validation → parameterized single-row INSERT → await successful database commit → success. No notifications or external calls in the transaction. No success toast before commit. Origin checks are defense in depth, not authentication; bots can forge them. No session cookies or credentialed cross-origin CORS are needed. If cookie auth is introduced later, revisit CSRF explicitly.

| HTTP | Body contract | UI behavior |
|---|---|---|
| `201` | `{ "ok": true }` | Confirm request received, not appointment booked, email sent, price agreed, or response time guaranteed |
| `400` | `{ "ok": false, "code": "INVALID_REQUEST" }` | Generic malformed request; no echo |
| `422` | `{ "ok": false, "code": "VALIDATION_FAILED", "fields": { "contact": "INVALID_EMAIL" } }` | Static allowlisted field/error codes only |
| `403` | `{ "ok": false, "code": "ORIGIN_NOT_ALLOWED" }` | Generic rejection |
| `405` | `{ "ok": false, "code": "METHOD_NOT_ALLOWED" }` | Include `Allow: POST` |
| `413` | `{ "ok": false, "code": "PAYLOAD_TOO_LARGE" }` | Ask visitor to shorten message |
| `415` | `{ "ok": false, "code": "UNSUPPORTED_MEDIA_TYPE" }` | JSON required |
| `429` | `{ "ok": false, "code": "RATE_LIMITED" }` | Include `Retry-After`; no automatic retry loop |
| `503` | `{ "ok": false, "code": "TEMPORARILY_UNAVAILABLE" }` | No receipt claim; offer manual retry without promising no duplicates |

Field error codes: `REQUIRED`, `TOO_LONG`, `INVALID_EMAIL`, `INVALID_INTEREST`, `INVALID_CHARACTERS`. Do not return inserted rows, contact values, sequential IDs, SQL errors, provider details, or internal exception text. Add `Cache-Control: no-store` to every response, disable request-body capture, and keep consultation routes out of indexing/analytics replay.

**Retry policy:** no automatic retries after ambiguous network/database timeouts; no idempotency storage in the minimal schema. Disable duplicate clicks while submitting. If the response is lost after commit, another manual submission may create a second inquiry. State that internally; do not deduplicate by email/message or promise exactly-once delivery. If reliable automatic retries become a requirement, approve a separate expiring idempotency contract before implementation.

**Abuse proposal:** server/edge distributed limit of 5 attempts per 10 minutes per short-lived IP-derived HMAC key, plus a deployment-wide limit selected after capacity review. Validate at the trusted proxy boundary; never trust arbitrary forwarded headers. Do not store raw IP or HMAC keys in consultation rows or logs; limiter entries expire after 10 minutes and use a rotating server secret. Review hosting access-log retention separately because infrastructure may still record IPs. Do not launch with a process-memory limiter on a multi-instance deployment. Captcha/provider additions require a privacy and accessibility decision; fail closed with `503` if the enforced limiter is unavailable.

Builder must preserve form values only in component memory while the visitor retries; no localStorage/sessionStorage, query strings, tracking events, session replay, or third-party analytics payloads containing form content. Render every field as escaped text in any later review UI. A privacy notice should explain purpose and deletion contact; it is not marketing permission.

## 5. Retention and deletion

**Proposed default pending Keith:** purge every inquiry 90 days after database creation, including unresolved ones; no automatic reset when reviewed or contacted. Do not add status/activity tracking merely to extend retention. If an inquiry becomes a client engagement, create only necessary records under a separately approved client-retention policy; do not copy the full inquiry by default.

Later implementation must arrange a daily authorized purge with bounded batches and report only aggregate deleted counts. This draft creates no scheduled work. Queries and rows must be tested with a fixed clock; overdue rows remain inaccessible to visitors even if a purge run is delayed. Alert the operator on purge failure without copying message/contact into the alert.

Keith must choose the deletion-request contact and reviewer. Requesters use that private channel, not an unauthenticated email-search API. Verify control of the submitted contact through a proportionate private exchange; do not disclose whether a record exists to an unverified requester. An authorized deletion process removes matching verified inquiry IDs from the primary database and any controlled exports/notifications. Do not expose a database delete token to visitors.

Backups, WAL/PITR and hosting logs may outlive primary-row deletion. Confirm actual provider retention and restore behavior before publishing a privacy promise; do not claim instant deletion from backups. Keep a minimal access-restricted erasure ledger only if needed to reapply verified deletions after restoration, with its own approved expiration. It must not contain inquiry text/contact. Production restores must reconcile expirations and verified deletions before allowing normal access.

No routine CSV exports or full-content email notifications are proposed. If Keith needs notifications, prefer a generic “new consultation request” alert in an approved channel; choose the review workflow separately. Avoid building a duplicate uncontrolled inquiry archive in an inbox.

## 6. Tests to require before wiring a live form

These are acceptance requirements, **not tests executed by this documentation lane**. Run database tests only against an explicitly authorized disposable services test project/database, never the existing runtime or real inquiries.

| Layer | Required cases / pass evidence |
|---|---|
| Catalog | Exactly six unique IDs; exact root-level hrefs; prices match the approved commercial source byte-for-byte; discovery stays a section; one catalog feeds hub/spokes/form; no private-mechanics fields or text in public DTOs |
| Shared/API validation | Each required field missing/null/non-string/blank; unknown keys; every valid interest and invalid/deactivated ID; Unicode name/emoji code-point limits; exact lower/upper boundaries; CRLF and injection strings; no silent truncation; single-email checks and multiple-address rejection |
| Transport | Malformed JSON, invalid UTF-8, wrong method/type, streamed/oversized bodies, trusted/untrusted/missing/null Origin, spoofed proxy headers, no body/PII in errors, no-store on successes and failures |
| Database constraints | Bypass API and attempt invalid inserts; reject wrong interest/length/contact, forged timestamps/IDs through writer, deadline extension; accept repeated email inquiries; parameterized insertion stores malicious-looking plain text without executing it |
| RLS and grants | Fresh anon/authenticated and PUBLIC-inheriting sessions cannot read/list/insert/update/delete via Data API or direct SQL; writer can insert only four columns and cannot read/RETURNING/update/delete; reviewer read only; purge role cannot delete before deadline; privileged bypass behavior explicitly documented/tested separately |
| API integration | Valid request creates one row and returns only `201 {ok:true}` after commit; no private row projection; DB outage/constraint/timeout paths never claim receipt; lost response/manual retry behavior documented; double-click prevention tested |
| Abuse | Shared limit across two app instances, expiry, key rotation, global limit, limiter failure closed, no raw IP/contact/body in store or logs; accessibility review of rejection/retry behavior |
| Retention | Due rows deleted, future rows preserved, boundary at deadline, non-login role separation, purge failure alert, verified early deletion, restore reconciliation and deletion/export handling |
| Frontend/security | Escaped rendering; no persistent browser storage; network failures preserve form in memory; keyboard/accessibility and field-error mapping; no Supabase secret/connection string in bundle, source maps, `VITE_*`, fixtures or logs |

Launch evidence must include migration review/rollback strategy, grants and RLS inspection, validator unit tests, API integration tests, rate-limit tests, retention/deletion rehearsal, secret scanning, and the eventual app's typecheck/build commands. No `tsc`, build, RLS, or database results can be claimed now because there is no app or database implementation in this lane.

## 7. Decisions Keith still owns

1. **Catalog:** approve hardcoded Phase 1 catalog, or require a database source now? Supply/confirm the referenced approved commercial spec and final public scope copy; confirm currency/tax policy if numeric pricing is added and exact discovery credit eligibility.
2. **Contact and form:** approve email-only `contact`, required message, stated field limits, and `not-sure` interest; or specify phone/alternate-contact and optional-message requirements. Current draft is deliberately not a multi-channel identity system.
3. **Operations/access:** select services deployment/API host, Supabase project region and permitted server connection/credential mode, plus Keith's review surface and any additional authorized reviewer. A non-public database schema and restricted writer are launch requirements for this proposed design.
4. **Privacy:** approve or replace the 90-day absolute lifetime; select deletion contact, verification process, operator, backup/log/restore handling, privacy notice and applicable legal requirements. Do not publish retention or erasure commitments before these are resolved.
5. **Delivery/abuse:** choose approved notification/review channel (or none), rate-limit backing and global threshold, trusted production/preview origins; confirm that manual retry with possible duplicates is acceptable. No response-time promise is inferred.
6. **Public gate:** license-key/degraded-mode mechanics stay internal. Only Keith can decide whether they are discussed in discovery; no public catalog exposure is authorized by this draft.

## Handoff and implementation gate

Builder can review the proposed `getServiceCatalog()` shape and POST contract without credentials. Until the decisions above are settled and an authorized test environment is provisioned, use a clearly documented non-production adapter/stub; it must report “not configured”/unavailable, never fake a successful consultation receipt. Do not point a public form at the portfolio/runtime project as a shortcut.

This lane stops at this one draft. Project creation, credentials, migration code/execution, scheduling, API/UI implementation, deployment, commits and pushes require their own authorized implementation work. The next implementation handoff should resolve decisions first, then deliver reviewed migrations, rollback notes, server adapter and tests against this contract.
