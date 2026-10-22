// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import generatedPages from './generated/draft-pages.json';
import type { HubPresentation, ServiceCard } from './service-card-types';
export type { ServiceCard } from './service-card-types';

export interface PageContent {
  path: string;
  title: string;
  description: string;
  h1: string;
  price: string | null;
  summary: string;
  bodyHtml: string;
  hubPresentation?: HubPresentation;
  faq: { question: string; answer: string }[];
  source: string;
  reviewNotes: string[];
}
export const pages: PageContent[] = generatedPages;
export const services = pages.slice(1);
export const serviceCards: ServiceCard[] = pages[0]!.hubPresentation!.cards;
export function getPage(path: string): PageContent | undefined {
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
  return pages.find((page) => page.path === normalized);
}
