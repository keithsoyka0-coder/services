# Services SEO plan and page matrix

**Lane draft — for Builder and Quill, not published copy.**

The site has one services hub and six offer pages. Each page should answer a different buying question, use evidence relevant to that offer, and make the next step clear. These are proposed search-intent assignments, not ranking promises or search-volume findings.

## Source decisions and boundaries

- [Builder spec §3, §6, §9](../../../specs/builder-spec.md) governs the route set and technical SEO contract. The hub is `/`; all six spokes are directly below the root. Do not carry forward `/services/` from the older plan.
- [Hub-and-spoke plan](../../../specs/hub-and-spoke-plan.md) supplies intent, page anatomy, and proof-link rules; its standalone-site addendum supersedes its original hosting arrangement.
- [Root README](../../../README.md) confirms the offers, indicative commercial values, React stack, and lane ownership. [Care package](../../../specs/care-package.md) supplies relevant build-quality claims, not a blanket promise that an audit delivers a deployed build.
- The inspected checkout contains these four source documents, not a site implementation, build configuration, final domain, approved commercial offering file, or proof inventory. This is a requirements handoff, not a technical audit or claim that implementation checks pass.
- The task's approval is the working authorization. The source builder spec still labels itself DRAFT; the coordinator should reconcile that status without this lane changing it.

**Source hierarchy:** exact prices, credit conditions, payment terms, scope, exclusions, and timelines must ultimately match the approved October 17 offering spec referenced by Builder. That file is absent here. Do not import the stale portfolio prices. Do not add unsupported testimonials, client identities, performance claims, route counts, or outcome statistics.

**Language:** public copy uses “Digital Intelligence (DI).” The inherited `/ai-.../` slugs stay exactly as approved. The older intent table includes legacy search wording using “AI”; this draft maps the same buyer needs into DI wording without claiming equivalent query demand. If Quill proposes a legacy search-term variant in metadata, obtain Keith's terminology decision first; do not rename routes or stuff synonyms into headings.

No external keyword research was needed for this repository-defined intent assignment. There are no volume, difficulty, competitor, or ranking claims. Public prospect-facing text and metadata must omit restricted commercial mechanisms; they are not part of this SEO proposition.

## Seven-page intent and metadata matrix

Titles and H1s below are **directions for Quill**, not approved final marketing copy. Meta descriptions are content briefs, not text to ship verbatim. Prefer clear, distinct titles and useful descriptions over rigid character-count targets; preview likely truncation after copy approval. Search engines may choose different snippets and titles.

| Exact URL | Buyer intent and suggested search wording | Proposed title direction | Proposed single H1 direction | Meta description guidance |
|---|---|---|---|---|
| `/` | Commercial orientation: hire Keith; choose between a website, an assessment, an operations sprint, and a larger build. Suggested wording: “Keith Soyka services,” “web development and DI consulting.” Own the service menu, not all six detailed intents. | `Web Development & DI Services | Keith Soyka` | `Web development and Digital Intelligence services` | Identify Keith as the provider; explain bounded services, transparent scope, and the free fit consultation. Summarize the offer categories without listing every price or implying free specification work. |
| `/website-build/` | Transactional: a buyer starting a small-business website from scratch. Suggested wording: “small business website build,” “freelance web developer.” Not an existing-site refresh or an open-ended application. | `Small Business Website Build | Keith Soyka` | `A four-page website built for your business` | State the four-page boundary and $2,900 once commercially verified. Name relevant handoff/documentation value and invite a fit consultation. Do not imply branding, hosting, maintenance, unlimited revisions, or a delivery deadline is included without the offering spec. |
| `/ai-opportunity-audit/` | Assessment: decide whether and where DI fits before commissioning implementation. Suggested wording: “DI opportunity audit,” “should my business use Digital Intelligence.” | `DI Opportunity Audit for Your Business | Keith Soyka` | `Find where Digital Intelligence fits—and where it does not` | Describe a $950 assessment and a documented decision, subject to confirmed deliverables. Emphasize fit rather than guaranteed savings; do not promise working integrations as an audit outcome. |
| `/ai-ops-sprint/` | Operational improvement: a bounded two-week engagement focused on an existing workflow. Suggested wording: “operations automation consultant,” “DI operations sprint.” Distinguish from infrastructure AIOps monitoring and a full custom-software build. | `Two-Week DI Operations Sprint | Keith Soyka` | `A two-week sprint for a defined operational need` | Include $2,500 and two weeks after commercial confirmation; identify the actual workflow boundary when supplied. Do not invent specific automations, tool integrations, time savings, or unlimited implementation. |
| `/codebase-audit/` | Diagnostic and refresh: someone already has a codebase or website and needs to understand and improve it. Suggested wording: “codebase audit,” “website refresh service.” Not the from-scratch website offer. | `Codebase Audit & Website Refresh | Keith Soyka` | `Audit and refresh the website or codebase you already have` | Explain assessment of existing work and scope-led next steps. Say pricing is scoped; no invented starting price or assertion that all remediation is included. Confirm how audit and refresh phases are sold before describing them. |
| `/custom-software/` | Transactional: commission a defined software solution beyond the four-page site. Suggested wording: “custom software developer,” “small business software build.” | `Fixed-Scope Custom Software Development | Keith Soyka` | `Custom software with a defined scope and handoff` | Describe fixed-scope work and the $8,500–$10,000 range only as approved. Focus on the buyer's defined system and maintainable handoff; do not suggest every application fits that range or promise unspecified features. |
| `/ai-integration/` | Implementation: a small business wants DI integrated into an existing product or workflow. Suggested wording: “DI integration consultant,” “small business chatbot integration” only where chatbot scope is confirmed. Not a decision-only audit. | `Digital Intelligence Integration for SMBs | Keith Soyka` | `Integrate Digital Intelligence into a defined business workflow` | Describe the $9,500 bounded integration and documentation/handoff where applicable. Confirm supported systems and deliverables first. No claims of universal compatibility, compliance certification, autonomous decision-making, or guaranteed return. |

**Shared content order:** outcome → verified price and boundary → included/not included → relevant proof → applicable care standards → process/discovery → bounded consultation CTA. The hub briefly explains the non-predatory fit standard. Discovery remains a hub section and spoke process step, never an eighth page. README says $600 credited to build; obtain the approved credit applicability and terms before Quill writes a broader promise.

## Canonical and Open Graph contract

Use `ORIGIN` in this plan to mean the **Keith-approved HTTPS production origin without a trailing slash**. It is a notation, not a value that may ship. No production domain has been supplied; do not infer one from the portfolio or runtime.

| Page | Canonical and `og:url` | Graph role |
|---|---|---|
| Hub | `ORIGIN/` | `CollectionPage` with a six-item offer list |
| Website build | `ORIGIN/website-build/` | `WebPage` whose main entity is its own `Service` |
| Opportunity audit | `ORIGIN/ai-opportunity-audit/` | `WebPage` whose main entity is its own `Service` |
| Operations sprint | `ORIGIN/ai-ops-sprint/` | `WebPage` whose main entity is its own `Service` |
| Codebase audit | `ORIGIN/codebase-audit/` | `WebPage` whose main entity is its own `Service` |
| Custom software | `ORIGIN/custom-software/` | `WebPage` whose main entity is its own `Service` |
| DI integration | `ORIGIN/ai-integration/` | `WebPage` whose main entity is its own `Service` |

Builder implements exactly one absolute self-canonical per indexable page. Do not canonicalize spokes to the hub, portfolio, or runtime. Canonicals omit query strings and fragments; preserve the approved trailing slash consistently. Redirect HTTP, alternate production hosts, and noncanonical slash forms to their final URL without chains where hosting permits. Never manufacture redirects on a domain this project does not control.

Every page needs `og:type=website`, its own `og:title`, `og:description`, and the canonical `og:url`; a consistent approved seller `og:site_name`; and an approved absolute HTTPS `og:image` with meaningful `og:image:alt`. Supply image dimensions and MIME type from the real asset. Keep social descriptions consistent with visible scope; a shared brand image is acceptable initially, while per-offer artwork is optional. Do not invent assets or leave placeholders in output. Social cards are not evidence of ranking benefit.

React must retain the live consultation/widget capabilities. Builder chooses SSR, prerendering, or equivalent route-specific delivery so direct requests expose each page's title, description, canonical, Open Graph, JSON-LD, H1, main offer content, and crawlable links in the initial HTML. A single generic client-only app shell is not acceptance evidence. The future widget is not the sole source of service content and must not block its rendering.

## Service and FAQ structured data

Use JSON-LD that describes the visible page, not a richer imaginary offer. Structured data does not guarantee indexing, rankings, or a rich search presentation.

**Shared identity:** define Keith Soyka as a `Person` provider using one stable production `@id`, such as `ORIGIN/#provider`. Confirm the seller identity with Keith before choosing a business entity instead. GestaltView is applied-capability proof, not automatically the seller. Link verified public profiles only; do not invent an address, service area, certifications, reviews, or ratings.

**Hub:** use `WebSite` plus `CollectionPage` and `ItemList` linking to the six exact canonical spoke URLs. The hub lists distinct services; do not misrepresent it as one undifferentiated `Service`. Service nodes may be referenced by their spoke `@id`s. A discovery mention does not justify a new canonical page or a seventh catalog offer.

**Each spoke:** use its canonical `WebPage` and a `Service` at `canonical + '#service'`, with `name`, accurate `serviceType`, plain-language `description`, canonical `url`, and the shared `provider`. Set `mainEntity` from the page to that service and align the description with visible approved copy. Optional properties must be supported by real content.

| Service | Price handling once approved and visibly rendered | FAQ topics for Quill to answer from the commercial source |
|---|---|---|
| Website build | `Offer` with numeric `price=2900` | What counts toward four pages? What is excluded? What files and documentation arrive at handoff? |
| Opportunity audit | `Offer` with `price=950` | What decision and written deliverable does the audit produce? Can the recommendation be not to adopt DI? Is implementation separate? |
| Operations sprint | `Offer` with `price=2500`; describe the confirmed two-week scope in content | How is the workflow selected? What fits within two weeks? What happens to work outside scope? |
| Codebase audit | Omit numeric price until actually scoped; never use zero, a guessed minimum, or “scoped” as a numeric value | What existing materials are needed? How are audit and refresh separated or combined? How is scope agreed? |
| Custom software | Prefer omitting machine-readable price until range semantics are confirmed; if the approved range is a single service price specification, use a supported `PriceSpecification` with `minPrice=8500`, `maxPrice=10000` | How is fixed scope agreed? What is excluded? How are scope changes handled? |
| DI integration | `Offer` with `price=9500` | Which systems and workflow are included? What is needed from the client? What documentation and handoff are included? |

Use `priceCurrency` only after the currency is explicitly confirmed; the source documents show dollar signs but do not spell out an ISO currency code. Do not misuse `AggregateOffer` to express one provider's project range. Do not invent availability, discounts, expiry dates, fees, maintenance entitlements, or checkout URLs.

**FAQ contract:** Quill supplies short questions and complete approved answers that are visible on the corresponding page, including accessible expandable answers if used. Builder adds `FAQPage` only where such an actual FAQ exists, with matching `Question` / `acceptedAnswer` text; do not generate hidden search-only FAQs. Hub FAQ topics can cover fit consultation versus paid discovery, offer selection, and handoff standards. Answers about credit, timing, or scope wait on the commercial source. No FAQ markup in Phase 1 if answers remain unapproved; record that dependency rather than inventing them to satisfy a checkbox. Treat FAQ markup as semantic description, not a promise of special search display, and review current search-provider eligibility during implementation.

## Internal links and proof matrix

Use ordinary accessible `<a href>` links with descriptive text, not click-only cards or keyword-repeated “learn more” labels. Hub cards link to all six exact spoke URLs; each spoke links back to `/` through navigation or a clear services link. An optional two-item breadcrumb can make that relationship explicit.

No proof-piece paths are present in this checkout. The following are **proof selection briefs**, not assertions that those artifacts exist. Quill must provide two or three verified, relevant portfolio pieces or shareable deliverable samples per spoke, with exact URLs and a sentence explaining what each proves. A link to the portfolio homepage alone does not satisfy that requirement.

| Spoke | Proof selection brief | Runtime evidence, only if relevant and verified |
|---|---|---|
| Website build | Website implementation, page-contract example, documentation or deploy/handoff sample | Link only to a verified page that demonstrates the claimed website capability; otherwise omit |
| Opportunity audit | Approved assessment sample, prioritization/fit reasoning sample, decision-oriented deliverable | Optional example showing the distinction between an appropriate DI use and a generic sales claim |
| Operations sprint | Bounded workflow implementation, documented workflow/API path, relevant handoff | A specific verified workflow demonstrating the claim, not a generic platform-count assertion |
| Codebase audit | Approved code-review/diagnostic sample, before/after refresh evidence with context, remediation plan | Only where an actual relevant improvement can be shown |
| Custom software | Defined software product, architecture/process evidence, maintainable handoff sample | Relevant product surface demonstrating the specific capability being described |
| DI integration | Working DI feature, integration/flow evidence, maintenance/documentation sample | Strong candidate for a verified relevant runtime feature |

The approved proof homes are `https://keith-soyka-portfolio.netlify.app` and `https://gestaltview-ai-v3.vercel.app`; their presence in the spec is not a fresh availability check. Final deep links require owner approval and resolution checks. The plan's historical backend route count is not independently verified and must not become copy here.

Each chosen proof piece needs a coordinated backlink to its relevant service canonical, with a factual relationship label. The portfolio primary navigation should link to the services hub. Those are sibling-repository requests, not edits authorized in this lane. No sideways routing to another spoke's proof as a substitute for this offer's evidence. A genuinely shared proof item can support two offers only with an offer-specific explanation and explicit approval. Keep cross-spoke promotional links out of Phase 1 unless the approved architecture changes.

Never link prospects to private docs, raw client material, credentials, repository internals, or unsupported claims. Do not index future widget conversations or treat generated answers as approved service copy. Phase 1 has widget mount points only; do not describe a live on-page demo as already available.

## Robots and sitemap rules

**Production index set:** exactly the hub and six canonical spokes above, returning HTTP 200 with substantive page content. Each should be crawlable and indexable after release approval. No discovery URL, obsolete `/services/` variants, hash anchors, query variants, API endpoints, or previews belong in the sitemap.

- Generate XML sitemap from one explicit seven-route source at build time. Use absolute approved HTTPS canonicals, valid XML, and no duplicate entries. Include `lastmod` only from genuine material page changes; do not stamp every rebuild as fresh content.
- Production `robots.txt` must be publicly available as plain text. Allow the seven public pages and rendering assets. Its `Sitemap:` directive must point to the real production sitemap URL. Avoid broad disallows that block React assets or hide pages from canonical/noindex inspection.
- Unknown routes must return a real 404, not the hub with HTTP 200. Do not invent a redirect from every unknown route to `/`.
- Preview/staging should use access protection where possible plus `noindex` through page/header directives; do not rely solely on a `robots.txt` disallow, because a blocked crawler cannot read page-level `noindex`. Never expose confidential content and then rely on crawl rules to protect it.
- Keep consultation APIs and any future private/client paths out of the sitemap. They need appropriate access controls; robots rules are not security controls. Do not add undeclared private route patterns just for this document.
- Gate environment settings: release must not inherit staging `noindex` or `Disallow: /`; preview must not accidentally advertise itself as a production sitemap. No indexing submission or production change is authorized by this draft.

## Validation and acceptance handoff

These are checks to run **after Builder implements**, not reported passing results.

| Check | Acceptance evidence | Owner |
|---|---|---|
| Route inventory | Seven exact URLs; direct navigation and refresh work; invalid URL returns 404; slash/host normalization has no loop | Builder |
| Initial HTML and React hydration | Fetch each route without executing JavaScript and inspect its unique head, H1, service content, JSON-LD, and links; then confirm hydration preserves them | Builder |
| Metadata | One nonempty distinct title and description, one intended primary H1, one absolute self-canonical, matching `og:url`, and complete approved social tags on all seven pages; no placeholders or stale head tags after client navigation | Builder + SEO |
| Intent and truthful copy | Each page addresses its assigned buying question, includes scoped exclusions and correct CTA, and avoids unsupported benefits; DI naming consistent | Quill + SEO |
| Commercial fidelity | Prices and bounds compare directly with approved offering file; credit terms and currency confirmed; no stale portfolio prices | Quill + Keith |
| Schema | Parse JSON-LD; validate vocabulary using Schema Markup Validator and any relevant search-provider test; verify identity, URL, price, and visible FAQ parity; document unsupported rich-result eligibility rather than promising it | Builder + SEO |
| Links and proof | Hub → six spokes; six spokes → hub; each spoke → 2–3 approved relevant proof links; relevant runtime links resolve to the intended content; portfolio backlinks tracked separately | Builder + Quill; portfolio owner for backlinks |
| Index controls | Fetch sitemap and robots; assert exactly seven canonical sitemap locations, all 200/indexable; verify no production `noindex`, duplicate variants, or preview hosts; inspect preview exclusion separately | Builder |
| Performance and semantics | Mobile performance check on every template; inspect layout shift and loading behavior; semantic landmarks, headings, descriptive links, image alternatives, keyboard access, and usable consultation form | Builder |
| Build health | Run actual repository typecheck and production build commands; inspect generated artifacts, not just source configuration; Phase 2 widget must not degrade core rendering | Builder |
| Future release verification | After Keith approves release, use the search engine's URL inspection/indexing tools as authorized; monitor actual queries and refine overlap from evidence, not ranking guarantees | SEO + authorized site owner |

**Release blockers:** missing production origin, unapproved price/scope terms, placeholder metadata/schema, missing route content, incorrect index controls, broken consultation path, or invented/unverified proof. If required FAQ answers or proof links are unavailable, report the acceptance gap; do not silently fabricate a passing result.

## Inputs needed from Builder and Quill

**Builder:** production origin and preferred host; deployment framework and route-rendering strategy; metadata/schema integration contract; sitemap filename/build hook; preview protection/indexing controls; real contact/consultation destination; approved share-image asset and dimensions; and eventual typecheck/build commands. Return the seven page scaffolds with the intent row mapped to each. Do not add keyword variants independently.

**Quill:** final offer-specific copy and FAQ answers; exact approved commercial source including exclusions, currency, and discovery credit applicability; confirmed workflow/integration scope; two or three exact proof URLs per spoke with claim-to-evidence notes; and approved provider/site naming. Coordinate portfolio navigation/backlinks with its owner rather than editing that repository here.

**Keith/coordinator decisions:** confirm production origin and seller identity; reconcile the source spec's DRAFT label with the approved commission; settle any proposed legacy search-term usage. Restricted commercial discussions remain outside prospect-facing content unless Keith separately decides otherwise.

This draft changes documentation only. It neither implements the site nor validates a deployment, opens a PR, publishes, submits indexing requests, or modifies sibling repositories.
