// © 2026 Keith Soyka / GestaltView · local draft-content generator
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked, Renderer, type Tokens } from 'marked';
import type { HubPresentation, ServiceCard } from '../src/service-card-types';

export interface GeneratedPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  price: string | null;
  summary: string;
  bodyHtml: string;
  hubPresentation?: HubPresentation;
  faq: { question: string; answer: string }[];
  source: 'draft-internal';
  reviewNotes: string[];
}

const routes = [
  '/',
  '/website-build/',
  '/ai-opportunity-audit/',
  '/ai-ops-sprint/',
  '/codebase-audit/',
  '/custom-software/',
  '/ai-integration/',
] as const;
const sourceFiles = [
  '00-hub.md',
  '01-website-build.md',
  '02-ai-opportunity-audit.md',
  '03-ai-ops-sprint.md',
  '04-codebase-audit.md',
  '05-custom-software.md',
  '06-ai-integration.md',
] as const;
const reviewNotes: Record<(typeof routes)[number], string[]> = {
  '/': [
    'All offer scopes and the proof inventory still need owner review; the sprint, audit/refresh, and opportunity-audit boundaries are especially incomplete.',
    'Production domain, approved seller/site naming, and the real consultation contact path are not finalized.',
    'Consultation data handling—including privacy, retention, access, and contact practices—and any rate limits need explicit decisions before collection is enabled.',
    'Hosting, terms/privacy content and responsibility, branding, revisions, payment timing, schedules, discovery-credit conditions, and commercial details remain unresolved.',
  ],
  '/website-build/': [
    'Approved proof samples are not supplied; hosting, changes/revisions, schedule, payment split, and terms/privacy content and responsibility remain unsettled.',
    'The timing and conditions for pre-sale design materials need confirmation; the consultation remains fit-only.',
  ],
  '/ai-opportunity-audit/': [
    'The written deliverable, review coverage, required inputs, timeline, and whether discovery is ever needed remain to be defined.',
    'The two evidence examples are placeholders; no completed audit or result is asserted.',
  ],
  '/ai-ops-sprint/': [
    'Only the two-week duration and displayed price are stated; eligible work, deliverables, boundaries, prerequisites, acceptance, costs, and start/end rules need approval.',
    'Discovery applicability and relevant proof examples remain unresolved.',
  ],
  '/codebase-audit/': [
    'Audit output and coverage, whether refresh is optional or included, change limits, inherited-code testing, access, timing, and price need agreement.',
    'The proof examples are placeholders; no specialist security, accessibility, or performance review is promised.',
  ],
  '/custom-software/': [
    'Eligible work, scope boundaries, acceptance criteria, prerequisites, and the criteria for choosing a final price within the displayed range need agreement.',
    'External-service cost treatment, design-material timing, payment details, and proof examples remain unresolved.',
  ],
  '/ai-integration/': [
    'Eligible workflows and connected systems, access/data boundaries, acceptance criteria, prerequisites, and external-service ownership need agreement.',
    'Proof assets and the availability of any relevant external runtime reference remain unverified; applicable external costs must be confirmed in scope.',
  ],
};

const safeRoutes = new Set<string>(routes);
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));
const decodeEntities = (text: string) => text
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x([\da-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)));
const plainText = (html: string) => decodeEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const slugify = (text: string) => plainText(text).toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

function reserveHeadingId(headingIds: Map<string, number>, initialId: string): string {
  const count = headingIds.get(initialId) ?? 0;
  headingIds.set(initialId, count + 1);
  return count ? `${initialId}-${count + 1}` : initialId;
}

function renderPublicMarkdown(markdown: string, pagePath: string, headingIds = new Map<string, number>()): string {
  const proofText = new Map<string, { id: string; text: string }>();
  let proofIndex = 0;
  const prepared = markdown.replace(/\*\*\[(PROOF PLACEHOLDER ([A-Z0-9]+)\s*[—-][^\]]*)\]\*\*|\[(PROOF PLACEHOLDER ([A-Z0-9]+)\s*[—-][^\]]*)\]/g, (whole, boldText: string | undefined, boldId: string | undefined, plainTextMatch: string | undefined, plainId: string | undefined) => {
    const display = boldText ?? plainTextMatch ?? whole.slice(1, -1);
    const id = boldId ?? plainId ?? 'proof';
    const marker = `GVPROOFPLACEHOLDER${proofIndex++}TOKEN`;
    proofText.set(marker, { id, text: display });
    return marker;
  }).replace(/`\/#consultation`/g, '[`/#consultation`](/#consultation)');

  const renderer = new Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.image = ({ text }) => escapeHtml(text);
  renderer.heading = function ({ tokens, depth }: Tokens.Heading) {
      const title = this.parser.parseInline(tokens);
      const label = plainText(title);
      let id = pagePath === '/' && label.toLowerCase() === 'free consultation' ? 'consultation-copy'
        : pagePath === '/' && label.toLowerCase().startsWith('discovery') ? 'discovery'
          : slugify(label);
      id = reserveHeadingId(headingIds, id);
      return `<h${depth} id="${escapeHtml(id)}">${title}</h${depth}>\n`;
  };
  renderer.link = function ({ href, tokens }: Tokens.Link) {
      const label = this.parser.parseInline(tokens);
      if (/^https?:\/\//i.test(href) && /gestaltview-ai-v3\.vercel\.app/i.test(href)) {
        return `<span class="external-reference-placeholder">UNVERIFIED EXTERNAL REFERENCE (GestaltView)</span>`;
      }
      if (href.startsWith('#') && /^#[A-Za-z][A-Za-z0-9_-]*$/.test(href)) {
        return `<a href="${escapeHtml(href)}">${label}</a>`;
      }
      const local = href.match(/^(\/[^?#]*)(#[A-Za-z][A-Za-z0-9_-]*)?$/);
      if (local && safeRoutes.has(local[1]!)) {
        const target = pagePath === '/' && local[1] === '/' && local[2] ? local[2] : `${local[1]}${local[2] ?? ''}`;
        return `<a href="${escapeHtml(target)}">${label}</a>`;
      }
      return label;
  };
  renderer.text = function (token: Tokens.Text | Tokens.Escape) {
      if ('tokens' in token && token.tokens) return this.parser.parseInline(token.tokens);
      let text = escapeHtml(token.text);
      for (const [marker, proof] of proofText) {
        text = text.replaceAll(escapeHtml(marker), `<span class="proof-placeholder" data-proof-placeholder="${escapeHtml(proof.id)}">${escapeHtml(proof.text)}</span>`);
      }
      return text;
  };
  return String(marked.parse(prepared, { renderer, gfm: true, async: false }));
}

function renderPublicInline(markdown: string, pagePath: string): string {
  return renderPublicMarkdown(markdown, pagePath).replace(/^<p>/, '').replace(/<\/p>\n?$/, '');
}

const hubOfferConfig = [
  { id: 'website-build', heading: 'Standard 4-page site', path: '/website-build/' },
  { id: 'ai-opportunity-audit', heading: 'DI opportunity audit', path: '/ai-opportunity-audit/' },
  { id: 'ai-ops-sprint', heading: 'AI Ops Sprint, two weeks', path: '/ai-ops-sprint/' },
  { id: 'codebase-audit', heading: 'Codebase / website audit + refresh', path: '/codebase-audit/' },
  { id: 'custom-software', heading: 'Custom software (small tool, fixed scope)', path: '/custom-software/' },
  { id: 'ai-integration', heading: 'DI integration (SMB, fixed scope)', path: '/ai-integration/' },
] as const;

interface MarkdownToken {
  type: string;
  raw: string;
  depth?: number;
  text?: string;
  href?: string;
  tokens?: unknown[];
  [key: string]: unknown;
}
interface LocatedToken { token: MarkdownToken; start: number }

const isHeading = (token: MarkdownToken): token is MarkdownToken & { depth: number; text: string } =>
  token.type === 'heading' && typeof token.depth === 'number' && typeof token.text === 'string';
const isParagraph = (token: MarkdownToken): token is MarkdownToken & { text: string; tokens: unknown[] } =>
  token.type === 'paragraph' && typeof token.text === 'string' && Array.isArray(token.tokens);

function locateTokens(tokens: MarkdownToken[], markdown: string): LocatedToken[] {
  let cursor = 0;
  return tokens.map((token) => {
    let start = markdown.indexOf(token.raw, cursor);
    if (start < 0) start = cursor;
    cursor = start + token.raw.length;
    return { token, start };
  });
}

function linksIn(tokens: unknown[] = []): Array<{ href: string }> {
  const links: Array<{ href: string }> = [];
  for (const value of tokens) {
    if (!value || typeof value !== 'object') continue;
    const token = value as MarkdownToken;
    if (token.type === 'link' && typeof token.href === 'string') links.push({ href: token.href });
    if (Array.isArray(token.tokens)) links.push(...linksIn(token.tokens));
  }
  return links;
}

function extractHubPresentation(markdown: string, pagePath: string, source: string, sourceName: string): HubPresentation {
  const markdownOffset = source.indexOf(markdown);
  const errorAt = (offer: string, offset: number, reason: string): never => {
    const absoluteOffset = Math.max(0, markdownOffset + offset);
    const line = source.slice(0, absoluteOffset).split('\n').length;
    throw new Error(`${sourceName}: ${offer}: ${reason} at line ${line}`);
  };
  const tokens = locateTokens(marked.lexer(markdown, { gfm: true }) as unknown as MarkdownToken[], markdown);
  const headingText = (token: MarkdownToken & { text: string }) => plainText(renderPublicInline(token.text, pagePath));
  const sectionIndex = tokens.findIndex(({ token }) => isHeading(token) && token.depth === 2 && headingText(token) === 'Find the right starting point');
  if (sectionIndex < 0) errorAt('Find the right starting point', 0, 'missing required H2 section');
  const careIndex = tokens.findIndex(({ token }, index) => index > sectionIndex && isHeading(token) && token.depth === 2 && headingText(token) === 'Care is part of the build—not an upgrade');
  if (careIndex < 0) errorAt('Care is part of the build—not an upgrade', markdown.length, 'missing section boundary H2');

  const sectionTokens = tokens.slice(sectionIndex + 1, careIndex);
  const offerHeadings = sectionTokens.filter((located) => isHeading(located.token) && located.token.depth === 3);
  const seen = new Set<string>();
  const locatedOffers: Array<{ id: string; heading: string; path: string; offset: number; token: MarkdownToken & { depth: number; text: string } }> = [];
  for (const { token, start } of offerHeadings) {
    if (!isHeading(token)) continue;
    const heading = headingText(token);
    const config = hubOfferConfig.find((offer) => offer.heading === heading);
    if (!config) {
      errorAt(heading || 'unknown offer', start, 'unexpected offer heading');
      continue;
    }
    if (seen.has(config.heading)) errorAt(heading, start, 'duplicate offer heading');
    seen.add(config.heading);
    locatedOffers.push({ ...config, heading, offset: start, token });
  }
  for (let index = 0; index < hubOfferConfig.length; index += 1) {
    const expected = hubOfferConfig[index]!;
    const actual = locatedOffers[index];
    if (!actual) errorAt(expected.heading, tokens[careIndex]!.start, 'missing required offer block');
    if (actual.heading !== expected.heading) errorAt(expected.heading, actual.offset, `expected offer before “${actual.heading}”`);
  }
  if (locatedOffers.length !== hubOfferConfig.length) {
    const extra = locatedOffers[hubOfferConfig.length]!;
    errorAt(extra.heading, extra.offset, 'unexpected extra offer block');
  }

  const stray = sectionTokens.find(({ token, start }) => start < locatedOffers[0]!.offset && token.type !== 'space');
  if (stray) errorAt('Find the right starting point', stray.start, 'unexpected content before the first offer');

  const headingIds = new Map<string, number>();
  const beforeHtml = renderPublicMarkdown(markdown.slice(0, locatedOffers[0]!.offset), pagePath, headingIds);
  const cards: ServiceCard[] = locatedOffers.map((offer, index) => {
    const blockEnd = locatedOffers[index + 1]?.offset ?? tokens[careIndex]!.start;
    const content = sectionTokens.filter(({ start }) => start > offer.offset && start < blockEnd)
      .filter(({ token }) => token.type !== 'space');
    const paragraphs = content.filter((located): located is LocatedToken & { token: MarkdownToken & { text: string; tokens: unknown[] } } => isParagraph(located.token));
    if (paragraphs.length !== 5 || content.length !== 5) {
      errorAt(offer.heading, offer.offset, `expected price, outcome, Included, Not included, and scope paragraphs in order; found ${content.length} block elements`);
    }
    const inline = paragraphs.map(({ token }) => renderPublicInline(token.text, pagePath));
    const plain = inline.map(plainText);
    const price = plain[0]!;
    if (!/^\$\d+(?:,\d{3})*(?:[–—-]\$\d+(?:,\d{3})*)?$/.test(price) && price !== 'scoped') {
      errorAt(offer.heading, paragraphs[0]!.start, `malformed price “${price}”`);
    }
    if (inline[0] !== `<strong>${escapeHtml(price)}</strong>`) errorAt(offer.heading, paragraphs[0]!.start, 'price must be one bold display-price value');
    if (!plain[1]) errorAt(offer.heading, paragraphs[1]!.start, 'missing outcome paragraph');
    if (/^(?:Included|Not included):/.test(plain[1]!)) errorAt(offer.heading, paragraphs[1]!.start, 'repeated field label in outcome paragraph');
    if (!plain[2]?.startsWith('Included: ') || !inline[2]?.startsWith('<strong>Included:</strong> ')) {
      errorAt(offer.heading, paragraphs[2]!.start, 'missing or malformed exact Included: label');
    }
    if (!plain[3]?.startsWith('Not included: ') || !inline[3]?.startsWith('<strong>Not included:</strong> ')) {
      errorAt(offer.heading, paragraphs[3]!.start, 'missing or malformed exact Not included: label');
    }
    const scopeToken = paragraphs[4]!.token;
    const scopeLinks = linksIn(scopeToken.tokens);
    if (scopeLinks.length !== 1 || scopeLinks[0]!.href !== offer.path) {
      errorAt(offer.heading, paragraphs[4]!.start, `expected exactly one scope link to ${offer.path}`);
    }
    const scopeAnchorHtml = inline[4]!;
    const scopeAnchor = /^<a\b[^>]*>([\s\S]*)<\/a>$/.exec(scopeAnchorHtml);
    if (!scopeAnchor) {
      errorAt(offer.heading, paragraphs[4]!.start, 'scope paragraph must contain only its scope link');
    }
    const scopeLinkLabelHtml = scopeAnchor![1]!;
    const headingHtml = renderPublicInline(offer.token.text, pagePath);
    const name = plainText(headingHtml);
    const headingId = reserveHeadingId(headingIds, slugify(name));
    return {
      id: offer.id,
      path: offer.path,
      headingId,
      name,
      nameHtml: headingHtml,
      price,
      outcome: plain[1]!,
      outcomeHtml: inline[1]!,
      included: plain[2]!,
      includedHtml: inline[2]!,
      excluded: plain[3]!,
      excludedHtml: inline[3]!,
      scopeLinkLabel: plainText(scopeLinkLabelHtml),
      scopeLinkLabelHtml,
    };
  });
  const afterHtml = renderPublicMarkdown(markdown.slice(tokens[careIndex]!.start), pagePath, headingIds);
  return { beforeHtml, cards, afterHtml };
}

export function parseDraft(source: string, pagePath: string, sourceName = pagePath): GeneratedPage {
  if (!safeRoutes.has(pagePath) && !/^\/[a-z0-9-]+\/$/.test(pagePath)) throw new Error(`Unsupported route: ${pagePath}`);
  const metadataStart = source.indexOf('## Metadata draft');
  const publicStartMatch = /^## Public copy\s*$/m.exec(source);
  const handoffStartMatch = /^## Internal handoff\b[^\n]*$/m.exec(source);
  if (!publicStartMatch) throw new Error('Missing required Public copy section');
  if (!handoffStartMatch || handoffStartMatch.index <= publicStartMatch.index) throw new Error('Missing required Internal handoff section after Public copy');

  const metadataSource = metadataStart >= 0 && metadataStart < publicStartMatch.index
    ? source.slice(metadataStart, publicStartMatch.index) : '';
  const title = /^Title:\s*(.+)$/m.exec(metadataSource)?.[1]?.trim();
  const description = /^Meta description:\s*(.+)$/m.exec(metadataSource)?.[1]?.trim();
  if (!title || !description) throw new Error(`Missing title or meta description for ${pagePath}`);

  const publicSource = source.slice(publicStartMatch.index + publicStartMatch[0].length, handoffStartMatch.index).trim();
  const h1Match = /^#\s+(.+)$/m.exec(publicSource);
  if (!h1Match) throw new Error(`Missing public H1 for ${pagePath}`);
  const h1 = h1Match[1]!.trim();
  const markdown = publicSource.replace(h1Match[0], '').trim();
  const price = pagePath === '/' ? null : /^\*\*([^*]+)\*\*\s*$/m.exec(publicSource)?.[1]?.trim() ?? null;
  const paragraphs = markdown.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const summarySource = paragraphs.find((paragraph) => !/^#{1,6}\s/.test(paragraph)
    && !/^\*\*(?:\$?\d|scoped\b|Primary action:|Action label:)/i.test(paragraph)
    && !/^[-*]\s/.test(paragraph));
  const summary = summarySource ? plainText(String(marked.parseInline(summarySource, { gfm: true }))) : '';
  const bodyHtml = renderPublicMarkdown(markdown, pagePath);
  const hubPresentation = pagePath === '/' ? extractHubPresentation(markdown, pagePath, source, sourceName) : undefined;
  return {
    path: pagePath,
    title,
    description,
    h1,
    price,
    summary,
    bodyHtml,
    ...(hubPresentation ? { hubPresentation } : {}),
    faq: [],
    source: 'draft-internal',
    reviewNotes: reviewNotes[pagePath as (typeof routes)[number]] ?? ['Offer boundaries and supporting evidence require owner review.'],
  };
}

export async function generateDraftContent(rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const draftDir = path.join(rootDir, 'docs', 'lanes', 'content');
  const pages = await Promise.all(sourceFiles.map(async (file, index) =>
    parseDraft(await readFile(path.join(draftDir, file), 'utf8'), routes[index]!, file)));
  const output = path.join(rootDir, 'src', 'generated', 'draft-pages.json');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(pages, null, 2)}\n`, 'utf8');
  return pages;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateDraftContent().then((pages) => console.log(`Generated ${pages.length} sanitized draft pages.`));
}
