// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
// Deliberately does not inspect or persist request content. DB contract approval is pending.
import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
    return;
  }
  res.status(503).json({ ok: false, code: 'SERVICE_UNAVAILABLE' });
}
