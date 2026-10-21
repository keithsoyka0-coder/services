// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it } from 'vitest';
import { metadataHtml, safeOrigin } from '../src/metadata';

const page = {
  path: '/sample-range/',
  title: 'Synthetic Example Service',
  description: 'Synthetic description for metadata tests.',
  h1: 'Synthetic service example',
  price: '$1,000–$2,000',
  summary: 'Synthetic summary for isolated tests.',
  bodyHtml: '<p>Synthetic fixture content.</p><h2>Questions</h2><p>How is scope agreed?</p><p>Scope is agreed before work begins.</p>',
  faq: [{ question: 'How is scope agreed?', answer: 'Scope is agreed before work begins.' }],
  source: 'fixture',
};

describe('safeOrigin', () => {
  it('accepts only a bare HTTPS origin and normalizes its trailing slash', () => {
    expect(safeOrigin('https://services.example.test/')).toBe('https://services.example.test');
    expect(safeOrigin('http://services.example.test')).toBeUndefined();
    expect(safeOrigin('https://user:pass@services.example.test')).toBeUndefined();
    expect(safeOrigin('https://services.example.test/path')).toBeUndefined();
    expect(safeOrigin('https://services.example.test/?q=1')).toBeUndefined();
    expect(safeOrigin('https://services.example.test/#fragment')).toBeUndefined();
    expect(safeOrigin('https://services.example.test/?')).toBeUndefined();
    expect(safeOrigin('https://services.example.test/#')).toBeUndefined();
    expect(safeOrigin(undefined)).toBeUndefined();
  });
});

describe('metadataHtml', () => {
  it('keeps only title, description, and noindex metadata despite release-like options', () => {
    const html = metadataHtml(page, { origin: 'https://services.example.test', production: true, contentApproved: true });
    expect(html).toContain('<title>Synthetic Example Service</title>');
    expect(html).toContain('name="description" content="Synthetic description for metadata tests."');
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).not.toMatch(/canonical|og:|application\/ld\+json|schema\.org|services\.example\.test/i);
  });

  it('locks every page source and every caller flag to noindex metadata only', () => {
    const html = metadataHtml({ ...page, source: 'draft-internal' }, {
      origin: 'https://services.example.test', production: true, contentApproved: true,
      pages: [{ path: '/another/', title: 'Another page' }],
    });
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).not.toMatch(/canonical|og:|application\/ld\+json|schema\.org|https?:\/\//i);
  });

  it('escapes HTML metadata text without adding other metadata', () => {
    const html = metadataHtml({ ...page, title: 'A < B & C' }, { production: false });
    expect(html).toContain('A &lt; B &amp; C');
    expect(html).not.toContain('<title>A < B');
    expect(html).not.toMatch(/canonical|og:|application\/ld\+json/i);
  });
});
