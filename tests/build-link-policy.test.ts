import { describe, expect, it } from 'vitest';
import { isApprovedExternalLink } from '../scripts/build-link-policy';

describe('exact external disclosure URL exception', () => {
  it('allows only the exact Groq policy URL', () => {
    expect(isApprovedExternalLink('https://console.groq.com/docs/your-data')).toBe(true);
  });
  it.each([
    'http://console.groq.com/docs/your-data',
    'https://console.groq.com/docs/your-data/',
    'https://console.groq.com/docs/your-data?source=demo',
    'https://console.groq.com/docs/your-data#retention',
    'https://console.groq.com/docs/your-data?',
    'https://console.groq.com/docs/your-data#',
    'https://console.groq.com:443/docs/your-data',
    'https://user@console.groq.com/docs/your-data',
    'https://CONSOLE.GROQ.COM/docs/your-data',
    'https://console.groq.com/docs/./your-data',
    '//console.groq.com/docs/your-data',
    ' https://console.groq.com/docs/your-data',
    'https://console.groq.com.evil.invalid/docs/your-data',
    'https://gestaltview-ai-v3.vercel.app',
    'https://example.com', 'javascript:alert(1)', '/ai-integration/', '',
  ])('rejects %j', href => expect(isApprovedExternalLink(href)).toBe(false));
});
