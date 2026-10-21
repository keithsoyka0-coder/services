// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertLocalPreviewPolicy, assertLoopbackHost } from '../scripts/local-preview-policy';

describe('local preview policy', () => {
  it.each(['1', ''])('allows a Vercel draft build with VERCEL=%j', (vercel) => {
    expect(() => assertLocalPreviewPolicy({ VERCEL: vercel, VERCEL_ENV: 'production', CI: 'true' })).not.toThrow();
  });

  it('rejects unsafe public-release flags locally and on Vercel', () => {
    for (const env of [
      { PUBLIC_RELEASE: 'true' },
      { PUBLIC_RELEASE: ' TRUE ' },
      { CONTENT_APPROVED: 'true' },
      { CONTENT_APPROVED: ' True ' },
      { SITE_ORIGIN: 'https://services.example.test' },
      { SITE_ORIGIN: ' ' },
    ]) {
      expect(() => assertLocalPreviewPolicy(env)).toThrow(/local draft preview/i);
      expect(() => assertLocalPreviewPolicy({ VERCEL: '1', ...env })).toThrow(/local draft preview/i);
    }
  });

  it('allows ordinary local and CI environments without public-release flags', () => {
    expect(() => assertLocalPreviewPolicy({ CI: 'true' })).not.toThrow();
    expect(() => assertLocalPreviewPolicy({ SITE_ORIGIN: '' })).not.toThrow();
  });

  it('uses the verified draft build on Vercel and preserves hosting safeguards', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
    expect(config.buildCommand).toBe('npm run build && npm run verify:build');
    expect(config.outputDirectory).toBe('dist');
    const headers = config.headers.find((rule: { source: string }) => rule.source === '/(.*)').headers;
    expect(headers).toEqual(expect.arrayContaining([
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
      },
    ]));
  });

  it('accepts only explicit loopback host bindings', () => {
    expect(() => assertLoopbackHost('127.0.0.1')).not.toThrow();
    expect(() => assertLoopbackHost('localhost')).not.toThrow();
    expect(() => assertLoopbackHost('0.0.0.0')).toThrow(/loopback/i);
    expect(() => assertLoopbackHost('::')).toThrow(/loopback/i);
    expect(() => assertLoopbackHost('192.168.1.5')).toThrow(/loopback/i);
  });

  it('configures Vite dev and preview for loopback-only noindex serving', () => {
    const config = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(config).toMatch(/server:\s*\{[^}]*host:\s*'127\.0\.0\.1'/s);
    expect(config).toMatch(/preview:\s*\{[^}]*host:\s*'127\.0\.0\.1'/s);
    expect(config).toContain("const noindexHeaders = { 'X-Robots-Tag': 'noindex, nofollow' }");
    expect(config.match(/headers: noindexHeaders/g)).toHaveLength(2);
    expect(config).toContain("allowedHosts: ['localhost', '127.0.0.1']");
  });

  it('rejects a wildcard host supplied as a Vite CLI override', () => {
    expect(() => assertLoopbackHost('0.0.0.0')).toThrow(/loopback/i);
  });
});
