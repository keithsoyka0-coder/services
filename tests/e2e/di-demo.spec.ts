import { expect, test, type Page } from '@playwright/test';

const origin = 'http://127.0.0.1:4179';
const marker = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';
const slugs = ['the-weaver', 'the-tailor', 'cascade-engineer', 'the-algorithm'];

test.beforeEach(async ({ context }) => {
  await context.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== origin) return route.abort();
    return route.continue();
  });
});
async function fill(page: Page) {
  const form = page.getByRole('form', { name: 'Digital Intelligence draft demo' });
  await form.getByLabel('Profile', { exact: true }).selectOption('the-weaver');
  await form.getByLabel('Message', { exact: true }).fill('Synthetic browser message.');
  return form;
}

test('integration draft includes the disclosed four-profile demo without automatic requests', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/di-demo', route => {
    calls++;
    return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Demo unavailable"}' });
  });
  const response = await page.goto('/ai-integration/');
  await expect(page.getByText(marker, { exact: true })).toBeVisible();
  await expect(page.getByRole('form', { name: 'Digital Intelligence draft demo' })).toBeVisible();
  expect(calls).toBe(0);
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  const robots = await page.locator('meta[name="robots"]').evaluateAll(tags => tags.map(tag => tag.getAttribute('content')));
  expect(robots.length).toBeGreaterThan(0);
  expect(robots.every(value => value === 'noindex, nofollow')).toBe(true);
  const values = await page.locator('#di-demo-profile option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value).filter(Boolean));
  expect(values).toEqual(slugs);
  const disclosure = page.locator('.di-demo-disclosure');
  for (const text of ['Groq', 'canonical profile', 'founder notes', 'relationships', 'wound-layer material', '30 days', 'pseudonymous', 'fixed UTC hour', 'fixed UTC day', 'not a client result', 'unavailable']) {
    await expect(disclosure).toContainText(text);
  }
  await expect(disclosure.getByRole('link')).toHaveAttribute('href', 'https://console.groq.com/docs/your-data');
  expect(await disclosure.evaluate(node => Boolean(node.compareDocumentPosition(document.querySelector('button[type="submit"]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
});

test('keyboard submit makes one same-origin request, safely displays an answer, and reload clears it', async ({ page }) => {
  const requests: { url: string; body: unknown }[] = [];
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  const hostileAnswer = '<img src=x onerror=alert(1)> Synthetic answer.';
  await page.route('**/api/di-demo', async route => {
    requests.push({ url: route.request().url(), body: route.request().postDataJSON() });
    await pending;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: hostileAnswer }) });
  });
  await page.goto('/ai-integration/');
  const form = await fill(page);
  await form.getByRole('button', { name: 'Send message', exact: true }).press('Enter');
  await expect.poll(() => requests.length).toBe(1);
  await expect(form.getByRole('button', { name: 'Sending…', exact: true })).toBeDisabled();
  release();
  await expect(page.getByLabel('Demo answer', { exact: true })).toContainText(hostileAnswer);
  expect(requests).toEqual([{ url: `${origin}/api/di-demo`, body: { profileSlug: 'the-weaver', message: 'Synthetic browser message.' } }]);
  await expect(page.locator('.di-demo-answer img')).toHaveCount(0);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await page.reload();
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Demo answer', { exact: true })).toHaveCount(0);
  expect(requests).toHaveLength(1);
});

for (const status of [400, 429, 503]) {
  test(`HTTP ${status} stays generic, without sensitive echo or retry`, async ({ page }) => {
    let calls = 0;
    await page.route('**/api/di-demo', route => {
      calls++;
      return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: 'SYNTHETIC_SENSITIVE_UPSTREAM_PAYLOAD', retryAfterSeconds: 3600 }) });
    });
    await page.goto('/ai-integration/');
    const form = await fill(page);
    await form.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(form.getByRole('status')).toContainText(status === 429 ? /limit reached/i : status === 400 ? /could not be completed/i : /unavailable/i);
    await expect(form).not.toContainText('SYNTHETIC_SENSITIVE_UPSTREAM_PAYLOAD');
    expect(calls).toBe(1);
  });
}

test('network failure is generic and never automatically retried', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/di-demo', route => { calls++; return route.abort(); });
  await page.goto('/ai-integration/');
  const form = await fill(page);
  await form.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(form.getByRole('status')).toContainText(/unavailable/i);
  expect(calls).toBe(1);
});

test('other spokes stay dormant and consultation cannot submit', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') calls.push(request.url()); });
  for (const path of ['/website-build/', '/ai-opportunity-audit/', '/ai-ops-sprint/', '/codebase-audit/', '/custom-software/']) {
    await page.goto(path);
    await expect(page.locator('[data-widget-mount]')).toHaveAttribute('data-widget-state', 'disabled');
    await expect(page.getByRole('form', { name: 'Digital Intelligence draft demo' })).toHaveCount(0);
  }
  await page.goto('/');
  await expect(page.locator('[data-widget-mount]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Consultation unavailable in this draft preview' })).toBeDisabled();
  expect(calls).toEqual([]);
});

test('initial draft HTML and disclosure remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(`${origin}/ai-integration/`);
    await expect(page.getByText(marker, { exact: true })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.di-demo-disclosure')).toContainText('Groq');
    await expect(page.getByRole('form', { name: 'Digital Intelligence draft demo' })).toBeVisible();
  } finally { await context.close(); }
});

test('long generated text stays readable within a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/api/di-demo', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'x'.repeat(1500) + '\nSecond line.' }) }));
  await page.goto('/ai-integration/');
  const form = await fill(page);
  await form.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByLabel('Demo answer', { exact: true })).toContainText('Second line.');
  expect(await page.getByLabel('Demo answer', { exact: true }).evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
