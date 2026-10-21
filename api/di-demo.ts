import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createDiDemoHandler } from "./_lib/di-demo-proxy.js";

export const config = { api: { bodyParser: false } };

const handler = createDiDemoHandler();

export default async function diDemoRoute(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  await handler(request, response);
}
