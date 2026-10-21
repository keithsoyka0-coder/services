// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const dirs: string[] = [];
const slugs = ['website-build', 'ai-opportunity-audit', 'ai-ops-sprint', 'codebase-audit', 'custom-software', 'ai-integration'];
const banner = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';
const disclosure = 'Visitor text and all canonical profile context except private interior, including memories, founder notes, relationships, wound-layer material, values, preferences and skills, are sent to Groq and may appear in replies. Do not enter sensitive information. Groq inference inputs and outputs are not retained by default but may be logged for reliability troubleshooting or suspected abuse for up to 30 days, or longer if legally required. Services and Runtime do not persist messages or answers. Pseudonymous keyed digests and counters are not anonymous. Shared network: 5 accepted requests per visitor per fixed UTC hour; 50 total per fixed UTC day. This is not a client result or a purchased service inclusion. Live calls are unavailable until Runtime configuration, reviewed migration/RPC, Services WAF rule and separate enablement.';
const demo = `<section data-widget-mount="ai-integration" data-widget-state="active-in-draft"><div class="di-demo-disclosure"><p>${disclosure}</p></div><a href="https://console.groq.com/docs/your-data">Groq data handling</a><form><select>${['the-weaver', 'the-tailor', 'cascade-engineer', 'the-algorithm'].map(slug => `<option value="${slug}">${slug}</option>`).join('')}</select><button>Submit</button></form></section>`;
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'services-verifier-')); dirs.push(root);
  mkdirSync(join(root, 'dist/assets'), { recursive: true }); mkdirSync(join(root, 'dist-server'));
  const pages = ['/', ...slugs.map(slug => `/${slug}/`)].map(path => ({ path, title: path, h1: path, source: 'draft-internal', reviewNotes: [] }));
  writeFileSync(join(root, 'dist-server/entry-server.js'), `exports.pages = ${JSON.stringify(pages)};`);
  for (const page of pages) {
    const file = page.path === '/' ? join(root, 'dist/index.html') : join(root, 'dist', page.path.slice(1), 'index.html');
    mkdirSync(resolve(file, '..'), { recursive: true });
    const body = page.path === '/' ? '<form><fieldset disabled><button disabled>Consultation unavailable in this draft preview</button></fieldset></form>'
      : `<p>Scope approval pending</p><p>Proof approval pending</p>${page.path === '/ai-integration/' ? demo : '<section data-widget-mount="spoke" data-widget-state="disabled"></section>'}`;
    writeFileSync(file, `<title>${page.title}</title><meta name="robots" content="noindex, nofollow"><h1>${page.h1}</h1><p>${banner}</p>${body}`);
  }
  writeFileSync(join(root, 'dist/404.html'), `<title>404</title><meta name="robots" content="noindex, nofollow"><h1>Page not found</h1><p>${banner}</p>`);
  writeFileSync(join(root, 'dist/robots.txt'), 'User-agent: *\nDisallow: /\n');
  writeFileSync(join(root, 'dist/assets/client.js'), 'console.info("synthetic client")');
  return root;
}
function change(root: string, relative: string, transform: (text: string) => string) {
  const file = join(root, relative); writeFileSync(file, transform(readFileSync(file, 'utf8')));
}
function verify(root: string, extraEnv: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [resolve('node_modules/tsx/dist/cli.mjs'), resolve('scripts/verify-build.ts')], {
    cwd: root, encoding: 'utf8', env: { ...process.env, ...extraEnv }, timeout: 15_000,
  });
  if (result.error) throw result.error;
  return { status: result.status, text: result.stdout + result.stderr };
}
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
describe('real local build verifier', () => {
  it('accepts exactly the disclosed draft demo fixture and approved Groq link', () => {
    const result = verify(fixture()); expect(result.text).toContain('Build verification passed'); expect(result.status).toBe(0);
  });
  it('allows an empty selection placeholder but still requires exactly four profile values', () => {
    const root = fixture(); change(root, 'dist/ai-integration/index.html', text => text.replace('<select>', '<select><option value="">Select a profile</option>'));
    expect(verify(root).status).toBe(0);
  });
  it('accepts the approved same-IP/network shared-limit wording', () => {
    const root = fixture(); change(root, 'dist/ai-integration/index.html', text => text.replace('Shared network', 'Visitors on the same IP/network share this limit'));
    expect(verify(root).status).toBe(0);
  });
  it.each(['founder notes', 'wound-layer material', '30 days', 'pseudonymous'])('rejects missing disclosure detail %s', term => {
    const root = fixture(); change(root, 'dist/ai-integration/index.html', text => text.replace(new RegExp(term, 'i'), 'omitted'));
    const result = verify(root); expect(result.status).toBe(1); expect(result.text).toMatch(/disclosure/i);
  });
  it('rejects replacing the rendered integration demo with a dormant mount', () => {
    const root = fixture(); change(root, 'dist/ai-integration/index.html', text => text.replace('active-in-draft', 'disabled'));
    expect(verify(root).status).toBe(1);
  });
  it.each(['dist/index.html', 'dist/404.html'])('rejects an extra mount on %s', file => {
    const root = fixture(); change(root, file, text => text + '<section data-widget-mount="extra" data-widget-state="active-in-draft"></section>');
    expect(verify(root).status).toBe(1);
  });
  it('rejects an extra selector profile', () => {
    const root = fixture(); change(root, 'dist/ai-integration/index.html', text => text.replace('</select>', '<option value="other">Other</option></select>'));
    expect(verify(root).status).toBe(1);
  });
  it.each(['https://example.com', 'https://console.groq.com/docs/your-data?extra=1', ' https://console.groq.com/docs/your-data'])('rejects external link %s', href => {
    const root = fixture(); change(root, 'dist/ai-integration/index.html', text => text.replace('https://console.groq.com/docs/your-data', href));
    expect(verify(root).status).toBe(1);
  });
  it('rejects server configuration names in browser assets', () => {
    const root = fixture(); change(root, 'dist/assets/client.js', text => text + ';"DI_DEMO_SERVICE_SIGNING_SECRET";');
    const result = verify(root); expect(result.status).toBe(1); expect(result.text).toMatch(/server-only/i);
  });
  it('rejects a configured synthetic secret value without printing it', () => {
    const root = fixture(); const synthetic = 'synthetic-only-leak-check'; change(root, 'dist/assets/client.js', text => text + JSON.stringify(synthetic));
    const result = verify(root, { DI_DEMO_SERVICE_SIGNING_SECRET: synthetic });
    expect(result.status).toBe(1); expect(result.text).not.toContain(synthetic);
  });
  it('rejects an extra generated HTML route', () => {
    const root = fixture(); writeFileSync(join(root, 'dist/extra.html'), '<h1>Extra</h1>');
    expect(verify(root).status).toBe(1);
  });
});
