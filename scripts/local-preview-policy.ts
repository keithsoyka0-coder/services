// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
/** Local serving constraint only; no environment-based build/deployment policy. */
export function assertLoopbackHost(host: string | boolean | undefined): void {
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error(`Local draft preview must bind to loopback (127.0.0.1 or localhost), not ${String(host)}.`);
  }
}
