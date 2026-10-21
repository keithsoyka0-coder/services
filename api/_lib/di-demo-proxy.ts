import { createHash, createHmac, randomBytes as nodeRandomBytes } from "node:crypto";
import { isIP } from "node:net";
import type { IncomingMessage } from "node:http";

export const OFFICIAL_RUNTIME_BASE = "https://gestaltview-ai-v3.vercel.app";
export const OFFICIAL_RUNTIME_URL = `${OFFICIAL_RUNTIME_BASE}/api/di-demo`;
export const MAX_RAW_BODY_BYTES = 8192;
export const MAX_MESSAGE_CODE_POINTS = 1200;
const PROFILE_SLUGS = new Set([
  "the-weaver",
  "the-tailor",
  "cascade-engineer",
  "the-algorithm",
]);
const DEFAULT_TIMEOUT_MS = 35_000;
const MAX_UPSTREAM_RESPONSE_BYTES = 256 * 1024;
const MAX_ANSWER_BYTES = 32 * 1024;
const MAX_RETRY_AFTER_SECONDS = 86_400;

export interface DiDemoResponse {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  end(body?: string): unknown;
}

export interface DiDemoDependencies {
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
  now?: () => number;
  randomBytes?: (size: number) => Buffer;
  timeoutMs?: number;
}

interface ClientRequest {
  profileSlug: string;
  message: string;
}

function send(response: DiDemoResponse, status: number, payload: unknown, extraHeaders: Record<string, string> = {}): void {
  response.statusCode = status;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [name, value] of Object.entries(extraHeaders)) response.setHeader(name, value);
  response.end(JSON.stringify(payload));
}

function headerValues(request: IncomingMessage, name: string): string[] {
  const raw = request.rawHeaders;
  if (!Array.isArray(raw) || raw.length % 2 !== 0) return [];
  const found: string[] = [];
  for (let index = 0; index < raw.length; index += 2) {
    if (raw[index]?.toLowerCase() === name) found.push(raw[index + 1] ?? "");
  }
  return found;
}

function oneHeader(request: IncomingMessage, name: string): string | null {
  const values = headerValues(request, name);
  if (values.length !== 1 || !values[0]) return null;
  const parsed = request.headers[name];
  if (typeof parsed !== "string" || parsed !== values[0]) return null;
  return values[0];
}

async function readRawBody(request: IncomingMessage): Promise<Buffer> {
  const lengthHeader = headerValues(request, "content-length");
  if (lengthHeader.length > 1) throw new Error("invalid");
  let declaredLength: number | undefined;
  if (lengthHeader.length === 1) {
    const value = lengthHeader[0]!;
    if (!/^(0|[1-9][0-9]{0,15})$/.test(value)) throw new Error("invalid");
    declaredLength = Number(value);
    if (!Number.isSafeInteger(declaredLength)) throw new Error("invalid");
    if (declaredLength > MAX_RAW_BODY_BYTES) throw new Error("large");
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    total += bytes.byteLength;
    if (total > MAX_RAW_BODY_BYTES) throw new Error("large");
    chunks.push(bytes);
  }
  if (declaredLength !== undefined && declaredLength !== total) throw new Error("invalid");
  return Buffer.concat(chunks, total);
}

function parseClientBody(raw: Buffer): ClientRequest | null {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    return null;
  }
  const record = parseStrictStringObject(text);
  if (!record || Object.keys(record).length !== 2) return null;
  if (!Object.prototype.hasOwnProperty.call(record, "profileSlug") || !Object.prototype.hasOwnProperty.call(record, "message")) return null;
  if (typeof record.profileSlug !== "string" || !PROFILE_SLUGS.has(record.profileSlug)) return null;
  if (typeof record.message !== "string") return null;
  const points = Array.from(record.message).length;
  if (points < 1 || points > MAX_MESSAGE_CODE_POINTS) return null;
  return { profileSlug: record.profileSlug, message: record.message };
}

function parseStrictStringObject(text: string): Record<string, unknown> | null {
  let index = 0;
  const whitespace = () => { while (/[\t\n\r ]/.test(text[index] ?? "")) index += 1; };
  const stringToken = (): string | null => {
    if (text[index] !== '"') return null;
    const start = index++;
    let escaped = false;
    while (index < text.length) {
      const character = text[index++]!;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') {
        try {
          const value: unknown = JSON.parse(text.slice(start, index));
          return typeof value === "string" ? value : null;
        } catch {
          return null;
        }
      }
    }
    return null;
  };
  whitespace();
  if (text[index++] !== "{") return null;
  whitespace();
  const result: Record<string, unknown> = Object.create(null);
  if (text[index] === "}") return null;
  while (index < text.length) {
    const key = stringToken();
    if (key === null || Object.prototype.hasOwnProperty.call(result, key)) return null;
    whitespace();
    if (text[index++] !== ":") return null;
    whitespace();
    const value = stringToken();
    if (value === null) return null;
    result[key] = value;
    whitespace();
    const delimiter = text[index++];
    if (delimiter === "}") break;
    if (delimiter !== ",") return null;
    whitespace();
  }
  whitespace();
  return index === text.length ? result : null;
}

function configuration(env: NodeJS.ProcessEnv): { signing: string; visitor: string } | null {
  if (env.DI_DEMO_ENABLED !== "true") return null;
  const base = env.GESTALTVIEW_RUNTIME_API_BASE;
  const signing = env.DI_DEMO_SERVICE_SIGNING_SECRET;
  const visitor = env.DI_DEMO_VISITOR_HMAC_SECRET;
  if (!base || !signing || !visitor || !signing.trim() || !visitor.trim()) return null;
  if (signing === visitor) return null;
  if (base !== OFFICIAL_RUNTIME_BASE && base !== `${OFFICIAL_RUNTIME_BASE}/`) return null;
  try {
    const parsed = new URL(base);
    if (parsed.href !== `${OFFICIAL_RUNTIME_BASE}/` || parsed.origin !== OFFICIAL_RUNTIME_BASE || parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
  } catch {
    return null;
  }
  return { signing, visitor };
}

function trustedClientIp(request: IncomingMessage): string | null {
  const value = oneHeader(request, "x-vercel-forwarded-for");
  if (!value || value.includes(",") || value !== value.trim() || isIP(value) === 0) return null;
  return value;
}

function canonicalRequestId(value: Buffer): string | null {
  if (value.length !== 32) return null;
  const encoded = value.toString("base64url");
  return /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/.test(encoded) ? encoded : null;
}

async function readBoundedResponse(response: Response, controller: AbortController): Promise<Buffer> {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_UPSTREAM_RESPONSE_BYTES) {
        controller.abort();
        throw new Error("response_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}

function parseJsonBytes(bytes: Buffer): unknown | null {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return null;
  }
}

function exactObject(value: unknown, keys: string[]): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Reflect.ownKeys(value);
  return actual.length === keys.length && actual.every((key) => typeof key === "string" && keys.includes(key));
}

function boundedRetrySeconds(value: unknown, header: string | null): number {
  const candidate = typeof value === "number" && Number.isFinite(value) ? value : Number(header);
  if (!Number.isFinite(candidate) || candidate <= 0) return 60;
  return Math.max(1, Math.min(MAX_RETRY_AFTER_SECONDS, Math.ceil(candidate)));
}

export function createDiDemoHandler(dependencies: DiDemoDependencies = {}): (request: IncomingMessage, response: DiDemoResponse) => Promise<void> {
  const env = dependencies.env ?? process.env;
  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const now = dependencies.now ?? Date.now;
  const getRandomBytes = dependencies.randomBytes ?? nodeRandomBytes;
  const timeoutMs = Number.isFinite(dependencies.timeoutMs) && (dependencies.timeoutMs ?? 0) > 0 ? Math.min(dependencies.timeoutMs!, DEFAULT_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS;

  return async (request, response) => {
    if (request.method !== "POST") {
      send(response, 405, { error: "invalid_request" }, { Allow: "POST" });
      return;
    }
    const settings = configuration(env);
    if (!settings) {
      send(response, 503, { error: "unavailable" });
      return;
    }
    const contentType = oneHeader(request, "content-type");
    if (!contentType || !/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?$/i.test(contentType)) {
      send(response, 400, { error: "invalid_request" });
      return;
    }
    const encodings = headerValues(request, "content-encoding");
    if (encodings.length > 1 || (encodings.length === 1 && encodings[0]!.toLowerCase() !== "identity")) {
      send(response, 400, { error: "invalid_request" });
      return;
    }
    const ip = trustedClientIp(request);
    if (!ip) {
      send(response, 400, { error: "invalid_request" });
      return;
    }
    let raw: Buffer;
    try {
      raw = await readRawBody(request);
    } catch (error) {
      send(response, error instanceof Error && error.message === "large" ? 413 : 400, { error: "invalid_request" });
      return;
    }
    if (raw.byteLength > MAX_RAW_BODY_BYTES) {
      send(response, 413, { error: "invalid_request" });
      return;
    }
    const input = parseClientBody(raw);
    if (!input) {
      send(response, 400, { error: "invalid_request" });
      return;
    }
    const timestampMillis = now();
    if (!Number.isFinite(timestampMillis) || !Number.isSafeInteger(Math.floor(timestampMillis / 1000))) {
      send(response, 503, { error: "unavailable" });
      return;
    }
    let requestId: string | null;
    try {
      requestId = canonicalRequestId(getRandomBytes(32));
    } catch {
      requestId = null;
    }
    if (!requestId) {
      send(response, 503, { error: "unavailable" });
      return;
    }
    const visitorDigest = createHmac("sha256", settings.visitor)
      .update(`gestaltview-di-demo-visitor-v1\n${ip}`, "utf8")
      .digest("hex");
    const signedBody = Buffer.from(JSON.stringify({
      profileSlug: input.profileSlug,
      message: input.message,
      visitorDigest,
      requestId,
    }), "utf8");
    if (signedBody.byteLength > MAX_RAW_BODY_BYTES) {
      send(response, 400, { error: "invalid_request" });
      return;
    }
    const timestamp = String(Math.floor(timestampMillis / 1000));
    const bodyHash = createHash("sha256").update(signedBody).digest("hex");
    const canonical = `POST\n/api/di-demo\ngestaltview-di-demo-v1\nv1\n${timestamp}\n${requestId}\n${bodyHash}`;
    const signature = createHmac("sha256", settings.signing).update(canonical, "utf8").digest("base64url");
    const controller = new AbortController();
    let rejectTimeout!: (reason: Error) => void;
    const timeout = new Promise<never>((_resolve, reject) => { rejectTimeout = reject; });
    const timer = setTimeout(() => {
      controller.abort();
      rejectTimeout(new Error("timeout"));
    }, timeoutMs);
    try {
      const requestAndBody = (async () => {
        const upstream = await fetcher(OFFICIAL_RUNTIME_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DI-Demo-Key-Id": "v1",
            "X-DI-Demo-Timestamp": timestamp,
            "X-DI-Demo-Request-Id": requestId,
            "X-DI-Demo-Signature": signature,
          },
          body: signedBody,
          redirect: "error",
          signal: controller.signal,
        });
        const responseBytes = await readBoundedResponse(upstream, controller);
        return { upstream, parsed: parseJsonBytes(responseBytes) };
      })();
      const { upstream, parsed } = await Promise.race([requestAndBody, timeout]);
      if (upstream.status === 429) {
        const retry = exactObject(parsed, ["error", "retryAfterSeconds"])
          ? boundedRetrySeconds(parsed.retryAfterSeconds, upstream.headers.get("retry-after"))
          : boundedRetrySeconds(undefined, upstream.headers.get("retry-after"));
        send(response, 429, { error: "rate_limited", retryAfterSeconds: retry }, { "Retry-After": String(retry) });
        return;
      }
      if (upstream.status >= 400 && upstream.status < 500) {
        send(response, 400, { error: "invalid_request" });
        return;
      }
      if (
        upstream.status !== 200 ||
        !exactObject(parsed, ["answer"]) ||
        typeof parsed.answer !== "string" ||
        parsed.answer.length === 0 ||
        Buffer.byteLength(parsed.answer, "utf8") > MAX_ANSWER_BYTES
      ) {
        send(response, 503, { error: "unavailable" });
        return;
      }
      send(response, 200, { answer: parsed.answer });
    } catch {
      send(response, 503, { error: "unavailable" });
    } finally {
      clearTimeout(timer);
    }
  };
}
