// © 2026 Keith Soyka / GestaltView · provenance: services Phase 1 builder
import { renderToString } from 'react-dom/server';
import { App } from './App';
export { pages } from './content';
export { metadataHtml } from './metadata';
export function renderPage(path: string): string {
  return renderToString(<App path={path} />);
}
