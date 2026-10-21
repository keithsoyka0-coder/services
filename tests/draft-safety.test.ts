// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertLocalPreviewPolicy, assertLoopbackHost } from '../scripts/local-preview-policy';

describe('local preview policy', () => {
  it('rejects every deployment or public-release environment indicator', () => {
    for (const env of [
      { VERCEL: '1' },
      { VERCEL: '' },
      { PUBLIC_RELEASE: 'true' },
      { CONTENT_APPROVED: 'true' },
      { SITE_ORIGIN: 'https://services.example.test' },
      { SITE_ORIGIN: ' ' },
    ]) {
      expect(() => assertLocalPreviewPolicy(env)).toThrow(/local draft preview/i);
    }
  });

  it('allows ordinary local and CI environments without public-release flags', () => {
    expect(() => assertLocalPreviewPolicy({ CI: 'true' })).not.toThrow();
    expect(() => assertLocalPreviewPolicy({ SITE_ORIGIN: '' })).not.toThrow();
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
