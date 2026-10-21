import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PageMetadata } from '../src/metadata';

// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder

const routes = [
  '/',
  '/website-build/',
  '/ai-opportunity-audit/',
  '/ai-ops-sprint/',
  '/codebase-audit/',
  '/custom-software/',
  '/ai-integration/',
] as const;
const DRAFT_MARKER = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';

type ServerModule = {
  renderPage: (route: string) => string | Promise<string>;
  pages: PageMetadata[];
  metadataHtml: (page: PageMetadata, options: { production: boolean }) => string;
};

const root = process.cwd();
const dist = path.join(root, 'dist');
const serverBundle = path.join(root, 'dist-server', 'entry-server.js');
const templatePath = path.join(dist, 'index.html');

await access(serverBundle).catch(() => {
  throw new Error(`Missing React SSR bundle at ${serverBundle}; build dist-server/entry-server.js first.`);
});
const server = await import(pathToFileURL(serverBundle).href) as ServerModule;
if (typeof server.renderPage !== 'function' || typeof server.metadataHtml !== 'function' || !Array.isArray(server.pages)) {
  throw new Error('dist-server/entry-server.js must export renderPage(path), pages, and metadataHtml(page, options).');
}
const pages = server.pages;
const actualRoutes = pages.map((page) => page.path);
if (pages.length !== routes.length || routes.some((route) => !actualRoutes.includes(route)) || actualRoutes.some((route) => !routes.includes(route as typeof routes[number]))) {
  throw new Error(`SSR pages must contain exactly the seven draft routes: ${routes.join(', ')}`);
}
if (new Set(actualRoutes).size !== actualRoutes.length) throw new Error('SSR page routes must be unique.');
for (const page of pages) {
  if (page.source !== 'draft-internal') throw new Error(`${page.path}: source must be draft-internal.`);
  if (!Array.isArray(page.reviewNotes) || page.reviewNotes.some((note) => typeof note !== 'string')) {
    throw new Error(`${page.path}: reviewNotes must be a string array.`);
  }
  if (page.path !== '/' && !/^\/[a-z0-9-]+\/$/.test(page.path)) throw new Error(`Invalid page route: ${page.path}`);
}

const template = await readFile(templatePath, 'utf8');
if (!template.includes('<!--page-head-->') || !template.includes('<!--app-html-->')) {
  throw new Error('dist/index.html template must include <!--page-head--> and <!--app-html--> placeholders.');
}

async function writeRoute(route: string, html: string): Promise<void> {
  const outputPath = route === '/'
    ? path.join(dist, 'index.html')
    : path.join(dist, route.replace(/^\/+|\/+$/g, ''), 'index.html');
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
}

for (const page of pages) {
  const appHtml = await server.renderPage(page.path);
  if (!appHtml.trim()) throw new Error(`SSR returned empty HTML for ${page.path}`);
  if (!appHtml.includes(DRAFT_MARKER)) throw new Error(`${page.path}: visible draft-only banner is required.`);
  const headHtml = server.metadataHtml(page, { production: false });
  const document = template.replace('<!--page-head-->', headHtml).replace('<!--app-html-->', appHtml);
  await writeRoute(page.path, document);
}

const notFound: PageMetadata = {
  path: '/404/', title: 'Page not found', description: 'The requested page could not be found.', h1: 'Page not found',
  source: 'draft-internal', reviewNotes: [],
};
const notFoundHtml = await server.renderPage('/404/');
if (!notFoundHtml.trim()) throw new Error('SSR returned empty HTML for /404/.');
if (!notFoundHtml.includes(DRAFT_MARKER)) throw new Error('/404/: visible draft-only banner is required.');
const notFoundDocument = template.replace('<!--page-head-->', server.metadataHtml(notFound, { production: false })).replace('<!--app-html-->', notFoundHtml);
await writeFile(path.join(dist, '404.html'), notFoundDocument, 'utf8');

await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
await rm(path.join(dist, 'sitemap.xml'), { force: true });
console.log(`Prerendered ${pages.length} internal-review routes and a noindex 404 page; public release output is disabled.`);
