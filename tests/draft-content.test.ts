// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it } from 'vitest';
import { parseDraft } from '../scripts/generate-draft-content';

const sample = `# Internal wrapper title

Route: /sample/

## Metadata draft — internal until approved

Title: Sample title
Meta description: Sample description

## Public copy

# Public heading

**$10**

A **public** paragraph with exactly $10.

## Useful section

Keep [safe](/website-build/) and [local](#discovery).

[script](javascript:alert(1))

<img src=x onerror=alert(1)>
<script>alert('internal')</script>

- **[PROOF PLACEHOLDER X1 — real portfolio item; URL required]** Display this proof note.

## Internal handoff — do not render

Never bundle THIS_PRIVATE_HANDOFF or [approval file](../../approvals/file.md).
`;

describe('Quill markdown draft extraction', () => {
  it('extracts only public copy, source metadata, and safe local links', () => {
    const page = parseDraft(sample, '/sample/');
    expect(page.path).toBe('/sample/');
    expect(page.title).toBe('Sample title');
    expect(page.description).toBe('Sample description');
    expect(page.h1).toBe('Public heading');
    expect(page.price).toBe('$10');
    expect(page.summary).toContain('public');
    expect(page.bodyHtml).toContain('href="/website-build/"');
    expect(page.bodyHtml).toContain('href="#discovery"');
    expect(page.bodyHtml).toContain('proof-placeholder');
    expect(page.bodyHtml).not.toContain('<img');
    expect(page.bodyHtml).not.toContain('<script');
    expect(page.bodyHtml).toContain('&lt;img');
    expect(page.bodyHtml).not.toContain('href="javascript:');
    expect(page.bodyHtml).not.toContain('THIS_PRIVATE_HANDOFF');
    expect(page.bodyHtml).not.toContain('approval file');
    expect(page.bodyHtml).not.toContain('Public heading</h1>');
  });

  it('renders external GestaltView runtime mention as an unverified non-link reference', () => {
    const source = `## Metadata draft\n\nTitle: Example title\nMeta description: Example description\n\n## Public copy\n\n# Heading\n\n[Explore GestaltView, my own platform](https://gestaltview-ai-v3.vercel.app).\n\n## Internal handoff\n\nsecret`;
    const page = parseDraft(source, '/ai-integration/');
    expect(page.bodyHtml).toContain('UNVERIFIED EXTERNAL REFERENCE');
    expect(page.bodyHtml).not.toContain('https://gestaltview-ai-v3.vercel.app');
    expect(page.bodyHtml).not.toContain('<a ');
  });

  it('rejects a source without an explicit public-copy section', () => {
    expect(() => parseDraft('# wrapper\n\nprivate', '/broken/')).toThrow(/Public copy/);
  });
});
