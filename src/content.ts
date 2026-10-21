// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import generatedPages from './generated/draft-pages.json';

export interface PageContent {
  path: string;
  title: string;
  description: string;
  h1: string;
  price: string | null;
  summary: string;
  bodyHtml: string;
  faq: { question: string; answer: string }[];
  source: string;
  reviewNotes: string[];
}
export interface ServiceCard {
  path: string;
  name: string;
  price: string;
  outcome: string;
  included: string;
  excluded: string;
}
export const pages: PageContent[] = generatedPages;
export const services = pages.slice(1);
export const serviceCards: ServiceCard[] = [];
export function getPage(path: string): PageContent | undefined {
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
  return pages.find((page) => page.path === normalized);
}
