// © 2026 Keith Soyka / GestaltView · provenance: Services demo slice 1
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertLoopbackHost } from '../scripts/local-preview-policy';

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');
describe('draft build without deployment gates', () => {
  it('builds without environment policy hooks and keeps the verifier local-only', () => {
    const { scripts } = JSON.parse(read('package.json'));
    expect(scripts['policy:preview']).toBeUndefined();
    expect(scripts.predev).toBe('npm run generate:drafts');
    expect(scripts.prebuild).toBe('npm run generate:drafts');
    expect(scripts.prepreview).toBeUndefined();
    expect(scripts.check).toContain('npm run verify:build');
    expect(scripts['verify:build']).toBe('tsx scripts/verify-build.ts');
    for (const file of ['vite.config.ts', 'scripts/prerender.ts', 'scripts/verify-build.ts', 'scripts/local-preview-policy.ts']) {
      expect(read(file), file).not.toContain('assertLocalPreviewPolicy');
      expect(read(file), file).not.toMatch(/PUBLIC_RELEASE|CONTENT_APPROVED|SITE_ORIGIN/);
    }
  });
  it('uses only the build on Vercel and preserves every hosting safeguard', () => {
    const config = JSON.parse(read('vercel.json'));
    expect(config.buildCommand).toBe('npm run build');
    expect(config.outputDirectory).toBe('dist');
    const headers = config.headers.find((rule: { source: string }) => rule.source === '/(.*)').headers;
    expect(headers).toEqual([
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'" },
    ]);
  });
  it('accepts only explicit loopback host bindings', () => {
    for (const host of ['127.0.0.1', 'localhost']) expect(() => assertLoopbackHost(host)).not.toThrow();
    for (const host of ['0.0.0.0', '::', '192.168.1.5', true, undefined]) expect(() => assertLoopbackHost(host)).toThrow(/loopback/i);
  });
  it('configures Vite dev and preview for loopback-only noindex serving', () => {
    const config = read('vite.config.ts');
    expect(config).toMatch(/server:\s*\{[^}]*host:\s*'127\.0\.0\.1'/s);
    expect(config).toMatch(/preview:\s*\{[^}]*host:\s*'127\.0\.0\.1'/s);
    expect(config).toContain("const noindexHeaders = { 'X-Robots-Tag': 'noindex, nofollow' }");
    expect(config.match(/headers: noindexHeaders/g)).toHaveLength(2);
    expect(config).toContain("allowedHosts: ['localhost', '127.0.0.1']");
  });
  it('documents only blank server settings without release-policy instructions', () => {
    const example = read('.env.example');
    for (const name of ['GESTALTVIEW_RUNTIME_API_BASE', 'DI_DEMO_SERVICE_SIGNING_SECRET', 'DI_DEMO_VISITOR_HMAC_SECRET', 'DI_DEMO_ENABLED']) {
      expect(example).toMatch(new RegExp(`^${name}=$`, 'm'));
    }
    expect(example).not.toMatch(/VITE_|PUBLIC_RELEASE|CONTENT_APPROVED|SITE_ORIGIN/);
    for (const file of ['README.md', 'docs/builder/quickstart.md', 'docs/builder/acceptance-status.md', 'docs/builder/seo-build-contract.md']) {
      const text = read(file);
      expect(text, file).toContain('npm run build');
      expect(text, file).toContain('npm run verify:build');
      expect(text, file).toMatch(/local-only/i);
      expect(text, file).toMatch(/disabled by default/i);
      expect(text, file).toMatch(/noindex/i);
      expect(text, file).not.toMatch(/leave `SITE_ORIGIN` empty|flags.*(?:blocked|rejected)|build && npm run verify:build/);
    }
  });
});
