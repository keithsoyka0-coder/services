import { expect, test } from '@playwright/test';

const origin = 'http://127.0.0.1:4179';
const draftMarker = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';
const approvedHeading = 'Look at the work. See how it’s put together.';
const approvedLede = 'Explore web builds, audits, custom software, and Digital Intelligence (DI) integration through written scopes, sample deliverables, and my own Portfolio and GestaltView work. Fictional samples are labeled separately. These are ways to inspect my approach—not client results.';

test.beforeEach(async ({ context }) => {
  await context.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== origin) return route.abort();
    return route.continue();
  });
});

test('hub shows only the approved copy over the decorative blue-violet-teal atmosphere', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(draftMarker, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: approvedHeading, exact: true })).toBeVisible();
  await expect(page.locator('.hero .lede')).toHaveText(approvedLede);
  expect(await page.locator('.draft-banner').evaluate(element => getComputedStyle(element).backgroundColor)).toContain('139, 92, 246');
  const canvas = page.locator('canvas.atmosphere-canvas');
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  await expect(canvas).toHaveAttribute('data-atmosphere-state', 'active');
  await expect(page.locator('html')).toHaveAttribute('data-atmosphere-ready', 'true');
  expect(await canvas.evaluate(element => getComputedStyle(element).pointerEvents)).toBe('none');
  expect(await canvas.evaluate(element => Number(getComputedStyle(element).zIndex))).toBeLessThan(1);
  expect(await page.locator('.hero').evaluate(element => getComputedStyle(element, '::before').backgroundImage)).toContain('gradient');
  expect(await page.locator('.hero').evaluate(element => getComputedStyle(element, '::before').animationName)).not.toBe('none');
  expect(await page.locator('.status-card').first().evaluate(element => getComputedStyle(element).backdropFilter)).toContain('blur');
  expect(await page.locator('#consultation fieldset').evaluate(element => getComputedStyle(element).backdropFilter)).toContain('blur');
  expect(await page.locator('#consultation .btn-primary').evaluate(element => getComputedStyle(element).color)).toBe('rgb(6, 6, 12)');
  await page.goto('/ai-integration/');
  expect(await page.locator('.di-demo-disclosure').evaluate(element => getComputedStyle(element).backdropFilter)).toContain('blur');
});

test('reduced motion keeps the canvas static and its server-rendered copy readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: approvedHeading, exact: true })).toBeVisible();
  await expect(page.locator('.hero .lede')).toHaveText(approvedLede);
  await expect(page.locator('canvas.atmosphere-canvas')).toHaveAttribute('data-atmosphere-state', 'reduced');
  expect(await page.locator('.hero').evaluate(element => getComputedStyle(element, '::before').animationName)).toBe('none');
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
});

test('the atmosphere does not introduce mobile horizontal overflow or cover controls', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: approvedHeading, exact: true })).toBeVisible();
  const canvas = page.locator('canvas.atmosphere-canvas');
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.getByRole('link', { name: /Review unresolved decisions/ }).evaluate(element => {
    const x = element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2;
    const y = element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2;
    return document.elementFromPoint(x, y)?.closest('a') === element;
  })).toBe(true);
});

test('all routes keep their text and draft banner in initial HTML without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    for (const path of ['/', '/website-build/', '/ai-opportunity-audit/', '/ai-ops-sprint/', '/codebase-audit/', '/custom-software/', '/ai-integration/']) {
      await page.goto(`${origin}${path}`);
      await expect(page.getByText(draftMarker, { exact: true })).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('canvas.atmosphere-canvas')).toHaveAttribute('aria-hidden', 'true');
    }
  } finally {
    await context.close();
  }
});
