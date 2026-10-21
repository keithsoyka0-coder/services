// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../api/consultation-requests';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn(), end: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}
describe('consultation endpoint fail-closed stub', () => {
  it('never reports a persisted inquiry while the database contract is blocked', () => {
    const res = response();
    handler({ method: 'POST', body: { contact: 'do-not-echo@example.test' } } as VercelRequest, res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ ok: false, code: 'SERVICE_UNAVAILABLE' });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('do-not-echo');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
  it('rejects unsupported methods with the exact allowed method', () => {
    const res = response();
    handler({ method: 'GET' } as VercelRequest, res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
  });
});
