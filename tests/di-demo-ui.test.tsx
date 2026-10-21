// © 2026 Keith Soyka / GestaltView · provenance: local draft preview builder
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

const path = '/ai-integration/';
const profiles = [
  ['the-weaver', 'The Weaver'],
  ['the-tailor', 'The Tailor'],
  ['cascade-engineer', 'The Cascade Engineer'],
  ['the-algorithm', 'The Algorithm'],
];

function submitFields(message = 'Show me a careful example.') {
  fireEvent.change(screen.getByRole('combobox', { name: /profile/i }), { target: { value: 'the-weaver' } });
  fireEvent.change(screen.getByRole('textbox', { name: /message/i }), { target: { value: message } });
  fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
}

function okResponse(answer: string) {
  return new Response(JSON.stringify({ answer }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('draft Digital Intelligence demo UI', () => {
  it('renders the exact four profiles and labeled form only on the integration spoke', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { rerender } = render(<App path={path} />);
    expect(screen.getByRole('form', { name: 'Digital Intelligence draft demo' })).toBeTruthy();
    const selector = screen.getByRole('combobox', { name: /profile/i }) as HTMLSelectElement;
    expect([...selector.options].map(({ value, text }) => [value, text])).toEqual([['', 'Select a profile'], ...profiles]);
    expect(screen.getByRole('textbox', { name: /message/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /send|submit/i })).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    rerender(<App path="/website-build/" />);
    expect(screen.queryByRole('form', { name: 'Digital Intelligence draft demo' })).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows every required disclosure before the submit control', () => {
    const html = renderToStaticMarkup(<App path={path} />);
    const submitPosition = html.indexOf('type="submit"');
    expect(html.indexOf('Before submitting:')).toBeGreaterThan(-1);
    for (const required of [
      'full canonical profile context', 'private-interior notes', 'memorySystem.privateInterior', 'memories', 'founder notes', 'relationships',
      'wound-layer material', 'values', 'preferences', 'skills', 'may appear in the reply', 'Do not enter sensitive information',
      'not retained by default', 'reliability troubleshooting', 'suspected abuse', 'up to 30 days', 'longer if legally required',
      'Services and Runtime do not persist your messages or answers', 'pseudonymous keyed digests, not anonymous data',
      '5 accepted requests per visitor per fixed UTC hour', 'same IP/network share this limit', '50 accepted requests globally per fixed UTC day',
      'not a client result', 'not a promise that these embodiments are included in a purchased service',
      'Live calls are unavailable until Runtime configuration', 'reviewed migration/RPC', 'Services-edge WAF rule', 'separate enablement',
    ]) {
      const disclosurePosition = html.indexOf(required);
      expect(disclosurePosition, `missing disclosure text: ${required}`).toBeGreaterThan(-1);
      expect(disclosurePosition, `disclosure appears after submit control: ${required}`).toBeLessThan(submitPosition);
    }
    expect(html).toContain('href="https://console.groq.com/docs/your-data"');
    expect(html).not.toMatch(/openai\/gpt|DI_DEMO_|GROQ_API_KEY|GESTALTVIEW_RUNTIME_API_BASE/);
  });

  it('posts exactly one same-origin request with only profileSlug and message and renders answer as text', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse('<img src=x onerror=alert(1)>'));
    render(<App path={path} />);
    submitFields();
    await waitFor(() => expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy());
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/di-demo');
    const options = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe('POST');
    expect(options.redirect).toBe('error');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(options.body))).toEqual({ profileSlug: 'the-weaver', message: 'Show me a careful example.' });
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByLabelText('Demo answer').getAttribute('aria-live')).toBe('polite');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(screen.queryByText(/session history|conversation history/i)).toBeNull();
    expect(screen.getByText(/not a client result/i)).toBeTruthy();
  });

  it('accepts a response body matching the Runtime answer allowance', async () => {
    const answer = 'x'.repeat(32_768);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse(answer));
    render(<App path={path} />);
    submitFields();
    await waitFor(() => expect(screen.getByLabelText('Demo answer').textContent).toHaveLength(answer.length));
  });

  it('prevents duplicate submission while a request is pending', async () => {
    let resolveFetch!: (response: Response) => void;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise((resolve) => { resolveFetch = resolve; }));
    render(<App path={path} />);
    submitFields();
    expect(screen.getByRole('status').textContent).toMatch(/sending|working|loading/i);
    expect((screen.getByRole('button', { name: /send|submit/i }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.submit(screen.getByRole('form', { name: 'Digital Intelligence draft demo' }));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    resolveFetch(okResponse('Done.'));
    await waitFor(() => expect(screen.getByText('Done.')).toBeTruthy());
  });

  it('keeps empty messages local and clamps over-limit Unicode before one request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse('Bounded answer'));
    render(<App path={path} />);
    fireEvent.change(screen.getByRole('combobox', { name: /profile/i }), { target: { value: 'the-weaver' } });
    fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toMatch(/enter a message/i);
    const message = screen.getByRole('textbox', { name: /message/i });
    fireEvent.change(message, { target: { value: '😀'.repeat(1201) } });
    fireEvent.click(screen.getByRole('button', { name: /send|submit/i }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const request = JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body)) as { message: string };
    expect(Array.from(request.message)).toHaveLength(1200);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Answer ready.'));
  });

  it('shows a bounded-limit message for 429 without echoing response data and resets transient form state', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'private quota internals', retryAfterSeconds: 900 }), { status: 429 }))
      .mockResolvedValueOnce(okResponse('Fresh answer'));
    render(<App path={path} />);
    submitFields();
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/limit reached|wait before trying/i));
    expect(screen.getByRole('status').textContent).toMatch(/900 seconds/i);
    expect(screen.queryByText(/private quota internals/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect((screen.getByRole('textbox', { name: /message/i }) as HTMLTextAreaElement).value).toBe('');
    expect(screen.queryByText(/limit reached/i)).toBeNull();
    submitFields('A new message');
    await waitFor(() => expect(screen.getByText('Fresh answer')).toBeTruthy());
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['unavailable response', () => new Response(JSON.stringify({ error: 'private server detail' }), { status: 503 }), /temporarily unavailable/i],
    ['invalid response', () => new Response(JSON.stringify({ error: 'private validation detail' }), { status: 400 }), /could not be completed/i],
    ['network failure', () => Promise.reject(new Error('sensitive network detail')), /temporarily unavailable/i],
    ['timeout', () => Promise.reject(new DOMException('sensitive timeout detail', 'AbortError')), /temporarily unavailable/i],
    ['oversized answer', () => new Response(JSON.stringify({ answer: 'x'.repeat(270_000) }), { status: 200 }), /temporarily unavailable/i],
  ])('handles %s with a generic message', async (_name, response, message) => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(response() as Response));
    render(<App path={path} />);
    submitFields();
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(message));
    expect(screen.queryByText(/sensitive (?:network|timeout)|private (?:server|validation) detail/)).toBeNull();
  });
});
