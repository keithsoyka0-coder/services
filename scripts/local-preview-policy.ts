// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
export type PreviewEnvironment = Record<string, string | undefined>;
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Allow draft builds on Vercel, but fail closed on public-release configuration. */
export function assertLocalPreviewPolicy(env: PreviewEnvironment): void {
  const blocked = [
    /^true$/i.test(env.PUBLIC_RELEASE?.trim() ?? '') ? 'PUBLIC_RELEASE=true' : undefined,
    /^true$/i.test(env.CONTENT_APPROVED?.trim() ?? '') ? 'CONTENT_APPROVED=true' : undefined,
    env.SITE_ORIGIN !== undefined && env.SITE_ORIGIN !== '' ? 'SITE_ORIGIN is non-empty' : undefined,
  ].filter((reason): reason is string => Boolean(reason));
  if (blocked.length) {
    throw new Error(`Local draft preview only: public-release configuration is blocked (${blocked.join(', ')}).`);
  }
}

export function assertLoopbackHost(host: string | boolean | undefined): void {
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error(`Local draft preview must bind to loopback (127.0.0.1 or localhost), not ${String(host)}.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertLocalPreviewPolicy(process.env);
}
