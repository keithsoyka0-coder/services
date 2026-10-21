// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it } from 'vitest';
import { getPage, pages, serviceCards, services } from '../src/content';

const routes = ['/', '/website-build/', '/ai-opportunity-audit/', '/ai-ops-sprint/', '/codebase-audit/', '/custom-software/', '/ai-integration/'];
const h1s = ['Look at the work. See how it’s put together.', 'Standard 4-page site', 'DI opportunity audit', 'AI Ops Sprint, two weeks', 'Codebase / website audit + refresh', 'Custom software (small tool, fixed scope)', 'DI integration (SMB, fixed scope)'];
describe('locally rendered draft content', () => {
  it('exposes exactly seven routes sourced from internal drafts', () => {
    expect(pages.map((page) => page.path)).toEqual(routes);
    expect(services.map((page) => page.path)).toEqual(routes.slice(1));
    expect(getPage('/')).toBe(pages[0]);
    expect(getPage('/website-build')).toBe(services[0]);
    expect(getPage('/unknown/')).toBeUndefined();
    for (const page of pages) expect(page.source).toBe('draft-internal');
  });

  it('imports draft metadata and pricing and excludes the separately rendered H1', () => {
    expect(pages.map((page) => page.h1)).toEqual(h1s);
    expect(pages[0].title).toBe('Web Development & DI Services | Keith Soyka');
    expect(pages[0].description).toContain('free fit consultation');
    expect(pages.map((page) => page.price)).toEqual([null, '$2,900', '$950', '$2,500', 'scoped', '$8,500–$10,000', '$9,500']);
    for (const page of pages) {
      expect(page.bodyHtml.length).toBeGreaterThan(100);
      expect(page.bodyHtml.trim()).not.toMatch(/^<h1\b/i);
      expect(page.summary.trim()).not.toBe('');
      expect(page.faq).toEqual([]);
      expect(page.reviewNotes.length).toBeGreaterThan(0);
      expect(page.bodyHtml).not.toContain('Internal handoff');
    }
    expect(pages[0].bodyHtml).toContain('Start with what your business needs');
    expect(serviceCards).toEqual([]);
  });

  it('keeps proof placeholders non-clickable and provides hub anchor IDs', () => {
    expect(pages[1].bodyHtml).toContain('class="proof-placeholder"');
    expect(pages[1].bodyHtml).toContain('data-proof-placeholder');
    expect(pages[1].bodyHtml).not.toMatch(/PROOF PLACEHOLDER[^<]*<\/a>/i);
    expect(pages[0].bodyHtml).toContain('id="consultation-copy"');
    expect(pages[0].bodyHtml).toContain('id="discovery"');
    expect(pages[0].bodyHtml).toContain('href="#consultation"');
  });

  it('bundles no internal handoff or active external runtime URL', () => {
    const serialized = JSON.stringify(pages);
    expect(serialized).not.toMatch(/Internal handoff|planning-only approval|license.key|degraded.mode/i);
    expect(serialized).not.toContain('gestaltview-ai-v3.vercel.app');
    expect(serialized).toContain('UNVERIFIED EXTERNAL REFERENCE');
  });
});
