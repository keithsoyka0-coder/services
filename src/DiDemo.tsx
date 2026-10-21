// © 2026 Keith Soyka / GestaltView · provenance: local draft preview builder
import { useRef, useState, type FormEvent } from 'react';

const profiles = [
  { slug: 'the-weaver', name: 'The Weaver' },
  { slug: 'the-tailor', name: 'The Tailor' },
  { slug: 'cascade-engineer', name: 'The Cascade Engineer' },
  { slug: 'the-algorithm', name: 'The Algorithm' },
] as const;
const MAX_MESSAGE_CODE_POINTS = 1200;
const MAX_RESPONSE_BYTES = 262144;
const REQUEST_TIMEOUT_MS = 35_000;
const LIVE_UNAVAILABLE = 'Live calls are unavailable until Runtime configuration and the reviewed migration/RPC are in place, the Services-edge WAF rule is configured, and separate enablement is authorized.';
const GENERIC_UNAVAILABLE = 'The request is temporarily unavailable. Please try again later.';

async function readBoundedResponse(response: Response): Promise<string> {
  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) throw new Error('Response too large');
    return text;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('Response too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export function DiDemo() {
  const [profileSlug, setProfileSlug] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(LIVE_UNAVAILABLE);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || loading) return;
    if (!profiles.some((profile) => profile.slug === profileSlug)) {
      setAnswer('');
      setStatus('Select a profile before sending a message.');
      return;
    }
    if (message.length === 0) {
      setAnswer('');
      setStatus('Enter a message before sending.');
      return;
    }
    if ([...message].length > MAX_MESSAGE_CODE_POINTS) {
      setAnswer('');
      setStatus('Messages are limited to 1,200 Unicode code points.');
      return;
    }

    submitting.current = true;
    setLoading(true);
    setAnswer('');
    setStatus('Sending your message…');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch('/api/di-demo', {
        method: 'POST',
        redirect: 'error',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileSlug, message }),
        signal: controller.signal,
      });
      if (response.status === 429) {
        let retryAfterSeconds: number | null = null;
        try {
          const body: unknown = JSON.parse(await readBoundedResponse(response));
          if (typeof body === 'object' && body !== null && 'retryAfterSeconds' in body &&
              typeof body.retryAfterSeconds === 'number' && Number.isInteger(body.retryAfterSeconds) &&
              body.retryAfterSeconds >= 1 && body.retryAfterSeconds <= 86400) {
            retryAfterSeconds = body.retryAfterSeconds;
          }
        } catch {
          // A malformed or oversized quota response receives only generic UI text.
        }
        setStatus(retryAfterSeconds === null
          ? 'Request limit reached. Please wait before trying again.'
          : `Request limit reached. Please wait about ${retryAfterSeconds} seconds before trying again.`);
        return;
      }
      if (response.status === 400 || response.status === 422) {
        setStatus('The request could not be completed. Check the profile and message, then try again.');
        return;
      }
      if (!response.ok) {
        setStatus(GENERIC_UNAVAILABLE);
        return;
      }
      const body: unknown = JSON.parse(await readBoundedResponse(response));
      if (typeof body !== 'object' || body === null || !('answer' in body) || typeof body.answer !== 'string') {
        setStatus(GENERIC_UNAVAILABLE);
        return;
      }
      setAnswer(body.answer);
      setStatus('Answer ready.');
    } catch {
      setStatus(GENERIC_UNAVAILABLE);
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setLoading(false);
    }
  }

  function reset() {
    if (submitting.current) return;
    setProfileSlug('');
    setMessage('');
    setAnswer('');
    setStatus(LIVE_UNAVAILABLE);
  }

  return <section className="widget-mount" data-widget-mount="ai-integration" data-service-id="ai-integration" data-widget-state="active-in-draft" aria-label="Digital Intelligence draft demo">
    <p className="sec-label">Digital Intelligence draft demo</p>
    <div className="di-demo-disclosure">
      <p>Before submitting: your message and the selected embodiment’s full canonical profile context—everything except its private-interior notes (<code>memorySystem.privateInterior</code>), including memories, founder notes, relationships, wound-layer material, values, preferences, and skills—are sent to Groq. Some of that material may appear in the reply. Do not enter sensitive information.</p>
      <p>Groq says inference inputs and outputs are not retained by default. Groq may temporarily log them for reliability troubleshooting or suspected abuse for up to 30 days, or longer if legally required. Read <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">Groq’s data-handling documentation</a>.</p>
      <p>Services and Runtime do not persist your messages or answers. Quota counters use pseudonymous keyed digests, not anonymous data.</p>
      <p>Limit: 5 accepted requests per visitor per fixed UTC hour; visitors on the same IP/network share this limit. 50 accepted requests globally per fixed UTC day.</p>
      <p>This is a stateless, one-message demonstration. It is not a client result and is not a promise that these embodiments are included in a purchased service.</p>
      <p>{LIVE_UNAVAILABLE}</p>
    </div>
    <form aria-label="Digital Intelligence draft demo" onSubmit={submit}>
      <label htmlFor="di-demo-profile">Profile</label>
      <select id="di-demo-profile" name="profileSlug" value={profileSlug} onChange={(event) => setProfileSlug(event.target.value)} disabled={loading}>
        <option value="">Select a profile</option>
        {profiles.map((profile) => <option key={profile.slug} value={profile.slug}>{profile.name}</option>)}
      </select>
      <label htmlFor="di-demo-message">Message</label>
      <textarea id="di-demo-message" name="message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2400} disabled={loading} />
      <div className="di-demo-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send message'}</button>
        <button className="btn btn-ghost" type="button" onClick={reset} disabled={loading}>Reset</button>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true">{status}</p>
      {answer !== '' && <pre className="di-demo-answer" aria-label="Demo answer" aria-live="polite">{answer}</pre>}
    </form>
  </section>;
}
