// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
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

const hubSource = readFileSync('docs/lanes/content/00-hub.md', 'utf8');
const offerHeadings = [
  'Standard 4-page site',
  'DI opportunity audit',
  'AI Ops Sprint, two weeks',
  'Codebase / website audit + refresh',
  'Custom software (small tool, fixed scope)',
  'DI integration (SMB, fixed scope)',
];

function hubPage(source = hubSource, label = 'hub fixture') {
  return parseDraft(source, '/', label);
}

function replaceOffer(source: string, heading: string, replacement: (block: string) => string) {
  const start = source.indexOf(`### ${heading}`);
  if (start < 0) throw new Error(`Fixture offer not found: ${heading}`);
  const nextHeading = source.indexOf('\n### ', start + 1);
  const care = source.indexOf('\n## Care is part of the build—not an upgrade.', start + 1);
  const end = nextHeading < 0 ? care : care < 0 ? nextHeading : Math.min(nextHeading, care);
  if (end < 0) throw new Error(`Fixture boundary not found after: ${heading}`);
  const block = source.slice(start, end);
  return `${source.slice(0, start)}${replacement(block)}${source.slice(end)}`;
}

function semanticTree(html: string) {
  type ElementNode = { tag: string; attributes: string[][]; children: Array<ElementNode | string> };
  const root: Array<ElementNode | string> = [];
  const stack: Array<Array<ElementNode | string>> = [root];
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const match of html.matchAll(/<\/?[A-Za-z][^>]*>|[^<]+/g)) {
    const token = match[0];
    if (token.startsWith('</')) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (token.startsWith('<')) {
      const tag = /^<([A-Za-z][\w:-]*)/.exec(token)?.[1]?.toLowerCase();
      if (!tag) continue;
      const attrSource = token.slice(tag.length + 1, token.length - 1);
      const attributes = Array.from(attrSource.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
        .map(([, name, doubleQuoted, singleQuoted, bare]) => [name!.toLowerCase(), doubleQuoted ?? singleQuoted ?? bare ?? ''])
        .sort(([left], [right]) => left!.localeCompare(right!));
      const node: ElementNode = { tag, attributes, children: [] };
      stack[stack.length - 1]!.push(node);
      if (!voidElements.has(tag) && !token.endsWith('/>')) stack.push(node.children);
      continue;
    }
    if (token.trim()) stack[stack.length - 1]!.push(token);
  }
  return root;
}

describe('hub service-card extraction contracts', () => {
  it('extracts six ordered complete cards from the bounded public section and segments surrounding copy', () => {
    const page = hubPage();
    const presentation = page.hubPresentation!;
    expect(presentation.cards).toHaveLength(6);
    expect(presentation.cards.map(({ name }) => name)).toEqual(offerHeadings);
    expect(presentation.cards.map(({ headingId }) => headingId)).toEqual([
      'standard-4-page-site', 'di-opportunity-audit', 'ai-ops-sprint-two-weeks',
      'codebase-website-audit-refresh', 'custom-software-small-tool-fixed-scope', 'di-integration-smb-fixed-scope',
    ]);
    expect(presentation.cards.map(({ path, price }) => [path, price])).toEqual([
      ['/website-build/', '$2,900'], ['/ai-opportunity-audit/', '$950'], ['/ai-ops-sprint/', '$2,500'],
      ['/codebase-audit/', 'scoped'], ['/custom-software/', '$8,500–$10,000'], ['/ai-integration/', '$9,500'],
    ]);
    expect(presentation.beforeHtml).toContain('Start with what your business needs');
    expect(presentation.beforeHtml).toContain('Primary action: Request a free consultation');
    expect(presentation.beforeHtml).toContain('<h2 id="find-the-right-starting-point">Find the right starting point</h2>');
    expect(presentation.afterHtml).toContain('<h2 id="care-is-part-of-the-build-not-an-upgrade">');
    expect(presentation.afterHtml).toContain('The fit comes first');
    expect(presentation.afterHtml).toContain('Consultation first. A plan when you need one.');
    expect(presentation.afterHtml).toContain('Free consultation');
    expect(presentation.afterHtml).toContain('Discovery (scoped, paid)');
    expect(JSON.stringify(presentation)).not.toContain('Internal handoff');
  });

  it('preserves source copy, inline emphasis, scope labels and exact safe fragments', () => {
    const page = hubPage(replaceOffer(hubSource, offerHeadings[0]!, (block) => block
      .replace('A from-scratch site', 'A **source-first** site')
      .replace('See the website-build scope', 'See the **website-build** scope')));
    const card = page.hubPresentation!.cards[0]!;
    expect(card.outcome).toBe('A source-first site that explains what you offer and gives people a way to contact you.');
    expect(card.outcomeHtml).toBe('A <strong>source-first</strong> site that explains what you offer and gives people a way to contact you.');
    expect(card.scopeLinkLabel).toBe('See the website-build scope');
    expect(card.scopeLinkLabelHtml).toBe('See the <strong>website-build</strong> scope');
    expect(card.included).toMatch(/^Included: /);
    expect(card.includedHtml).toMatch(/^<strong>Included:<\/strong> /);
    expect(card.excluded).toMatch(/^Not included: /);
    expect(card.excludedHtml).toMatch(/^<strong>Not included:<\/strong> /);
  });

  it('uses modified source outcome and scope label instead of a second copy store', () => {
    const changed = replaceOffer(hubSource, offerHeadings[1]!, (block) => block
      .replace('Find out where Digital Intelligence (DI) could benefit your current business—and where it does not fit.', 'Changed outcome from fixture.')
      .replace('See the opportunity-audit scope', 'Changed scope label'));
    const card = hubPage(changed).hubPresentation!.cards[1]!;
    expect(card.outcome).toBe('Changed outcome from fixture.');
    expect(card.scopeLinkLabel).toBe('Changed scope label');
    expect(card.outcome).not.toBe(hubPage().hubPresentation!.cards[1]!.outcome);
  });

  it('rejects missing, extra, duplicate, and unknown offer blocks with source and location', () => {
    const missing = hubSource.replace(/### DI opportunity audit[\s\S]*?(?=\n### AI Ops Sprint, two weeks)/, '');
    const extra = hubSource.replace('\n## Care is part of the build—not an upgrade', '\n### Unapproved additional offer\n\n**$1**\n\nOutcome.\n\n**Included:** item.\n\n**Not included:** item.\n\n[See scope](/website-build/)\n\n## Care is part of the build—not an upgrade');
    const duplicate = hubSource.replace('\n## Care is part of the build—not an upgrade', `\n${hubSource.slice(hubSource.indexOf('### Standard 4-page site'), hubSource.indexOf('### DI opportunity audit'))}\n## Care is part of the build—not an upgrade`);
    for (const [fixture, expectedOffer] of [[missing, 'DI opportunity audit'], [extra, 'Unapproved additional offer'], [duplicate, 'Standard 4-page site']] as const) {
      expect(() => hubPage(fixture, 'malformed hub')).toThrow(new RegExp(`malformed hub.*${expectedOffer}.*(?:line|offset)`, 'i'));
    }
  });

  it('rejects missing or repeated fields and scope links with a useful offer location', () => {
    const cases: Array<[string, string]> = [
      [replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('A from-scratch site that explains what you offer and gives people a way to contact you.\n\n', '')), 'outcome'],
      [replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('**Included:**', '**Included:** duplicate\n\n**Included:**')), 'Included'],
      [replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('[See the website-build scope](/website-build/)', '[See the website-build scope](/website-build/)\n\n[See another scope](/website-build/)')), 'scope'],
      [replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('**Not included:**', 'Unexpected prose before the Not included field.\n\n**Not included:**')), 'structure'],
    ];
    for (const [fixture, field] of cases) {
      expect(() => hubPage(fixture, 'field fixture')).toThrow(new RegExp(`field fixture.*Standard 4-page site.*(?:${field}|line|offset)`, 'i'));
    }
  });

  it('rejects malformed prices, labels, and missing or unsafe/mismatched scope destinations', () => {
    const cases = [
      replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('**$2,900**', '**$2,900/month**')),
      replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('**Included:**', '**Includes:**')),
      replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('[See the website-build scope](/website-build/)', 'See the website-build scope')),
      replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('/website-build/', 'javascript:alert(1)')),
      replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('/website-build/', '/ai-integration/')),
      replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('/website-build/', '/website-build/#private')),
    ];
    for (const fixture of cases) {
      expect(() => hubPage(fixture, 'price/link fixture')).toThrow(/price\/link fixture.*Standard 4-page site.*(?:line|offset)/i);
    }
  });

  it('keeps card-fragment HTML safe and applies existing route, hash and external-placeholder rules', () => {
    const htmlFixture = replaceOffer(hubSource, offerHeadings[0]!, (block) => block
      .replace('A from-scratch site', 'A <img src=x onerror=alert(1)> site')
      .replace('DI integration.', '[DI integration](/not-allowed/)'));
    const card = hubPage(htmlFixture).hubPresentation!.cards[0]!;
    expect(card.outcomeHtml).not.toContain('<img');
    expect(card.outcomeHtml).toContain('&lt;img');
    expect(card.excludedHtml).not.toContain('href="/not-allowed/"');
    const linkFixture = replaceOffer(hubSource, offerHeadings[0]!, (block) => block.replace('[See the website-build scope](/website-build/)', '[See the website-build scope](https://gestaltview-ai-v3.vercel.app/)'));
    expect(() => hubPage(linkFixture, 'external card fixture')).toThrow(/external card fixture.*Standard 4-page site.*(?:line|offset)/i);
    const bodyWithExternalReference = hubSource.replace('Start with what your business needs', '[Start with what your business needs](https://gestaltview-ai-v3.vercel.app/)');
    expect(hubPage(bodyWithExternalReference).bodyHtml).toContain('UNVERIFIED EXTERNAL REFERENCE');
    expect(hubPage().bodyHtml).toContain('href="#consultation"');
  });

  it('keeps the full body and segmented representation semantically equivalent', () => {
    const page = hubPage();
    const { beforeHtml, cards, afterHtml } = page.hubPresentation!;
    const cardHtml = cards.map((card) => `<h3 id="${card.headingId}">${card.nameHtml}</h3><p><strong>${card.price}</strong></p><p>${card.outcomeHtml}</p><p>${card.includedHtml}</p><p>${card.excludedHtml}</p><p><a href="${card.path}">${card.scopeLinkLabelHtml}</a></p>`).join('\n');
    expect(semanticTree(`${beforeHtml}${cardHtml}${afterHtml}`)).toEqual(semanticTree(page.bodyHtml));
  });

  it('rejects stray section content and repeated field labels rather than losing copy', () => {
    const fixtures = [
      hubSource.replace('### Standard 4-page site', 'Unexpected section prose.\n\n### Standard 4-page site'),
      hubSource.replace('### Standard 4-page site', '## Unexpected boundary\n\n### Standard 4-page site'),
      hubSource.replace('A from-scratch site that explains what you offer and gives people a way to contact you.', '**Included:** duplicate outcome field.'),
    ];
    for (const fixture of fixtures) expect(() => hubPage(fixture, 'structure fixture')).toThrow(/structure fixture.*(?:line|offset)/i);
  });
});
