import { expect, test } from '@playwright/test';

const origin = 'http://127.0.0.1:4179';
const cards = [
  { name: 'Standard 4-page site', price: '$2,900', href: '/website-build/', scope: 'See the website-build scope' },
  { name: 'DI opportunity audit', price: '$950', href: '/ai-opportunity-audit/', scope: 'See the opportunity-audit scope' },
  { name: 'AI Ops Sprint, two weeks', price: '$2,500', href: '/ai-ops-sprint/', scope: 'See the sprint scope' },
  { name: 'Codebase / website audit + refresh', price: 'scoped', href: '/codebase-audit/', scope: 'See the audit-and-refresh scope' },
  { name: 'Custom software (small tool, fixed scope)', price: '$8,500–$10,000', href: '/custom-software/', scope: 'See the custom-software scope' },
  { name: 'DI integration (SMB, fixed scope)', price: '$9,500', href: '/ai-integration/', scope: 'See the integration scope' },
];

const grid = '.draft-copy.draft-copy--hub > .service-grid';
const card = `${grid} > article.service-card`;

// Match the existing offline browser-test policy: same-origin resources only.
test.beforeEach(async ({ context }) => {
  await context.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== origin) return route.abort();
    return route.continue();
  });
});

test('hub renders six complete, named cards with the approved source details', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator(grid)).toHaveCount(1);
  await expect(page.locator(card)).toHaveCount(6);
  for (const [index, expected] of cards.entries()) {
    const item = page.locator(card).nth(index);
    await expect(item).toHaveAttribute('aria-labelledby', new RegExp('\\S+'));
    await expect(item.locator('h3')).toHaveText(expected.name);
    await expect(item.locator('.price')).toHaveText(expected.price);
    await expect(item.locator('.service-card__outcome')).toBeVisible();
    await expect(item.locator('.service-card__included')).toContainText('Included:');
    await expect(item.locator('.service-card__excluded')).toContainText('Not included:');
    await expect(item.locator('a')).toHaveCount(1);
    await expect(item.locator('a.card-link')).toHaveText(expected.scope);
    await expect(item.locator('a.card-link')).toHaveAttribute('href', expected.href);
    await expect(item.locator('h3')).toHaveAttribute('id', /\S+/);
    const headingId = await item.getAttribute('aria-labelledby');
    expect(await item.locator('h3').getAttribute('id')).toBe(headingId);
  }
});

test('card grid columns follow the desktop, tablet and mobile boundaries without horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/');

  for (const [width, columns] of [[1200, 3], [901, 3], [900, 2], [768, 2], [641, 2], [640, 1], [375, 1]] as const) {
    await page.setViewportSize({ width, height: 900 });
    const actualColumns = await page.locator(grid).evaluate(element =>
      getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
    );
    expect(actualColumns, `expected ${columns} columns at ${width}px`).toBe(columns);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `expected no horizontal overflow at ${width}px`).toBe(true);
    await expect(page.locator(card)).toHaveCount(6);
    for (const item of await page.locator(card).all()) {
      await expect(item).toBeVisible();
      await expect(item.locator('.service-card__outcome')).toBeVisible();
      await expect(item.locator('.service-card__included')).toBeVisible();
      await expect(item.locator('.service-card__excluded')).toBeVisible();
      await expect(item.locator('a.card-link')).toBeVisible();
    }
    if ([1200, 768, 375].includes(width)) {
      const screenshot = testInfo.outputPath(`service-cards-${width}.png`);
      await page.locator(grid).screenshot({
        path: screenshot, animations: 'disabled',
        // Capture the grid, not the sticky navigation drawn over its top edge.
        style: '.site-header, .draft-banner { visibility: hidden !important; }',
      });
      await testInfo.attach(`service-cards-${width}`, { path: screenshot, contentType: 'image/png' });
    }
  }
});

test('scope links support keyboard traversal and emphasize the containing card on focus', async ({ page }) => {
  await page.goto('/');
  const firstLink = page.locator(card).nth(0).locator('a.card-link');
  const secondLink = page.locator(card).nth(1).locator('a.card-link');

  await firstLink.focus();
  await page.keyboard.press('Tab');
  await expect(secondLink).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toBeVisible();

  const focusStyles = await firstLink.evaluate(element => ({
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineWidth: getComputedStyle(element).outlineWidth,
  }));
  expect(focusStyles.outlineStyle).not.toBe('none');
  expect(parseFloat(focusStyles.outlineWidth)).toBeGreaterThan(0);
  await expect.poll(() => firstLink.evaluate(element =>
    getComputedStyle(element.closest('article.service-card')!).borderTopColor,
  )).toBe('rgba(63, 245, 216, 0.48)');
});

test('hover lift is suppressed for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const firstCard = page.locator(card).first();
  await firstCard.hover();
  expect(await firstCard.evaluate(element => getComputedStyle(element).transform)).toBe('none');
});

test('card copy stays readable when backdrop blur is unavailable', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: `${card} { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }` });
  const firstCard = page.locator(card).first();

  expect(await firstCard.evaluate(element => getComputedStyle(element).backdropFilter)).toBe('none');
  await expect(firstCard.locator('h3')).toBeVisible();
  await expect(firstCard.locator('.service-card__outcome')).toBeVisible();
  await expect(firstCard.locator('.service-card__included')).toBeVisible();
  await expect(firstCard.locator('.service-card__excluded')).toBeVisible();
  await expect(firstCard.locator('a.card-link')).toBeVisible();
  expect(await firstCard.evaluate(element => getComputedStyle(element).backgroundImage)).not.toBe('none');
});

test('all six complete cards and disclosure fields are present with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(origin);
    await expect(page.locator(card)).toHaveCount(6);
    for (const expected of cards) {
      const item = page.locator(card).filter({ has: page.getByRole('heading', { name: expected.name, exact: true }) });
      await expect(item).toHaveCount(1);
      await expect(item.locator('.price')).toHaveText(expected.price);
      await expect(item.locator('.service-card__outcome')).toBeVisible();
      await expect(item.locator('.service-card__included')).toContainText('Included:');
      await expect(item.locator('.service-card__excluded')).toContainText('Not included:');
      await expect(item.locator('a')).toHaveCount(1);
      await expect(item.locator('a.card-link')).toHaveText(expected.scope);
      await expect(item.locator('a.card-link')).toHaveAttribute('href', expected.href);
    }
  } finally {
    await context.close();
  }
});
