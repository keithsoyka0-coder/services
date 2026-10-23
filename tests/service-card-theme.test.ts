import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { serviceCardTheme } from '../src/service-card-theme';

const expectedRooms = {
  'website-build': '#00E5FF',
  'ai-opportunity-audit': '#B026FF',
  'ai-ops-sprint': '#00FFD4',
  'codebase-audit': '#0088FF',
  'custom-software': '#FF007F',
  'ai-integration': '#8A5CFF',
};
const css = readFileSync('src/styles.css', 'utf8');
const scope = '.draft-copy.draft-copy--hub>.service-grid>.service-card';

describe('presentation-only room identities', () => {
  it('defines exactly the six existing stable IDs', () => {
    expect(Object.keys(serviceCardTheme)).toEqual(Object.keys(expectedRooms));
  });
  it.each(Object.entries(expectedRooms))('assigns %s its exact approved glow', (id, color) => {
    expect(serviceCardTheme[id as keyof typeof serviceCardTheme]).toBe(color);
  });
  it.each(Object.entries(serviceCardTheme))('applies the matching %s token only to hub cards', (id, color) => {
    const channels = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16)).join(',');
    expect(css).toContain(`${scope}[data-room="${id}"]{--room-glow:${color};--room-glow-rgb:${channels}}`);
  });
  it('guards every color-mix shadow independently of backdrop-filter support', () => {
    const enhancement = css.match(/@supports\s*\(color:\s*color-mix\(in srgb,\s*white,\s*transparent\)\)\s*\{([\s\S]*?)\n\}/);
    expect(enhancement, 'color-mix needs its own feature query').not.toBeNull();
    const guarded = enhancement?.[1] ?? '';
    expect(guarded).toContain(`${scope}{box-shadow:`);
    expect(guarded).toContain(`${scope}:hover,${scope}:focus-within{box-shadow:`);
    expect(css.replace(enhancement?.[0] ?? '', '')).not.toContain('color-mix(');
  });
  it('uses dedicated exact base tokens without changing the shared button foreground', () => {
    expect(css).toContain('--atmosphere-obsidian:#05070B');
    expect(css).toContain('--atmosphere-navy:#0A1020');
    expect(css).toContain('linear-gradient(145deg,var(--atmosphere-obsidian),var(--atmosphere-navy))');
    expect(css).toContain('--bg:#06060c;');
  });
  it('ships optional self-hosted variable Geist with its redistribution license', () => {
    expect(css).toMatch(/@font-face\s*\{[^}]*font-family:\s*["']Geist["'][^}]*src:\s*url\(["']\/fonts\/Geist\.woff2["']\)[^}]*font-weight:\s*100 900[^}]*font-display:\s*optional/s);
    expect(css).toContain('--font:"Geist",');
    expect(existsSync('public/fonts/Geist.woff2')).toBe(true);
    expect(existsSync('public/fonts/OFL.txt')).toBe(true);
    if (existsSync('public/fonts/Geist.woff2')) {
      expect(readFileSync('public/fonts/Geist.woff2').subarray(0, 4).toString()).toBe('wOF2');
      expect(readFileSync('public/fonts/OFL.txt', 'utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1');
    }
    expect(css).not.toMatch(/@import|https?:\/\/.*(?:fonts|\.css)/i);
  });
  it('provides measured fallback metrics and opaque hub glass before blur support', () => {
    expect(css).toContain('font-family:"Geist Fallback"');
    expect(css).toContain('size-adjust:108.64%');
    expect(css).toContain('ascent-override:92.50%');
    expect(css).toContain('descent-override:27.15%');
    expect(css).toContain('line-gap-override:0%');
    expect(css).toContain('background:#0A1020');
    expect(css).toContain('@supports ((backdrop-filter: blur(24px)) or (-webkit-backdrop-filter: blur(24px)))');
  });
});
