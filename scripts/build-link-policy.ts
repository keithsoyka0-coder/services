// Exact external disclosure-link policy for local build verification.
export function isApprovedExternalLink(href: string): boolean {
  return href === 'https://console.groq.com/docs/your-data';
}
