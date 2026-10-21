import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isApprovedExternalLink } from './build-link-policy';
import type { PageMetadata } from '../src/metadata';

// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
const root = process.cwd();
const dist = path.join(root, 'dist');
const serverBundle = path.join(root, 'dist-server', 'entry-server.js');
const DRAFT_MARKER = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';
const expectedRoutes = [
  '/', '/website-build/', '/ai-opportunity-audit/', '/ai-ops-sprint/',
  '/codebase-audit/', '/custom-software/', '/ai-integration/',
];
const failures: string[] = [];
const bundle = await import(pathToFileURL(serverBundle).href) as { pages: PageMetadata[] };
if (!Array.isArray(bundle.pages)) throw new Error('SSR bundle must export pages for verification.');
const pages = bundle.pages;
const routes = pages.map((page) => page.path);
if (routes.length !== expectedRoutes.length || expectedRoutes.some((route) => !routes.includes(route)) || new Set(routes).size !== routes.length) {
  failures.push(`SSR page list must contain exactly these seven routes, once each: ${expectedRoutes.join(', ')}`);
}
for (const page of pages) {
  if (page.source !== 'draft-internal') failures.push(`${page.path}: source must be draft-internal.`);
  if (!Array.isArray(page.reviewNotes) || page.reviewNotes.some((note) => typeof note !== 'string')) failures.push(`${page.path}: reviewNotes must be a string array.`);
}

function outputPath(route: string): string {
  return route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html');
}
function decode(value: string): string {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&#x27;', "'").replaceAll('&#x2F;', '/');
}
function visibleText(html: string): string {
  return decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}
function innerText(html: string, tag: string): string | undefined {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? visibleText(match[1]) : undefined;
}
function hasId(html: string, id: string): boolean {
  return [...html.matchAll(/\b(?:id|name)\s*=\s*(["'])(.*?)\1/gi)].some((match) => decode(match[2]) === id);
}
function routeForPath(urlPath: string): string | undefined {
  if (urlPath === '/') return '/';
  const candidate = urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
  return routes.includes(candidate) ? candidate : undefined;
}
async function fileExists(file: string): Promise<boolean> {
  try { await stat(file); return true; } catch { return false; }
}
const htmlByRoute = new Map<string, string>();
for (const page of pages) {
  const file = outputPath(page.path);
  let html: string;
  try { html = await readFile(file, 'utf8'); }
  catch { failures.push(`Missing prerendered HTML for ${page.path}: ${file}`); continue; }
  htmlByRoute.set(page.path, html);
  if (innerText(html, 'title') !== page.title) failures.push(`${page.path}: title does not match page metadata.`);
  if (!page.h1 || innerText(html, 'h1') !== page.h1) failures.push(`${page.path}: first H1 is missing or does not match page metadata.`);
  const text = visibleText(html);
  if (!text.includes(DRAFT_MARKER)) failures.push(`${page.path}: visible exact draft-only banner is required.`);
  if (!/<meta\s+name=["']robots["']\s+content=["']noindex, nofollow["']/i.test(html)) failures.push(`${page.path}: must be noindex, nofollow.`);
  if (/(?:rel=["']canonical["']|property=["']og:|application\/ld\+json|schema\.org)/i.test(html)) {
    failures.push(`${page.path}: canonical, Open Graph, and structured metadata are prohibited in local preview.`);
  }
  if (/\b(?:internal handoff|license(?:[- ]key)?|degraded(?: mechanics)?|\bTODO\b)\b/i.test(html)) {
    failures.push(`${page.path}: internal handoff, license, degraded mechanics, or TODO material is prohibited.`);
  }
  if (page.path !== '/') {
    if (!text.includes('Scope approval pending')) failures.push(`${page.path}: visible Scope approval pending status is required.`);
    if (!text.includes('Proof approval pending')) failures.push(`${page.path}: visible Proof approval pending status is required.`);
    const mountTags = [...html.matchAll(/<([a-z][\w:-]*)\b[^>]*\bdata-widget-mount(?:\s*=\s*(["'])(.*?)\2)?[^>]*>/gi)];
    if (mountTags.length !== 1) failures.push(`${page.path}: expected exactly one data-widget-mount; found ${mountTags.length}.`);
    else {
      const state = page.path === '/ai-integration/' ? 'active-in-draft' : 'disabled';
      if (!new RegExp(`\\bdata-widget-state\\s*=\\s*(["'])${state}\\1`, 'i').test(mountTags[0][0])) {
        failures.push(`${page.path}: data-widget-mount must be ${state}.`);
      }
    }
  } else if (/\bdata-widget-mount\b/i.test(html)) {
    failures.push('Hub must not contain a widget mount.');
  }
  if (page.path === '/ai-integration/') {
    const disclosureTerms = [
      /Groq/, /canonical profile/i, /private[- ]interior/i, /memories/i,
      /founder notes/i, /relationships/i, /wound[- ]layer material/i,
      /values/i, /preferences/i, /skills/i, /sensitive information/i,
      /not retained by default/i, /reliability/i, /suspected[- ]abuse/i,
      /30 days/i, /legal/i, /pseudonymous/i, /keyed digests/i,
      /(?:shared[- ]network|shared[- ]IP|sharing an IP|same IP\/network share)/i,
      /\b(?:5|five)\b/, /\b(?:50|fifty)\b/, /UTC hour/i, /UTC day/i,
      /client result/i, /unavailable/i, /migration/i, /WAF/i, /enablement/i,
    ];
    const disclosureMarkup = html.match(/<div\b[^>]*\bclass=["'][^"']*\bdi-demo-disclosure\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i)?.[0] ?? '';
    const disclosureText = visibleText(disclosureMarkup);
    if (disclosureTerms.some(term => !term.test(disclosureText))) failures.push('Integration disclosure is incomplete.');
    if (!html.includes('href="https://console.groq.com/docs/your-data"')) failures.push('Integration disclosure must link the exact approved Groq data URL.');
    const expectedProfiles = ['the-weaver', 'the-tailor', 'cascade-engineer', 'the-algorithm'];
    const select = html.match(/<select\b[^>]*>[\s\S]*?<\/select>/i)?.[0] ?? '';
    const profiles = [...select.matchAll(/<option\b[^>]*(?:\s)value=(["'])(.*?)\1/gi)].map(match => match[2]).filter(Boolean);
    if (profiles.length !== expectedProfiles.length || expectedProfiles.some(slug => profiles.filter(value => value === slug).length !== 1)) {
      failures.push('Integration selector must contain exactly the four approved profiles.');
    }
  }
}

for (const [route, html] of htmlByRoute) {
  const links = [...html.matchAll(/<a\b([^>]*)\bhref\s*=\s*(["'])(.*?)\2([^>]*)>/gi)];
  for (const match of links) {
    const href = decode(match[3].trim());
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const base = new URL(`https://local-draft.invalid${route}`);
    let target: URL;
    try { target = new URL(href, base); }
    catch { failures.push(`${route}: malformed href ${href}`); continue; }
    if (target.protocol === 'http:' || target.protocol === 'https:') {
      if (target.origin !== base.origin) {
        if (!isApprovedExternalLink(href)) failures.push(`${route}: unapproved external clickable URL (${href}).`);
        continue;
      }
      const targetRoute = routeForPath(target.pathname);
      const targetFile = targetRoute ? outputPath(targetRoute) : path.join(dist, target.pathname.replace(/^\/+/, ''));
      if (!await fileExists(targetFile) && !await fileExists(path.join(targetFile, 'index.html'))) {
        failures.push(`${route}: broken local href ${href}`);
        continue;
      }
      if (target.hash) {
        const targetHtml = targetRoute ? htmlByRoute.get(targetRoute) : await readFile(
          await fileExists(targetFile) ? targetFile : path.join(targetFile, 'index.html'), 'utf8',
        ).catch(() => '');
        let anchor: string;
        try { anchor = decodeURIComponent(target.hash.slice(1)); } catch { anchor = target.hash.slice(1); }
        if (!targetHtml || !hasId(targetHtml, anchor)) failures.push(`${route}: missing hash target ${href}`);
      }
    }
  }
}

const notFoundPath = path.join(dist, '404.html');
try {
  const html = await readFile(notFoundPath, 'utf8');
  const text = visibleText(html);
  if (!/<meta\s+name=["']robots["']\s+content=["']noindex, nofollow["']/i.test(html)) failures.push('404 page must be noindex, nofollow.');
  if (innerText(html, 'h1') !== 'Page not found') failures.push('404 page must render a Page not found H1.');
  if (!text.includes(DRAFT_MARKER)) failures.push('404 page must visibly show the exact draft-only banner.');
  if (/(?:rel=["']canonical["']|property=["']og:|application\/ld\+json|schema\.org)/i.test(html)) failures.push('404 page must not contain canonical, Open Graph, or structured metadata.');
  if (/\b(?:internal handoff|license(?:[- ]key)?|degraded(?: mechanics)?|\bTODO\b)\b/i.test(html)) failures.push('404 page contains prohibited internal mechanics or TODO material.');
  if (/\bdata-widget-mount\b/i.test(html)) failures.push('404 page must not contain a widget mount.');
} catch { failures.push('Missing generated 404.html.'); }

const rootHtml = htmlByRoute.get('/');
if (rootHtml) {
  const form = rootHtml.match(/<form\b[^>]*>[\s\S]*?<\/form>/i)?.[0] ?? '';
  if (!form || !/<fieldset\b[^>]*\bdisabled(?:\s|>|=)/i.test(form)) failures.push('Hub consultation form must be disabled by a disabled fieldset.');
  if (!/Consultation unavailable in this draft preview/i.test(visibleText(form))) failures.push('Hub must identify consultation as unavailable in this draft preview.');
  if (!/<button\b[^>]*\bdisabled(?:\s|>|=)/i.test(form)) failures.push('Hub consultation button must be disabled.');
}

const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8').catch(() => '');
if (!/Disallow:\s*\//i.test(robots)) failures.push('Draft robots.txt must disallow crawling.');
if (await fileExists(path.join(dist, 'sitemap.xml'))) failures.push('Draft output must not contain sitemap.xml.');

async function outputFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? outputFiles(file) : Promise.resolve([file]);
  }));
  return groups.flat();
}
const files = await outputFiles(dist);
const expectedHtml = new Set([...pages.map(page => outputPath(page.path)), notFoundPath]);
for (const file of files.filter(file => /\.html$/i.test(file))) {
  if (!expectedHtml.has(file)) failures.push('Unexpected generated HTML route.');
}
const serverNames = [
  'GESTALTVIEW_RUNTIME_API_BASE', 'DI_DEMO_SERVICE_SIGNING_SECRET',
  'DI_DEMO_VISITOR_HMAC_SECRET', 'DI_DEMO_ENABLED', 'DI_DEMO_REPLAY_HMAC_SECRET',
  'DI_DEMO_SERVICE_SIGNING_KEYS_JSON', 'GROQ_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
];
const configuredValues = serverNames
  .filter(name => name !== 'DI_DEMO_ENABLED')
  .map(name => process.env[name])
  .filter((value): value is string => Boolean(value));
for (const file of files.filter(file => /\.(?:html|js|mjs|css|json|map|txt)$/i.test(file))) {
  const contents = await readFile(file, 'utf8');
  if (serverNames.some(name => contents.includes(name)) || configuredValues.some(value => contents.includes(value))) {
    // Do not print names, values, payloads, or file contents when reporting a leak.
    failures.push('Browser output contains server-only configuration.');
  }
}

if (failures.length) {
  console.error(`Build verification failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Build verification passed: ${pages.length} internal-review routes, a noindex 404, and no public SEO output.`);
}
