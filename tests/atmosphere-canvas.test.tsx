import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AtmosphereCanvas } from '../src/AtmosphereCanvas';

const overriddenProperties: Array<{
  target: object;
  name: string;
  descriptor?: PropertyDescriptor;
}> = [];

function overrideProperty(target: object, name: string, value: unknown) {
  if (!overriddenProperties.some((item) => item.target === target && item.name === name)) {
    overriddenProperties.push({ target, name, descriptor: Object.getOwnPropertyDescriptor(target, name) });
  }
  Object.defineProperty(target, name, { configurable: true, value });
}

afterEach(() => {
  cleanup();
  for (const item of overriddenProperties.splice(0)) {
    if (item.descriptor) Object.defineProperty(item.target, item.name, item.descriptor);
    else Reflect.deleteProperty(item.target, item.name);
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function installMatchMedia(matches = false) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let currentMatches = matches;
  const media = {
    get matches() {
      return currentMatches;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    dispatchEvent: () => true,
    change(next: boolean) {
      currentMatches = next;
      for (const listener of listeners) listener({ matches: next } as MediaQueryListEvent);
    },
  } as unknown as MediaQueryList & { change(next: boolean): void };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
  return media;
}

function installAnimationFrame() {
  let nextId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  const request = vi.fn((callback: FrameRequestCallback) => {
    const id = ++nextId;
    callbacks.set(id, callback);
    return id;
  });
  const cancel = vi.fn((id: number) => callbacks.delete(id));
  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  return {
    request,
    cancel,
    runNext(time = 1000) {
      const item = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
      if (!item) return false;
      callbacks.delete(item[0]);
      item[1](time);
      return true;
    },
    get pending() {
      return callbacks.size;
    },
  };
}

function installCanvasContext() {
  const gradient = { addColorStop: vi.fn() };
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    createRadialGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  return context;
}

describe('AtmosphereCanvas', () => {
  it('keeps a decorative canvas in server-rendered HTML without starting animation', () => {
    const request = vi.fn();
    vi.stubGlobal('requestAnimationFrame', request);
    const html = renderToStaticMarkup(<AtmosphereCanvas />);

    expect(html).toContain('<canvas');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('tabindex=');
    expect(request).not.toHaveBeenCalled();
  });

  it('renders a hidden, non-interactive canvas and starts one low-cost frame after hydration', () => {
    installMatchMedia(false);
    const animation = installAnimationFrame();
    installCanvasContext();
    const { container } = render(<AtmosphereCanvas />);
    const canvas = container.querySelector('canvas');

    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
    expect(canvas?.getAttribute('tabindex')).toBeNull();
    expect(canvas?.classList.contains('atmosphere-canvas')).toBe(true);
    expect(document.documentElement.dataset.atmosphereReady).toBe('true');
    expect(animation.request).toHaveBeenCalledTimes(1);
    expect(animation.pending).toBe(1);
  });

  it('does not animate when reduced motion is requested', () => {
    installMatchMedia(true);
    const animation = installAnimationFrame();
    installCanvasContext();

    render(<AtmosphereCanvas />);

    expect(animation.request).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.atmosphereReady).toBe('true');
  });

  it('pauses and resumes when the reduced-motion preference changes', () => {
    const media = installMatchMedia(false);
    const animation = installAnimationFrame();
    installCanvasContext();

    render(<AtmosphereCanvas />);
    expect(animation.pending).toBe(1);

    media.change(true);
    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(animation.pending).toBe(0);

    media.change(false);
    expect(animation.request).toHaveBeenCalledTimes(2);
    expect(animation.pending).toBe(1);
  });

  it('caps pixel work, redraws on resize and pauses while the tab is hidden', () => {
    installMatchMedia(false);
    const animation = installAnimationFrame();
    const context = installCanvasContext();
    overrideProperty(window, 'innerWidth', 4000);
    overrideProperty(window, 'innerHeight', 3000);
    overrideProperty(window, 'devicePixelRatio', 3);
    overrideProperty(document, 'visibilityState', 'hidden');

    const { container } = render(<AtmosphereCanvas />);
    const canvas = container.querySelector('canvas')!;
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(2_000_000);
    expect(animation.request).not.toHaveBeenCalled();

    overrideProperty(document, 'visibilityState', 'visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(animation.request).toHaveBeenCalledTimes(1);
    expect(animation.runNext(1000)).toBe(true);
    expect(context.clearRect).toHaveBeenCalled();
    expect(animation.request).toHaveBeenCalledTimes(2);

    overrideProperty(window, 'innerWidth', 700);
    window.dispatchEvent(new Event('resize'));
    expect(canvas.style.width).toBe('700px');
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(2_000_000);

    overrideProperty(document, 'visibilityState', 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(animation.pending).toBe(0);

    overrideProperty(document, 'visibilityState', 'visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(animation.request).toHaveBeenCalledTimes(3);
    expect(animation.pending).toBe(1);
  });

  it('cancels pending animation and restores the document state on unmount', () => {
    installMatchMedia(false);
    const animation = installAnimationFrame();
    installCanvasContext();
    document.documentElement.dataset.atmosphereReady = 'prior';

    const { unmount } = render(<AtmosphereCanvas />);
    expect(animation.pending).toBe(1);
    unmount();

    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.atmosphereReady).toBe('prior');
  });

  it('falls back without animation when the canvas context is unavailable', () => {
    installMatchMedia(false);
    const animation = installAnimationFrame();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const { container } = render(<AtmosphereCanvas />);

    expect(container.querySelector('canvas')).not.toBeNull();
    expect(animation.request).not.toHaveBeenCalled();
  });
});
