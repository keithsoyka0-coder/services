# Quill content handoff

**Status: APPROVED FOR INTERNAL PLANNING ONLY — NOT APPROVED FOR PUBLICATION**

See the [planning-only approval record](../../approvals/2026-10-20-lane-drafts-planning-approval.md). Existing release blockers and proposed decisions remain in force.

Editorial drafts only. Nothing in this lane is published, implemented, committed, or approved as final prospect copy. Use the `Public copy` section of each page only after the release dependencies below are resolved. Never render the file wrapper, metadata notes, proof instructions, or internal handoff sections.

## Seven pages

| Route | Full draft | Commercial label | Display price |
|---|---|---|---|
| `/` | [Hub](00-hub.md) | Six offers plus consultation/discovery sections | Per offer |
| `/website-build/` | [Website](01-website-build.md) | Standard 4-page site | $2,900 |
| `/ai-opportunity-audit/` | [Opportunity audit](02-ai-opportunity-audit.md) | DI opportunity audit | $950 |
| `/ai-ops-sprint/` | [Sprint](03-ai-ops-sprint.md) | AI Ops Sprint, two weeks | $2,500 |
| `/codebase-audit/` | [Existing-code audit](04-codebase-audit.md) | Codebase / website audit + refresh | scoped |
| `/custom-software/` | [Custom software](05-custom-software.md) | Custom software (small tool, fixed scope) | $8,500–$10,000 |
| `/ai-integration/` | [Integration](06-ai-integration.md) | DI integration (SMB, fixed scope) | $9,500 |

## Sources and SEO coordination

Commercial authority read in full: `/home/ubuntu/upload/web-build-offering-spec_2026-10-17.md`. This file is available in the shared environment even though it is not copied into the checkout. SEO's matrix says it was absent from the inspected checkout; that does not mean Quill lacked it. Exact names and prices above follow its approved pricing table wherever an entry exists. Sprint and audit/refresh have no entry there; their exact labels and price tokens come from the attested plan's offer table and still need commercial scope confirmation.

Read and applied [Builder §§2–6](../../../specs/builder-spec.md), [attested architecture and standalone-site addendum](../../../specs/hub-and-spoke-plan.md), and [care baseline](../../../specs/care-package.md). Root routes follow Builder's later direction, not the older `/services/` paths. No external keyword research, competitor statistics, or invented demand claims are used.

SEO matrix reviewed: [SEO plan and page matrix](../seo/seo-plan-matrix.md). The drafts retain its distinct buyer-intent assignments, exclusions, root route set, proof selection briefs, fit CTA, and conditional runtime-proof rules. Title proposals follow its matrix with the Sprint's exact commercial name retained rather than silently renamed. H1s retain exact offer labels; the hub H1 names Keith and the service categories. This is a deliberate name-fidelity choice, not a competing keyword assignment. Meta descriptions are Quill proposals, not live head tags. SEO should review titles/H1s and snippet truncation with Builder after commercial approval. No new keywords are assigned.

SEO's desired documented audit decision cannot be expanded to a report format without approval. Its request for a workflow/integration boundary cannot be answered from these sources. FAQs include only supported answers; unanswered topics are recorded below rather than fabricated. Builder must not create hidden FAQ answers or mark drafts approved.

## Public-copy guardrails

- Public prose uses Digital Intelligence (DI). The exact approved label `AI Ops Sprint, two weeks` and inherited `/ai-.../` routes are retained.
- Free consultation is $0 and fit-only, with no free specification work or design. Discovery is `Discovery (scoped, paid)` at $600, credited **toward build on acceptance**. No automatic discovery prerequisite for audits or automatic service-wide credit is implied.
- Build care includes scripts, Dockerized portability, documentation, tailored workflows/skills, relevant flow docs, troubleshooting, provenance, page contracts where applicable, and green tests before handoff. Audit-only work is not promised a software delivery kit.
- The maintenance collaborator in the integration care package is not a maintenance retainer or the future services-site client-onboarding companion.
- Phase 1 copy does not advertise live embedded demos or post-purchase onboarding. Internal commercial enforcement mechanics are excluded from public copy and metadata at Keith's direction.
- No testimonials, client identities, revenue/savings claims, route counts, universal compatibility, specialist compliance promises, or new tool-stack promises are introduced.

## Proof handoff

Each spoke carries two explicitly labeled proof placeholders with a selection brief and claim limit. Those are not assertions that assets exist. Integration additionally carries the source-provided runtime URL, labeled as Keith's own platform—not client evidence or the scope of the offer. It has not been represented as freshly availability-checked.

Before release, provide exact approved URLs and factual descriptions for W1/W2, A1/A2, S1/S2, C1/C2, T1/T2, and I1/I2. Prefer offer-relevant portfolio pieces or shareable delivery-kit samples. Do not replace missing deep links with the portfolio homepage or another spoke's proof. Portfolio owner coordinates each proof item's backlink to the relevant service; no sibling repo edits were made. Runtime deep links are added only where a verified feature supports that page's specific claim. Final resolution checks belong to release acceptance, not this draft's verification.

## Missing source facts — decisions, not guesses

1. **Sprint delivery scope:** only label, price, and two-week duration are supplied. Need the eligible problem/workflow, deliverables, boundaries, prerequisites, acceptance criteria, costs, and duration/start rules. Sprint draft is not a release-ready bounded package.
2. **Codebase audit/refresh:** need the audit output, review coverage, whether refresh is included/optional/separate, included change boundaries, inherited-code test responsibilities, access requirements, and price. No specialist security/accessibility/performance audit is promised.
3. **Opportunity audit:** need the written deliverable format/contents, review coverage, input requirements, timeline, and whether discovery is ever required. No report length, roadmap, interview count, or guaranteed result is invented.
4. **Custom software and integration:** need eligible work, concrete boundaries, acceptance criteria, prerequisites, and external-service ownership/cost treatment. The custom-software range has no approved tier criteria; do not derive feature tiers. Integration explicitly passes through API subscription costs and applicable custom database costs.
5. **Discovery credit:** the source says 'credited toward build on acceptance.' Define acceptance, eligible build types, and treatment for audits/non-build sprints before expanding that sentence. No expiry or refund term is supplied.
6. **Pre-sale mock boards:** source says two UI/UX mock boards plus customized spec sheet before implementation, while the free consultation excludes free design/spec work. Need approved timing, conditions, whether a paid stage covers them, and current applicability of the source's 3–4-round stop rule. Omitted from public promises pending that clarification, not rejected as an approved differentiator.
7. **Solo-founder rule:** Builder asks for it but no separate rule is defined in the supplied sources. Copy uses only the supported solo/low-overhead/no-agency-markup rationale and non-predatory fit standard. No buyer-eligibility rule is invented.
8. **Other commercial details:** hosting shortlist and costs, logo/branding boundaries, revision/change rules, payment split, offer-specific schedules, and terms/privacy content and legal-review responsibility are not fixed here. Currency is displayed exactly with `$`; no ISO currency code is inferred.
9. **Implementation inputs:** final production origin, approved seller/site naming, real consultation behavior, social assets, and proof inventory remain with their owners. Anchor CTAs point to `/#consultation`; they do not assert that a form or booking service already works.

## Acceptance status

Draft-content checks only: seven exact route declarations; every spoke has outcome, included/not-included, discovery, CTA, two relevant proof placeholders, and a hub backlink. Names/prices are compared directly with their stated sources. Public-copy scans exclude gated mechanics and legacy terminology outside the exact approved Sprint label. All authored files are under `docs/lanes/content/`.

Not validated or claimed: React rendering, build/typecheck, consultation submission, live proof availability, portfolio backlinks, canonical origin, schema, sitemap, robots, or deployment. Those require implementation and owner approvals. No React files, specifications, SEO files, or pricing source are edited by this lane.
