// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { assertLocalPreviewPolicy, assertLoopbackHost } from './scripts/local-preview-policy';

assertLocalPreviewPolicy(process.env);
const noindexHeaders = { 'X-Robots-Tag': 'noindex, nofollow' };
const localDraftGuard = {
  name: 'local-draft-preview-guard',
  configResolved(config: { mode: string; server: { host?: string | boolean }; preview: { host?: string | boolean } }) {
    if (config.mode !== 'test') {
      assertLoopbackHost(config.server.host);
      assertLoopbackHost(config.preview.host);
    }
  },
  transformIndexHtml(html: string) {
    if (/<meta\s+name=["']robots["']/i.test(html)) return html;
    return html.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
  },
};

export default defineConfig({
  plugins: [react(), localDraftGuard],
  server: {
    host: '127.0.0.1',
    allowedHosts: ['localhost', '127.0.0.1'],
    headers: noindexHeaders,
  },
  preview: {
    host: '127.0.0.1',
    allowedHosts: ['localhost', '127.0.0.1'],
    headers: noindexHeaders,
  },
  build: { sourcemap: false },
  test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], restoreMocks: true },
});
