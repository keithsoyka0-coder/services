import { Readable } from "node:stream";
import { createHash, createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config as routeConfig } from "../api/di-demo.js";
import {
  createDiDemoHandler,
  type DiDemoDependencies,
  type DiDemoResponse,
} from "../api/_lib/di-demo-proxy.js";

const OFFICIAL_URL = "https://gestaltview-ai-v3.vercel.app/api/di-demo";
const SIGNING_SECRET = "synthetic-signing-secret-v1";
const VISITOR_SECRET = "synthetic-visitor-secret-v1";
const IP = "198.51.100.29";
const REQUEST_ID = Buffer.alloc(32, 0x42).toString("base64url");
const BASE_ENV: NodeJS.ProcessEnv = {
  DI_DEMO_ENABLED: "true",
  GESTALTVIEW_RUNTIME_API_BASE: "https://gestaltview-ai-v3.vercel.app",
  DI_DEMO_SERVICE_SIGNING_SECRET: SIGNING_SECRET,
  DI_DEMO_VISITOR_HMAC_SECRET: VISITOR_SECRET,
};

class CaptureResponse implements DiDemoResponse {
  statusCode = 200;
  headers = new Map<string, string>();
  body = "";
  setHeader(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }
  end(body?: string): void {
    this.body = body ?? "";
  }
  json(): unknown {
    return JSON.parse(this.body);
  }
}

function request(
  body: string | Buffer,
  overrides: {
    method?: string;
    headers?: Record<string, string | string[] | undefined>;
    rawHeaders?: string[];
    url?: string;
  } = {},
) {
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body, "utf8");
  const readable = Readable.from([bytes]);
  const headers = {
    "content-type": "application/json",
    "content-length": String(bytes.byteLength),
    "x-vercel-forwarded-for": IP,
    ...overrides.headers,
  } as Record<string, string | string[] | undefined>;
  Object.assign(readable, {
    method: overrides.method ?? "POST",
    url: overrides.url ?? "/api/di-demo",
    headers,
    rawHeaders:
      overrides.rawHeaders ??
      Object.entries(headers).flatMap(([name, value]) =>
        value === undefined
          ? []
          : [name, Array.isArray(value) ? value.join(",") : value],
      ),
  });
  return readable as unknown as NodeJS.ReadableStream & {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    rawHeaders: string[];
  };
}

function body(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({ profileSlug: "the-weaver", message: "Hello DI.", ...overrides });
}

function deps(
  fetcher: typeof fetch = vi.fn(async () => Response.json({ answer: "Synthetic answer." })),
  extra: Partial<DiDemoDependencies> = {},
): DiDemoDependencies {
  return {
    env: { ...BASE_ENV },
    fetch: fetcher,
    now: () => 1_792_612_800_000,
    randomBytes: (size) => Buffer.alloc(size, 0x42),
    ...extra,
  };
}

async function call(
  input: string | Buffer = body(),
  dependencies: DiDemoDependencies = deps(),
  overrides: Parameters<typeof request>[1] = {},
) {
  const response = new CaptureResponse();
  await createDiDemoHandler(dependencies)(request(input, overrides) as never, response);
  return response;
}

afterEach(() => vi.restoreAllMocks());

describe("Services DI demo proxy", () => {
  it("declares raw body parsing disabled for the Vercel Node route", () => {
    expect(routeConfig).toEqual({ api: { bodyParser: false } });
  });

  it("forwards one fixed Runtime request with an independently verifiable exact-body signature", async () => {
    const transport = vi.fn<typeof fetch>(async () => Response.json({ answer: "Synthetic answer." }));
    const response = await call(body(), deps(transport));
    expect(response.statusCode).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.json()).toEqual({ answer: "Synthetic answer." });
    expect(transport).toHaveBeenCalledTimes(1);
    const [url, options] = transport.mock.calls[0]!;
    expect(url).toBe(OFFICIAL_URL);
    expect(options?.method).toBe("POST");
    expect(options?.redirect).toBe("error");
    const rawBody = String(options?.body);
    const signed = JSON.parse(rawBody) as Record<string, string>;
    expect(Object.keys(signed).sort()).toEqual(["message", "profileSlug", "requestId", "visitorDigest"].sort());
    expect(signed.requestId).toBe(REQUEST_ID);
    expect(signed.visitorDigest).toBe(createHmac("sha256", VISITOR_SECRET).update(`gestaltview-di-demo-visitor-v1\n${IP}`, "utf8").digest("hex"));
    expect(rawBody).not.toContain(IP);
    const headers = new Headers(options?.headers);
    expect(headers.get("x-di-demo-key-id")).toBe("v1");
    expect(headers.get("x-di-demo-timestamp")).toBe("1792612800");
    expect(headers.get("x-di-demo-request-id")).toBe(REQUEST_ID);
    const bodyHash = createHash("sha256").update(Buffer.from(rawBody, "utf8")).digest("hex");
    const canonical = `POST\n/api/di-demo\ngestaltview-di-demo-v1\nv1\n1792612800\n${REQUEST_ID}\n${bodyHash}`;
    const independentSignature = createHmac("sha256", SIGNING_SECRET).update(canonical, "utf8").digest("base64url");
    expect(headers.get("x-di-demo-signature")).toBe(independentSignature);
    expect(independentSignature).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("independently recomputes the published synthetic Runtime signature fixture", () => {
    const rawBody = Buffer.from('{"profileSlug":"the-weaver","message":"Synthetic contract check.","visitorDigest":"1111111111111111111111111111111111111111111111111111111111111111","requestId":"QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI"}', "utf8");
    const bodyHash = createHash("sha256").update(rawBody).digest("hex");
    expect(bodyHash).toBe("6ff8aa2aeee70577f7c88db095f24602671975edb61e52bc42ae6735d42f8066");
    const canonical = `POST\n/api/di-demo\ngestaltview-di-demo-v1\nv1\n1792612800\nQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI\n${bodyHash}`;
    expect(createHmac("sha256", "synthetic-signing-secret-v1").update(canonical, "utf8").digest("base64url")).toBe("7_k0o09HwoiUKWJp9apSH4G0iaXDrjyYPCTVWKC-hEk");
  });

  it.each([
    ["missing flag", { ...BASE_ENV, DI_DEMO_ENABLED: undefined }],
    ["false flag", { ...BASE_ENV, DI_DEMO_ENABLED: "false" }],
    ["missing signing secret", { ...BASE_ENV, DI_DEMO_SERVICE_SIGNING_SECRET: undefined }],
    ["missing visitor secret", { ...BASE_ENV, DI_DEMO_VISITOR_HMAC_SECRET: undefined }],
    ["missing Runtime base", { ...BASE_ENV, GESTALTVIEW_RUNTIME_API_BASE: undefined }],
    ["same visitor and signing secret", { ...BASE_ENV, DI_DEMO_VISITOR_HMAC_SECRET: SIGNING_SECRET }],
  ])("fails closed for %s without calling Runtime", async (_label, env) => {
    const transport = vi.fn(async () => Response.json({ answer: "should not occur" }));
    const response = await call(body(), deps(transport, { env }));
    expect(response.statusCode).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.json()).toEqual({ error: "unavailable" });
    expect(transport).not.toHaveBeenCalled();
  });

  it.each([
    ["non-POST method", { method: "GET" }, 405],
    ["extra browser key", {}, 400],
    ["unknown profile", {}, 400],
    ["empty message", {}, 400],
    ["malformed JSON", {}, 400],
    ["non-JSON content type", { headers: { "content-type": "text/plain" } }, 400],
    ["duplicate content type", { rawHeaders: ["content-type", "application/json", "Content-Type", "application/json", "content-length", "2", "x-vercel-forwarded-for", IP] }, 400],
    ["multiple trusted IPs", { headers: { "x-vercel-forwarded-for": `${IP}, 203.0.113.7` } }, 400],
    ["invalid trusted IP", { headers: { "x-vercel-forwarded-for": "not-an-ip" } }, 400],
    ["duplicate trusted IP header", { rawHeaders: ["content-type", "application/json", "content-length", "2", "x-vercel-forwarded-for", IP, "X-Vercel-Forwarded-For", IP] }, 400],
  ] as const)("rejects %s before networking", async (label, override, expectedStatus) => {
    const transport = vi.fn(async () => Response.json({ answer: "should not occur" }));
    const invalid = label === "extra browser key" ? body({ other: "x" })
      : label === "unknown profile" ? body({ profileSlug: "weaver" })
      : label === "empty message" ? body({ message: "" })
      : label === "malformed JSON" ? "{" : body();
    const response = await call(invalid, deps(transport), override as Parameters<typeof request>[1]);
    expect(response.statusCode).toBe(expectedStatus);
    expect(response.headers.get("cache-control")).toBe("no-store");
    if (expectedStatus === 405) expect(response.headers.get("allow")).toBe("POST");
    expect(response.json()).toEqual({ error: "invalid_request" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("uses no forwarding fallback and accepts only one valid trusted client address", async () => {
    for (const headers of [
      { "x-vercel-forwarded-for": undefined, "x-forwarded-for": IP },
      { "x-vercel-forwarded-for": undefined, forwarded: `for=${IP}` },
      { "x-vercel-forwarded-for": "198.51.100.1:1234" },
      { "x-vercel-forwarded-for": ` ${IP}` },
    ]) {
      const transport = vi.fn(async () => Response.json({ answer: "no" }));
      const response = await call(body({ visitorDigest: "f".repeat(64) }), deps(transport), { headers });
      expect(response.statusCode).toBe(400);
      expect(transport).not.toHaveBeenCalled();
    }
  });

  it("accepts exactly 1,200 Unicode code points and preserves the original message", async () => {
    const message = "🧠".repeat(1200);
    const transport = vi.fn<typeof fetch>(async () => Response.json({ answer: "ok" }));
    const response = await call(body({ message }), deps(transport));
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(String(transport.mock.calls[0]?.[1]?.body)).message).toBe(message);
  });

  it("rejects 1,201 Unicode code points without trimming or truncating", async () => {
    const transport = vi.fn(async () => Response.json({ answer: "no" }));
    const response = await call(body({ message: "🧠".repeat(1201) }), deps(transport));
    expect(response.statusCode).toBe(400);
    expect(transport).not.toHaveBeenCalled();
  });

  it("rejects duplicate browser JSON fields, including escaped duplicate names", async () => {
    const transport = vi.fn(async () => Response.json({ answer: "no" }));
    for (const raw of [
      '{"profileSlug":"the-weaver","message":"first","message":"second"}',
      '{"profileSlug":"the-weaver","message":"first","mess\\u0061ge":"second"}',
    ]) {
      const response = await call(raw, deps(transport));
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: "invalid_request" });
    }
    expect(transport).not.toHaveBeenCalled();
  });

  it("rejects a raw body over 8 KiB and a deceptive Content-Length", async () => {
    const transport = vi.fn(async () => Response.json({ answer: "no" }));
    const over = await call(Buffer.alloc(8193, 0x20), deps(transport));
    expect(over.statusCode).toBe(413);
    expect(transport).not.toHaveBeenCalled();
    const bytes = Buffer.from(body(), "utf8");
    const deceptive = await call(bytes, deps(transport), { headers: { "content-length": String(bytes.length + 1) } });
    expect(deceptive.statusCode).toBe(400);
    expect(transport).not.toHaveBeenCalled();
  });

  it.each([
    "https://evil.example",
    "http://gestaltview-ai-v3.vercel.app",
    "https://user:pass@gestaltview-ai-v3.vercel.app",
    "https://gestaltview-ai-v3.vercel.app/other",
    "https://gestaltview-ai-v3.vercel.app?next=evil",
    "https://gestaltview-ai-v3.vercel.app/foo/..",
    "https://gestaltview-ai-v3.vercel.app?",
    "HTTPS://gestaltview-ai-v3.vercel.app",
  ])("rejects an arbitrary or malformed configured upstream %s", async (base) => {
    const transport = vi.fn(async () => Response.json({ answer: "no" }));
    const response = await call(body(), deps(transport, { env: { ...BASE_ENV, GESTALTVIEW_RUNTIME_API_BASE: base } }));
    expect(response.statusCode).toBe(503);
    expect(transport).not.toHaveBeenCalled();
  });

  it("does not follow upstream redirects or retry a failed request", async () => {
    const transport = vi.fn<typeof fetch>(async () => new Response(null, { status: 302, headers: { location: "https://evil.example/collect" } }));
    const response = await call(body(), deps(transport));
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ error: "unavailable" });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0]?.[1]?.redirect).toBe("error");
  });

  it("bounds timeout through upstream response handling and never retries", async () => {
    const transport = vi.fn((_url: string | URL | Request, options?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    }));
    const response = await call(body(), deps(transport as typeof fetch, { timeoutMs: 5 }));
    expect(response.statusCode).toBe(503);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("bounds a stalled upstream response body with the same single-call timeout", async () => {
    const stalled = new Response(new ReadableStream<Uint8Array>({ start() {} }), { status: 200 });
    const transport = vi.fn(async () => stalled);
    const response = await call(body(), deps(transport, { timeoutMs: 5 }));
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ error: "unavailable" });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["invalid answer shape", Response.json({ answer: "answer", debug: "leak" })],
    ["malformed upstream JSON", new Response("not json", { status: 200 })],
    ["oversized upstream response", Response.json({ answer: "x".repeat(32769) })],
    ["empty answer", Response.json({ answer: "" })],
  ])("does not relay %s", async (_label, result) => {
    const transport = vi.fn(async () => result);
    const response = await call(body(), deps(transport));
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ error: "unavailable" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("accepts a 32 KiB answer even when JSON control-character escaping expands the envelope above 64 KiB", async () => {
    const answer = "\u0001".repeat(32768);
    const upstreamBody = JSON.stringify({ answer });
    expect(Buffer.byteLength(upstreamBody, "utf8")).toBeGreaterThan(65536);
    const transport = vi.fn(async () => new Response(upstreamBody, { status: 200, headers: { "content-type": "application/json" } }));
    const response = await call(body(), deps(transport));
    expect(response.statusCode).toBe(200);
    expect((response.json() as { answer: string }).answer).toBe(answer);
  });

  it("maps quota denial to a coarse retry value and only generic error fields", async () => {
    const transport = vi.fn(async () => new Response(JSON.stringify({ error: "quota_exceeded", retryAfterSeconds: 987654, visitorDigest: "secret" }), { status: 429, headers: { "content-type": "application/json", "retry-after": "987654" } }));
    const response = await call(body(), deps(transport));
    expect(response.statusCode).toBe(429);
    expect(response.json()).toEqual({ error: "rate_limited", retryAfterSeconds: expect.any(Number) });
    const payload = response.json() as { error: string; retryAfterSeconds: number; visitorDigest?: string };
    expect(payload).not.toHaveProperty("visitorDigest");
    expect(payload.retryAfterSeconds).toBe(86400);
    expect(response.headers.get("retry-after")).toBe(String(payload.retryAfterSeconds));
  });

  it("does not emit sensitive request data to logs", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const visitorText = "private synthetic marker";
    const response = await call(body({ message: visitorText }), deps());
    expect(response.statusCode).toBe(200);
    for (const spy of [info, warn, error]) {
      expect(spy).not.toHaveBeenCalled();
      expect(JSON.stringify(spy.mock.calls)).not.toContain(visitorText);
      expect(JSON.stringify(spy.mock.calls)).not.toContain(IP);
      expect(JSON.stringify(spy.mock.calls)).not.toContain("Synthetic answer.");
    }
  });
});
