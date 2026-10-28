// © 2026 Keith Soyka / GestaltView · provenance: local draft preview builder
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App';
import { getPage } from '../src/content';

const marker = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';
const routes = ['website-build', 'ai-opportunity-audit', 'ai-ops-sprint', 'codebase-audit', 'custom-software', 'ai-integration'];
afterEach(cleanup);
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

describe('authorized local-only Quill draft preview', () => {
  it.each(['/', ...routes.map((slug) => `/${slug}/`), '/does-not-exist/'])('conspicuously labels %s as internal-only', (path) => {
    render(<App path={path} />);
    expect(screen.getByText(marker)).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
  it('renders the Quill hub prose and links to all six exact spoke routes', () => {
    expect(getPage('/')?.h1).toBe("Look at the work. See how it's put together.");
    const { container } = render(<App path="/" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("Look at the work. See how it's put together.");
    expect(container.querySelector('.hero .lede')).toBeNull();
    expect(container.querySelector('.draft-copy__prose')?.textContent).toContain('Start with what your business needs — not a bigger build than you can use.');
    expect(screen.getByRole('heading', { name: 'Care is part of the build — not an upgrade' })).toBeTruthy();
    for (const slug of routes) expect(container.querySelector(`a[href="/${slug}/"]`)).not.toBeNull();
    expect(container.querySelector('#consultation')).not.toBeNull();
    expect(container.querySelector('#discovery')).not.toBeNull();
    expect(container.querySelector('#review-status')).not.toBeNull();
  });
  it('renders the owner-supplied validation badge only on the hub without enabling consultation', () => {
    const { container } = render(<App path="/" />);
    const badge = container.querySelector<HTMLImageElement>('img.validation-badge');
    expect(badge?.getAttribute('src')).toBe('/brand/pepperdine-quarterfinalist-2025.svg');
    const intro = container.querySelector('.draft-copy__prose')!;
    expect(intro.textContent).toContain('Pepperdine University Most Fundable Companies — Quarterfinalist 2025');
    expect(intro.textContent).toContain('Top 100 of 2,300 startups · Solo, unfunded.');
    expect(container.querySelector<HTMLFieldSetElement>('#consultation fieldset')?.disabled).toBe(true);
    expect(container.querySelector('#consultation button')?.hasAttribute('disabled')).toBe(true);
    expect(container.querySelectorAll('[data-widget-mount]')).toHaveLength(0);
    cleanup();

    const { container: spoke } = render(<App path="/website-build/" />);
    expect(spoke.querySelector('img.validation-badge')).toBeNull();
  });
  it('renders one decorative atmosphere on every route while keeping initial HTML text', () => {
    for (const path of ['/', ...routes.map((slug) => `/${slug}/`), '/does-not-exist/']) {
      const html = renderToStaticMarkup(<App path={path} />);
      expect(html.match(/<canvas\b/g)?.length ?? 0).toBe(1);
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain(marker);
      expect(html).toContain('<h1>');
    }
  });
  it.each(routes)('renders %s draft prose with visible unresolved proof and scope', (slug) => {
    const { container } = render(<App path={`/${slug}/`} />);
    expect(screen.getByText('Scope approval pending')).toBeTruthy();
    expect(screen.getByText('Proof approval pending')).toBeTruthy();
    expect(container.querySelectorAll('[data-proof-placeholder]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-proof-placeholder] a')).toHaveLength(0);
    expect(container.querySelectorAll('article.draft-copy a[href^="https:"]')).toHaveLength(0);
    if (slug !== 'ai-integration') expect(container.querySelector('[data-widget-mount]')?.getAttribute('data-widget-state')).toBe('disabled');
    expect(screen.getByRole('heading', { name: "What's included" })).toBeTruthy();
    expect(container.querySelector('a[href="/"]')).not.toBeNull();
    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('mounts the draft demo only on integration and preserves all other mounts as dormant', () => {
    const { container: integration } = render(<App path="/ai-integration/" />);
    expect(integration.querySelectorAll('[data-widget-mount="ai-integration"][data-widget-state="active-in-draft"]')).toHaveLength(1);
    expect(integration.querySelectorAll('[data-widget-mount]')).toHaveLength(1);
    expect(screen.getByRole('form', { name: 'Digital Intelligence draft demo' })).toBeTruthy();
    cleanup();
    for (const slug of routes.filter((route) => route !== 'ai-integration')) {
      const { container } = render(<App path={`/${slug}/`} />);
      expect(container.querySelectorAll('[data-widget-mount]')).toHaveLength(1);
      expect(container.querySelector('[data-widget-mount]')?.getAttribute('data-widget-state')).toBe('disabled');
      cleanup();
    }
    for (const path of ['/', '/does-not-exist/']) {
      const { container } = render(<App path={path} />);
      expect(container.querySelectorAll('[data-widget-mount]')).toHaveLength(0);
      cleanup();
    }
  });
  it('labels all prices as draft details, without finalizing scope or proof', () => {
    const html = renderToStaticMarkup(<App path="/" />);
    expect(html).toContain('$2,900');
    expect(html).toContain('$650');
    expect(html).not.toContain('$950');
    expect(html).toContain('$8,500–$10,000');
    expect(html).toContain('$9,500');
    expect(html).toContain('Draft prices and scope are not finalized offers.');
    expect(html).toContain('No placeholder is evidence of completed work.');
  });
  it('never submits or claims receipt, even when a submit event is dispatched', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App path="/" />);
    const form = screen.getByRole('form', { name: 'Consultation preview' });
    const fieldset = form.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Consultation unavailable in this draft preview' }) as HTMLButtonElement).disabled).toBe(true);
    for (const label of ['Name', 'Contact', 'Service interest', 'Message']) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(fireEvent.submit(form)).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toContain('No details are sent or saved');
    expect(screen.queryByText(/request received|thank you for submitting|successfully submitted/i)).toBeNull();
  });
  it('omits internal handoffs and gated mechanisms from every rendered page', () => {
    for (const path of ['/', ...routes.map((slug) => `/${slug}/`)]) {
      const html = renderToStaticMarkup(<App path={path} />);
      expect(html).not.toMatch(/Internal handoff|license.key|degraded.mode|application\/ld\+json|rel="canonical"/i);
    }
  });
  it('does not turn unknown paths into a service page', () => {
    render(<App path="/does-not-exist/" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
  });
  it('matches slashless service URLs to the same draft route', () => {
    render(<App path="/website-build" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Standard 4-page site');
  });
});

describe('hub offer cards in mounted and initial HTML', () => {
  const offers = [
    ['standard-4-page-site', 'Standard 4-page site', '$2,900', '/website-build/', 'See the website-build scope'],
    ['di-opportunity-audit', 'DI opportunity audit', '$650', '/ai-opportunity-audit/', 'See the opportunity-audit scope'],
    ['ai-ops-sprint-two-weeks', 'AI Ops Sprint, two weeks', '$2,500', '/ai-ops-sprint/', 'See the sprint scope'],
    ['codebase-website-audit-refresh', 'Codebase / website audit + refresh', 'scoped', '/codebase-audit/', 'See the audit-and-refresh scope'],
    ['custom-software-small-tool-fixed-scope', 'Custom software (small tool, fixed scope)', '$8,500–$10,000', '/custom-software/', 'See the custom-software scope'],
    ['di-integration-smb-fixed-scope', 'DI integration (SMB, fixed scope)', '$9,500', '/ai-integration/', 'See the integration scope'],
  ];

  function assertCards(container: ParentNode) {
    const draft = container.querySelector('article.draft-copy[aria-label="Quill page draft"]')!;
    expect(draft).not.toBeNull();
    const grid = draft.querySelector('.service-grid');
    expect(grid).not.toBeNull();
    expect(draft.querySelectorAll('.service-grid')).toHaveLength(1);
    const cards = [...draft.querySelectorAll('article.service-card')];
    expect(cards).toHaveLength(6);
    const original = document.createElement('div');
    original.innerHTML = getPage('/')!.bodyHtml;
    offers.forEach(([id, name, price, href, label], index) => {
      const card = cards[index]!;
      expect(card.getAttribute('aria-labelledby')).toBe(id);
      expect(card.getAttribute('data-room')).toBe(href.slice(1, -1));
      expect(card.hasAttribute('style')).toBe(false);
      expect(card.querySelector(`h3#${id}`)?.textContent).toBe(name);
      expect(draft.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
      expect(card.querySelector('.price')?.textContent).toBe(price);
      expect(card.querySelectorAll('a')).toHaveLength(1);
      expect(card.querySelector('a')?.getAttribute('href')).toBe(href);
      expect(card.querySelector('a')?.textContent).toBe(label);
      const sourceHeading = original.querySelector(`#${id}`)!;
      const fields: Element[] = [];
      let sibling = sourceHeading.nextElementSibling;
      while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2') {
        fields.push(sibling);
        sibling = sibling.nextElementSibling;
      }
      expect(card.querySelector('.service-card__outcome')?.innerHTML).toBe(fields[1]!.innerHTML);
      expect(card.querySelector('.service-card__included')?.innerHTML).toBe(fields[2]!.innerHTML);
      expect(card.querySelector('.service-card__excluded')?.innerHTML).toBe(fields[3]!.innerHTML);
      expect(card.querySelector('.service-card__included strong')?.textContent).toBe('Included:');
      expect(card.querySelector('.service-card__excluded strong')?.textContent).toBe('Not included:');
    });
    expect([...draft.children].map((element) => element.className)).toEqual(['draft-copy__prose', 'service-grid', 'draft-copy__prose']);
    expect(draft.firstElementChild?.querySelector('#find-the-right-starting-point')).not.toBeNull();
    expect(draft.lastElementChild?.firstElementChild?.id).toBe('care-is-part-of-the-build-not-an-upgrade');
    for (const id of ['consultation', 'consultation-copy', 'discovery']) expect(container.querySelector(`#${id}`)).not.toBeNull();
    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Wrapper differences are deliberate; source text and inline markup remain intact.
    const textBlocks = (root: ParentNode) => [...root.querySelectorAll('h2,h3,p,a')]
      .filter((node) => node.tagName !== 'A' || node.parentElement?.tagName !== 'P')
      .map((node) => node.textContent?.replace(/\s+/g, ' ').trim());
    expect(textBlocks(draft)).toEqual(textBlocks(original));
  }

  it('renders six complete bounded offers once in the mounted DOM', () => {
    assertCards(render(<App path="/" />).container);
  });

  it('renders all details and exclusions before JavaScript or effects', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<App path="/" />);
    assertCards(container);
    expect(container.querySelector('#review-status')?.nextElementSibling?.classList.contains('draft-copy')).toBe(true);
    for (const note of getPage('/')!.reviewNotes) expect(container.querySelector('#review-status')?.textContent).toContain(note);
    expect(container.querySelector('fieldset')?.disabled).toBe(true);
  });

  it('retains complete hero and review markup for every route', () => {
    const protectedMarkup = ['/', ...routes.map((slug) => `/${slug}/`)].map((path) => {
      const container = document.createElement('div');
      container.innerHTML = renderToStaticMarkup(<App path={path} />);
      return { path, hero: container.querySelector('.hero')?.outerHTML, review: container.querySelector('#review-status')?.outerHTML };
    });
    expect(protectedMarkup).toMatchInlineSnapshot(`
      [
        {
          "hero": "<section class="hero"><p class="eyebrow">Quill copy · local draft review</p><h1>Look at the work. See how it's put together.</h1><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>Proof items W1, W2, A1, A2, S1, T1, T2, I1, and I2 are supplied; S2, C1, and C2 remain unavailable.</li><li>Production domain and approved site naming remain unresolved.</li><li>The consultation path, submission contract, database, and privacy/retention decisions remain owner-controlled; the preview stays disabled.</li><li>Hosting, terms/privacy responsibility, branding, revisions, payment timing, schedules, Discovery-credit conditions, and other commercial details remain unresolved.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
        {
          "hero": "<section class="hero"><a class="back-link" href="/">← All service drafts</a><p class="eyebrow">Quill copy · local draft review</p><h1>Standard 4-page site</h1><p class="lede">Local draft for review; not a final offer or a live purchasing path.</p><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/website-build/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>Approved proof samples are not supplied; hosting, changes/revisions, schedule, payment split, and terms/privacy content and responsibility remain unsettled.</li><li>The timing and conditions for pre-sale design materials need confirmation; the consultation remains fit-only.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
        {
          "hero": "<section class="hero"><a class="back-link" href="/">← All service drafts</a><p class="eyebrow">Quill copy · local draft review</p><h1>DI opportunity audit</h1><p class="lede">Local draft for review; not a final offer or a live purchasing path.</p><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/ai-opportunity-audit/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>The written deliverable, review coverage, required inputs, timeline, and whether discovery is ever needed remain to be defined.</li><li>The two evidence examples are placeholders; no completed audit or result is asserted.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
        {
          "hero": "<section class="hero"><a class="back-link" href="/">← All service drafts</a><p class="eyebrow">Quill copy · local draft review</p><h1>AI Ops Sprint, two weeks</h1><p class="lede">Local draft for review; not a final offer or a live purchasing path.</p><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/ai-ops-sprint/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>Only the two-week duration and displayed price are stated; eligible work, deliverables, boundaries, prerequisites, acceptance, costs, and start/end rules need approval.</li><li>Discovery applicability and relevant proof examples remain unresolved.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
        {
          "hero": "<section class="hero"><a class="back-link" href="/">← All service drafts</a><p class="eyebrow">Quill copy · local draft review</p><h1>Codebase / website audit + refresh</h1><p class="lede">Local draft for review; not a final offer or a live purchasing path.</p><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/codebase-audit/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>Audit output and coverage, whether refresh is optional or included, change limits, inherited-code testing, access, timing, and price need agreement.</li><li>The proof examples are placeholders; no specialist security, accessibility, or performance review is promised.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
        {
          "hero": "<section class="hero"><a class="back-link" href="/">← All service drafts</a><p class="eyebrow">Quill copy · local draft review</p><h1>Custom software (small tool, fixed scope)</h1><p class="lede">Local draft for review; not a final offer or a live purchasing path.</p><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/custom-software/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>Eligible work, scope boundaries, acceptance criteria, prerequisites, and the criteria for choosing a final price within the displayed range need agreement.</li><li>External-service cost treatment, design-material timing, payment details, and proof examples remain unresolved.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
        {
          "hero": "<section class="hero"><a class="back-link" href="/">← All service drafts</a><p class="eyebrow">Quill copy · local draft review</p><h1>DI integration (SMB, fixed scope)</h1><p class="lede">Local draft for review; not a final offer or a live purchasing path.</p><a class="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a></section>",
          "path": "/ai-integration/",
          "review": "<section class="block review-notes" id="review-status" aria-labelledby="review-title"><p class="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2><p class="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p><div class="status-grid"><div class="status-card"><span class="status-label">Unresolved</span><h3>Scope approval pending</h3><ul><li>Eligible workflows and connected systems, access/data boundaries, acceptance criteria, prerequisites, and external-service ownership need agreement.</li><li>Proof assets and the availability of any relevant external runtime reference remain unverified; applicable external costs must be confirmed in scope.</li></ul></div><div class="status-card"><span class="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div><div class="status-card"><span class="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div></div></section>",
        },
      ]
    `);
  });
});
