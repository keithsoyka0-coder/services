import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const origin = 'http://127.0.0.1:4179';
const cards = [
  { name: 'Standard 4-page site', price: '$2,900', href: '/website-build/', scope: 'See the website-build scope', room: 'website-build', color: '#00E5FF' },
  { name: 'DI opportunity audit', price: '$950', href: '/ai-opportunity-audit/', scope: 'See the opportunity-audit scope', room: 'ai-opportunity-audit', color: '#B026FF' },
  { name: 'AI Ops Sprint, two weeks', price: '$2,500', href: '/ai-ops-sprint/', scope: 'See the sprint scope', room: 'ai-ops-sprint', color: '#00FFD4' },
  { name: 'Codebase / website audit + refresh', price: 'scoped', href: '/codebase-audit/', scope: 'See the audit-and-refresh scope', room: 'codebase-audit', color: '#0088FF' },
  { name: 'Custom software (small tool, fixed scope)', price: '$8,500–$10,000', href: '/custom-software/', scope: 'See the custom-software scope', room: 'custom-software', color: '#FF007F' },
  { name: 'DI integration (SMB, fixed scope)', price: '$9,500', href: '/ai-integration/', scope: 'See the integration scope', room: 'ai-integration', color: '#8A5CFF' },
];

const grid = '.draft-copy.draft-copy--hub > .service-grid';
const card = `${grid} > article.service-card`;
const paragraphs = '.service-card__outcome, .service-card__included, .service-card__excluded';

const rgb = (hex: string) => {
  const value = hex.replace('#', '');
  return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)})`;
};

const shadowContainsColor = (shadow: string, hex: string) => {
  const value = hex.replace('#', '');
  const expected = [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16));
  const colors = [...shadow.matchAll(/rgba?\(([^)]+)\)|color\(srgb\s+([^)]*)\)/g)];
  return colors.some(match => {
    const parts = (match[1] || match[2] || '').split(/[\s,\/]+/).filter(Boolean).slice(0, 3).map(Number);
    if (parts.length !== 3) return false;
    const actual = match[2] ? parts.map(channel => channel * 255) : parts;
    return actual.every((channel, index) => Math.abs(channel - expected[index]) <= 1);
  });
};

const roomShadowAlpha = (shadow: string, hex: string) => {
  const value = hex.replace('#', '');
  const expected = [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16));
  const colors = [...shadow.matchAll(/rgba?\(([^)]+)\)|color\(srgb\s+([^)]*)\)/g)];
  const alphas = colors.flatMap(match => {
    const raw = match[1] || match[2] || '';
    const parts = raw.split(/[\s,\/]+/).filter(Boolean).map(Number);
    const actual = match[2] ? parts.slice(0, 3).map(channel => channel * 255) : parts.slice(0, 3);
    if (actual.length !== 3 || !actual.every((channel, index) => Math.abs(channel - expected[index]) <= 1)) return [];
    const alpha = match[2] ? Number(raw.split('/')[1]?.trim().split(/\s+/)[0] ?? 1) : (parts[3] ?? 1);
    return [alpha > 1 ? alpha / 100 : alpha];
  });
  return Math.max(0, ...alphas);
};

async function contrastAndNeutrality(page: import('@playwright/test').Page) {
  return page.locator(card).evaluateAll((items, paragraphSelector) => {
    const channel = (value: number) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (r: number, g: number, b: number) =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const background = luminance(10, 16, 32);
    return items.flatMap(item => [...item.querySelectorAll<HTMLElement>(paragraphSelector)].map(element => {
      const match = getComputedStyle(element).color.match(/[\d.]+/g);
      if (!match || match.length < 3) return { text: element.textContent, contrast: 0, spread: 255 };
      const [r, g, b] = match.slice(0, 3).map(Number);
      const foreground = luminance(r, g, b);
      return {
        text: element.textContent,
        contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
        spread: Math.max(r, g, b) - Math.min(r, g, b),
      };
    }));
  }, paragraphs);
}

async function captureCardLayout(page: import('@playwright/test').Page) {
  return page.locator(card).evaluateAll(items => items.map(item => {
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    return {
      card: rect(item),
      heading: rect(item.querySelector('h3')!),
      outcome: rect(item.querySelector('.service-card__outcome')!),
      included: rect(item.querySelector('.service-card__included')!),
      excluded: rect(item.querySelector('.service-card__excluded')!),
      link: rect(item.querySelector('a.card-link')!),
    };
  }));
}

async function settleLayoutObserver(page: import('@playwright/test').Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function expectFontLayoutStable(before: Awaited<ReturnType<typeof captureCardLayout>>, after: Awaited<ReturnType<typeof captureCardLayout>>) {
  expect(after).toHaveLength(before.length);
  for (let index = 0; index < before.length; index++) {
    for (const key of Object.keys(before[index]) as (keyof typeof before[number])[]) {
      const oldBox = before[index][key];
      const newBox = after[index][key];
      for (const dimension of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(newBox[dimension] - oldBox[dimension]), `font changed card ${index} ${key}.${dimension}`).toBeLessThanOrEqual(1);
      }
    }
  }
}

function stripGlassSupportsBlock(css: string) {
  const start = css.search(/@supports\s*\(\(\s*backdrop-filter\s*:\s*blur\(24px\)\s*\)\s*or\s*\(\s*-webkit-backdrop-filter\s*:\s*blur\(24px\)\s*\)\s*\)\s*\{/i);
  if (start < 0) return { css, removed: false };
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < css.length; index++) {
    if (css[index] === '{') depth++;
    if (css[index] === '}' && --depth === 0) return { css: `${css.slice(0, start)}${css.slice(index + 1)}`, removed: true };
  }
  throw new Error('Unclosed @supports glass block in served CSS');
}

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

  for (const [width, height, columns] of [[1200, 900, 3], [901, 900, 3], [900, 900, 2], [768, 1024, 2], [641, 900, 2], [640, 900, 1], [375, 812, 1]] as const) {
    await page.setViewportSize({ width, height });
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
    getComputedStyle(element.closest('article.service-card')!).boxShadow,
  )).not.toBe('none');
  const outlineFits = await firstLink.evaluate(element => {
    const link = element.getBoundingClientRect();
    const containingCard = element.closest('article.service-card')!;
    const bounds = containingCard.getBoundingClientRect();
    const style = getComputedStyle(element);
    const expansion = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset || '0');
    return link.left - expansion >= bounds.left && link.top - expansion >= bounds.top &&
      link.right + expansion <= bounds.right && link.bottom + expansion <= bounds.bottom;
  });
  expect(outlineFits, 'keyboard focus outline should remain within the card padding').toBe(true);
});

test('hub cards use their exact room colors, fixed glass geometry and stateful room glows', async ({ page }) => {
  await page.goto('/');
  const atmosphere = await page.evaluate(() => ({
    obsidian: getComputedStyle(document.documentElement).getPropertyValue('--atmosphere-obsidian').trim().toLowerCase(),
    navy: getComputedStyle(document.documentElement).getPropertyValue('--atmosphere-navy').trim().toLowerCase(),
    gradient: getComputedStyle(document.body).backgroundImage,
  }));
  expect(atmosphere.obsidian).toBe('#05070b');
  expect(atmosphere.navy).toBe('#0a1020');
  expect(atmosphere.gradient).toContain('linear-gradient');
  expect(atmosphere.gradient).toContain('rgb(5, 7, 11)');
  expect(atmosphere.gradient).toContain('rgb(10, 16, 32)');
  for (const [index, expected] of cards.entries()) {
    const item = page.locator(card).nth(index);
    const baseline = await item.evaluate(element => {
      const style = getComputedStyle(element);
      const edge = getComputedStyle(element, '::before');
      return {
        roomGlow: style.getPropertyValue('--room-glow').trim().toLowerCase(),
        border: style.borderColor,
        borderWidth: style.borderTopWidth,
        radius: style.borderTopLeftRadius,
        blur: style.backdropFilter,
        edgeColor: edge.backgroundColor,
        edgeOpacity: Number(edge.opacity),
        edgeContent: edge.content,
        edgeWidth: edge.width,
        edgeHeight: edge.height,
        shadow: style.boxShadow,
      };
    });
    expect(baseline.roomGlow, expected.room).toBe(expected.color.toLowerCase());
    expect(baseline.border).toBe('rgba(255, 255, 255, 0.1)');
    expect(baseline.borderWidth).toBe('1px');
    expect(baseline.radius).toBe('16px');
    expect(baseline.blur).toBe('blur(24px)');
    expect(baseline.edgeColor, expected.room).toBe(rgb(expected.color));
    expect(baseline.edgeOpacity, expected.room).toBeGreaterThan(0);
    expect(baseline.edgeContent).not.toBe('none');
    expect(parseFloat(baseline.edgeWidth)).toBeGreaterThan(0);
    expect(parseFloat(baseline.edgeHeight)).toBeGreaterThan(0);
    expect(roomShadowAlpha(baseline.shadow, expected.color), `${expected.room} base shadow should use its room color`).toBeGreaterThan(0);

    await item.hover();
    await expect.poll(() => item.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBe(-4);
    const hover = await item.evaluate(element => ({
      border: getComputedStyle(element).borderTopColor,
      shadow: getComputedStyle(element).boxShadow,
      edgeOpacity: Number(getComputedStyle(element, '::before').opacity),
      transform: new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
    }));
    expect(hover.border).toBe(baseline.border);
    expect(hover.shadow, `${expected.room} hover glow should change`).not.toBe(baseline.shadow);
    expect(shadowContainsColor(hover.shadow, expected.color), `${expected.room} hover shadow must use its own color`).toBe(true);
    expect(roomShadowAlpha(hover.shadow, expected.color), `${expected.room} hover glow should strengthen`).toBeGreaterThan(roomShadowAlpha(baseline.shadow, expected.color));
    expect(hover.edgeOpacity).toBeGreaterThan(baseline.edgeOpacity);
    expect(hover.transform).toBeCloseTo(-4, 1);

    await page.mouse.move(0, 0);
    await item.locator('a.card-link').focus();
    await expect.poll(() => item.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe(baseline.shadow);
    await expect.poll(() => item.evaluate(element => Number(getComputedStyle(element, '::before').opacity))).toBeGreaterThan(baseline.edgeOpacity);
    const focus = await item.evaluate(element => ({
      border: getComputedStyle(element).borderTopColor,
      shadow: getComputedStyle(element).boxShadow,
      edgeOpacity: Number(getComputedStyle(element, '::before').opacity),
    }));
    expect(focus.border).toBe(baseline.border);
    expect(focus.shadow, `${expected.room} focus glow should change`).not.toBe(baseline.shadow);
    expect(shadowContainsColor(focus.shadow, expected.color), `${expected.room} focus shadow must use its own color`).toBe(true);
    expect(roomShadowAlpha(focus.shadow, expected.color), `${expected.room} focus glow should strengthen`).toBeGreaterThan(roomShadowAlpha(baseline.shadow, expected.color));
    expect(focus.edgeOpacity).toBeGreaterThan(baseline.edgeOpacity);
  }
});

test('card paragraphs remain neutral and at least 4.5:1 against conservative navy in rest, hover and focus', async ({ page }) => {
  await page.goto('/');
  const assertParagraphs = async (state: string) => {
    const values = await contrastAndNeutrality(page);
    expect(values.length, `${state}: all card offer paragraphs are checked`).toBeGreaterThan(0);
    for (const value of values) {
      expect(value.spread, `${state}: paragraph text should remain neutral: ${value.text}`).toBeLessThanOrEqual(10);
      expect(value.contrast, `${state}: paragraph should reach 4.5:1: ${value.text}`).toBeGreaterThanOrEqual(4.5);
    }
  };
  await assertParagraphs('rest');
  await page.locator(card).first().hover();
  await assertParagraphs('hover');
  await page.mouse.move(0, 0);
  await page.locator(card).last().locator('a.card-link').focus();
  await assertParagraphs('focus');
});

test('hover lift is suppressed for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const firstCard = page.locator(card).first();
  await firstCard.hover();
  expect(await firstCard.evaluate(element => getComputedStyle(element).transform)).toBe('none');
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`room glows survive without color-mix support (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    let removedMixShadows = 0;
    await page.route('**/*', async route => {
      if (route.request().resourceType() !== 'stylesheet') return route.continue();
      const response = await route.fetch();
      // Simulate a parser that rejects color-mix shadow declarations. Keep
      // backdrop-filter enabled: these capabilities must be independent.
      const css = (await response.text()).replace(/box-shadow\s*:[^;{}]*color-mix\([^;{}]*(?:;|(?=\}))/gi, () => {
        removedMixShadows++;
        return '';
      });
      return route.fulfill({ response, body: css });
    });
    await page.goto('/');
    expect(removedMixShadows).toBeGreaterThan(0);
    for (const [index, expected] of cards.entries()) {
      const item = page.locator(card).nth(index);
      const shadowAlpha = async () => roomShadowAlpha(
        await item.evaluate(element => getComputedStyle(element).boxShadow), expected.color,
      );
      expect(await item.evaluate(element => getComputedStyle(element).backdropFilter)).toBe('blur(24px)');
      await expect.poll(shadowAlpha, `${expected.room} fallback rest glow`).toBeCloseTo(0.12, 2);
      await item.hover();
      await expect.poll(shadowAlpha, `${expected.room} fallback hover glow`).toBeCloseTo(0.25, 2);
      await page.mouse.move(0, 0);
      await item.locator('a.card-link').focus();
      await expect.poll(shadowAlpha, `${expected.room} fallback keyboard glow`).toBeCloseTo(0.25, 2);
      expect(await item.locator('a.card-link').evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
      if (reducedMotion === 'reduce') {
        expect(await item.evaluate(element => getComputedStyle(element).transform)).toBe('none');
      }
      await item.locator('a.card-link').blur();
    }
  });
}

test('card copy stays readable when backdrop blur is unavailable', async ({ page }) => {
  let removedGlassBlock = false;
  await page.route('**/*', async route => {
    if (route.request().resourceType() !== 'stylesheet') return route.continue();
    const response = await route.fetch();
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('css')) return route.fulfill({ response });
    const result = stripGlassSupportsBlock(await response.text());
    if (result.removed) removedGlassBlock = true;
    return route.fulfill({ response, body: result.css });
  });
  await page.goto('/');
  expect(removedGlassBlock, 'the served stylesheet should contain the progressive-enhancement glass block').toBe(true);
  const firstCard = page.locator(card).first();

  expect(await firstCard.evaluate(element => getComputedStyle(element).backdropFilter)).toBe('none');
  await expect(firstCard.locator('h3')).toBeVisible();
  await expect(firstCard.locator('.service-card__outcome')).toBeVisible();
  await expect(firstCard.locator('.service-card__included')).toBeVisible();
  await expect(firstCard.locator('.service-card__excluded')).toBeVisible();
  await expect(firstCard.locator('a.card-link')).toBeVisible();
  const fallbackAlpha = await firstCard.evaluate(element => {
    const match = getComputedStyle(element).backgroundColor.match(/[\d.]+/g);
    return match?.length === 4 ? Number(match[3]) : 1;
  });
  expect(fallbackAlpha, 'glass-off fallback should have an opaque background').toBeGreaterThanOrEqual(0.95);
});

test('offline hub makes no third-party requests', async ({ page }) => {
  const requestedOrigins = new Set<string>();
  page.on('request', request => requestedOrigins.add(new URL(request.url()).origin));
  await page.goto('/');
  await expect(page.locator(card)).toHaveCount(6);
  expect([...requestedOrigins].filter(requestOrigin => requestOrigin !== origin)).toEqual([]);
});

test('optional Geist font succeeds cold and warm without font-induced layout shift; blocked font stays readable', async ({ page, browser }, testInfo) => {
  const evidence: Record<string, unknown> = {};
  const fontPath = '/fonts/Geist.woff2';
  const requestUrls: string[] = [];
  const fontResponses: number[] = [];
  page.on('request', request => requestUrls.push(request.url()));
  page.on('response', response => {
    if (new URL(response.url()).pathname === fontPath) fontResponses.push(response.status());
  });
  await page.addInitScript(() => {
    (window as any).__serviceCardLayoutShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[]) {
        if (!entry.hadRecentInput) (window as any).__serviceCardLayoutShifts.push(entry.value || 0);
      }
    }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
  });

  let releaseColdFont!: () => void;
  let coldFontWasRequested = false;
  const coldFontGate = new Promise<void>(resolve => { releaseColdFont = resolve; });
  await page.route(`**${fontPath}`, async route => {
    coldFontWasRequested = true;
    await coldFontGate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator(card)).toHaveCount(6);
  await expect.poll(() => coldFontWasRequested).toBe(true);
  const coldBefore = await captureCardLayout(page);
  const coldClsBefore = await page.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
  releaseColdFont();
  await page.waitForResponse(response => new URL(response.url()).pathname === fontPath && response.status() === 200);
  await page.evaluate(() => document.fonts.ready);
  await settleLayoutObserver(page);
  const coldAfter = await captureCardLayout(page);
  await expectFontLayoutStable(coldBefore, coldAfter);
  const coldClsAfter = await page.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
  expect(coldClsAfter - coldClsBefore, 'cold font load should not add layout shift').toBeLessThanOrEqual(0.01);
  expect(requestUrls.some(url => new URL(url).pathname === fontPath)).toBe(true);
  expect(fontResponses).toContain(200);
  const loadedFaces = await page.evaluate(async () => {
    const faces = await document.fonts.load('400 16px "Geist"');
    return faces.map(face => ({ family: face.family, status: face.status }));
  });
  expect(loadedFaces).toEqual([{ family: 'Geist', status: 'loaded' }]);
  expect(await page.evaluate(() => document.fonts.check('400 16px "Geist"'))).toBe(true);
  evidence.loadedFaces = loadedFaces;
  evidence.cold = { before: coldBefore, after: coldAfter, clsBefore: coldClsBefore, clsAfter: coldClsAfter, statuses: fontResponses };

  const warmContext = await browser.newContext();
  try {
    const warmPage = await warmContext.newPage();
    const warmOrigins = new Set<string>();
    const warmFontStatuses: number[] = [];
    await warmPage.addInitScript(() => {
      (window as any).__serviceCardLayoutShifts = [];
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[]) {
          if (!entry.hadRecentInput) (window as any).__serviceCardLayoutShifts.push(entry.value || 0);
        }
      }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
    });
    warmPage.on('request', request => warmOrigins.add(new URL(request.url()).origin));
    warmPage.on('response', response => {
      if (new URL(response.url()).pathname === fontPath) warmFontStatuses.push(response.status());
    });
    await warmPage.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(warmPage.locator(card)).toHaveCount(6);
    const firstLoadBefore = await captureCardLayout(warmPage);
    const firstLoadClsBefore = await warmPage.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
    await warmPage.evaluate(() => document.fonts.ready);
    await settleLayoutObserver(warmPage);
    const firstLoadAfter = await captureCardLayout(warmPage);
    await expectFontLayoutStable(firstLoadBefore, firstLoadAfter);
    const firstLoadClsAfter = await warmPage.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
    expect(firstLoadClsAfter - firstLoadClsBefore, 'unrouted first font load should not add layout shift').toBeLessThanOrEqual(0.01);
    expect(warmFontStatuses).toContain(200);

    await warmPage.reload({ waitUntil: 'domcontentloaded' });
    const warmBefore = await captureCardLayout(warmPage);
    const warmClsBefore = await warmPage.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
    await warmPage.evaluate(() => document.fonts.ready);
    await settleLayoutObserver(warmPage);
    const warmAfter = await captureCardLayout(warmPage);
    await expectFontLayoutStable(warmBefore, warmAfter);
    const warmClsAfter = await warmPage.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
    expect(warmClsAfter - warmClsBefore, 'warm cached font should not add layout shift').toBeLessThanOrEqual(0.01);
    const warmFontTransfer = await warmPage.evaluate((path: string) => {
      const entry = performance.getEntriesByType('resource').filter(item => new URL(item.name).pathname === path).at(-1) as PerformanceResourceTiming | undefined;
      return entry?.transferSize;
    }, fontPath);
    const cdp = await warmContext.newCDPSession(warmPage);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.service-card__outcome' });
    const { fonts: renderedFonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(renderedFonts.some(font => font.isCustomFont && font.familyName === 'Geist' && font.glyphCount > 0)).toBe(true);
    await cdp.detach();
    evidence.renderedWarmFonts = renderedFonts;
    evidence.warm = { before: warmBefore, after: warmAfter, clsBefore: warmClsBefore, clsAfter: warmClsAfter, transferSize: warmFontTransfer, firstLoadBefore, firstLoadAfter };
    expect(warmFontTransfer, 'second navigation should use the warm same-origin font cache').toBe(0);
    expect([...warmOrigins].filter(requestOrigin => requestOrigin !== origin)).toEqual([]);
  } finally {
    await warmContext.close();
  }

  const blockedContext = await browser.newContext();
  try {
    await blockedContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const blockedPage = await blockedContext.newPage();
    const blockedFontRequests: string[] = [];
    const blockedFontFailures: string[] = [];
    blockedPage.on('request', request => {
      if (new URL(request.url()).pathname === fontPath) blockedFontRequests.push(request.url());
    });
    blockedPage.on('requestfailed', request => {
      if (new URL(request.url()).pathname === fontPath) blockedFontFailures.push(request.url());
    });
    await blockedPage.addInitScript(() => {
      (window as any).__serviceCardLayoutShifts = [];
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[]) {
          if (!entry.hadRecentInput) (window as any).__serviceCardLayoutShifts.push(entry.value || 0);
        }
      }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
    });
    await blockedContext.route(`**${fontPath}`, route => route.abort());
    await blockedPage.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(blockedPage.locator(card)).toHaveCount(6);
    await expect.poll(() => blockedFontRequests.length).toBeGreaterThan(0);
    const blockedBefore = await captureCardLayout(blockedPage);
    const blockedClsBefore = await blockedPage.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
    await blockedPage.evaluate(() => document.fonts.ready);
    await settleLayoutObserver(blockedPage);
    const blockedAfter = await captureCardLayout(blockedPage);
    await expectFontLayoutStable(blockedBefore, blockedAfter);
    const blockedClsAfter = await blockedPage.evaluate(() => (window as any).__serviceCardLayoutShifts.reduce((sum: number, value: number) => sum + value, 0));
    expect(blockedClsAfter - blockedClsBefore, 'blocked optional font should not add layout shift').toBeLessThanOrEqual(0.01);
    evidence.blocked = { before: blockedBefore, after: blockedAfter, clsBefore: blockedClsBefore, clsAfter: blockedClsAfter, failures: blockedFontFailures.length };
    expect(blockedFontFailures.length).toBeGreaterThan(0);
    expect(await blockedPage.evaluate(() => document.fonts.check('16px Geist'))).toBe(false);
    const blockedParagraphs = await contrastAndNeutrality(blockedPage);
    expect(blockedParagraphs.length).toBeGreaterThan(0);
    for (const paragraph of blockedParagraphs) {
      expect(paragraph.contrast, `blocked font paragraph should remain readable: ${paragraph.text}`).toBeGreaterThanOrEqual(4.5);
    }
  } finally {
    await blockedContext.close();
  }
  await testInfo.attach('font-layout-observations', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
  console.log('font-layout-observations', JSON.stringify(evidence));
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

// Characterization: preserve the exact hosting policy; no exception for local fonts.
test('local Geist loads under the unchanged self-only CSP without violations', async ({ page }) => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const policy = config.headers[0].headers.find((item: { key: string }) => item.key === 'Content-Security-Policy').value;
  await page.route('**/*', async route => {
    if (route.request().resourceType() !== 'document') return route.fallback();
    const response = await route.fetch();
    return route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': policy } });
  });
  await page.addInitScript(() => {
    (window as any).__policyViolations = [];
    document.addEventListener('securitypolicyviolation', event => (window as any).__policyViolations.push(event.violatedDirective));
  });
  const fontResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/fonts/Geist.woff2');
  const response = await page.goto('/');
  expect(response?.headers()['content-security-policy']).toBe(policy);
  expect((await fontResponse).status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(card)).toHaveCount(6);
  expect(await page.evaluate(() => (window as any).__policyViolations)).toEqual([]);
});
