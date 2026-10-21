// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
export interface PageMetadata {
  path: string;
  title: string;
  description?: string;
  h1?: string;
  price?: string | null;
  summary?: string;
  bodyHtml?: string;
  faq?: Array<{ question: string; answer: string }>;
  source?: string;
  reviewNotes?: string[];
}

export interface MetadataPageReference {
  path: string;
  title: string;
}

export interface MetadataOptions {
  origin?: string;
  production: boolean;
  /** Retained as an inert compatibility option during the local preview phase. */
  contentApproved?: boolean;
  pages?: MetadataPageReference[];
}

const esc = (value: unknown): string => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

/** Return a normalized HTTPS origin, rejecting anything other than a bare origin. */
export function safeOrigin(value?: string): string | undefined {
  if (!value || value !== value.trim()) return undefined;
  if (value.includes('?') || value.includes('#')) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') return undefined;
    if (!parsed.hostname || parsed.username || parsed.password) return undefined;
    if (parsed.search || parsed.hash || (parsed.pathname !== '' && parsed.pathname !== '/')) return undefined;
    return parsed.origin;
  } catch {
    return undefined;
  }
}

/** Public release metadata is disabled in this local-only preview phase. */
export function metadataHtml(page: PageMetadata, options: MetadataOptions): string {
  // Deliberately do not consult origin, release, approval, route catalog, or page source.
  void options;
  const head = [
    `<title>${esc(page.title)}</title>`,
    page.description ? `<meta name="description" content="${esc(page.description)}">` : '',
    '<meta name="robots" content="noindex, nofollow">',
  ].filter(Boolean);
  return head.join('\n');
}
