// © 2026 Keith Soyka / GestaltView · local draft-content generator
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked, Renderer, type Tokens } from 'marked';

export interface GeneratedPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  price: string | null;
  summary: string;
  bodyHtml: string;
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

function renderPublicMarkdown(markdown: string, pagePath: string): string {
  const proofText = new Map<string, { id: string; text: string }>();
  let proofIndex = 0;
  const prepared = markdown.replace(/\*\*\[(PROOF PLACEHOLDER ([A-Z0-9]+)\s*[—-][^\]]*)\]\*\*|\[(PROOF PLACEHOLDER ([A-Z0-9]+)\s*[—-][^\]]*)\]/g, (whole, boldText: string | undefined, boldId: string | undefined, plainTextMatch: string | undefined, plainId: string | undefined) => {
    const display = boldText ?? plainTextMatch ?? whole.slice(1, -1);
    const id = boldId ?? plainId ?? 'proof';
    const marker = `GVPROOFPLACEHOLDER${proofIndex++}TOKEN`;
    proofText.set(marker, { id, text: display });
    return marker;
  }).replace(/`\/#consultation`/g, '[`/#consultation`](/#consultation)');

  const headingIds = new Map<string, number>();
  const renderer = new Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.image = ({ text }) => escapeHtml(text);
  renderer.heading = function ({ tokens, depth }: Tokens.Heading) {
      const title = this.parser.parseInline(tokens);
      const label = plainText(title);
      let id = pagePath === '/' && label.toLowerCase() === 'free consultation' ? 'consultation-copy'
        : pagePath === '/' && label.toLowerCase().startsWith('discovery') ? 'discovery'
          : slugify(label);
      const count = headingIds.get(id) ?? 0;
      headingIds.set(id, count + 1);
      if (count) id = `${id}-${count + 1}`;
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

export function parseDraft(source: string, pagePath: string): GeneratedPage {
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
  return {
    path: pagePath,
    title,
    description,
    h1,
    price,
    summary,
    bodyHtml,
    faq: [],
    source: 'draft-internal',
    reviewNotes: reviewNotes[pagePath as (typeof routes)[number]] ?? ['Offer boundaries and supporting evidence require owner review.'],
  };
}

export async function generateDraftContent(rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const draftDir = path.join(rootDir, 'docs', 'lanes', 'content');
  const pages = await Promise.all(sourceFiles.map(async (file, index) =>
    parseDraft(await readFile(path.join(draftDir, file), 'utf8'), routes[index]!)));
  const output = path.join(rootDir, 'src', 'generated', 'draft-pages.json');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(pages, null, 2)}\n`, 'utf8');
  return pages;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateDraftContent().then((pages) => console.log(`Generated ${pages.length} sanitized draft pages.`));
}
