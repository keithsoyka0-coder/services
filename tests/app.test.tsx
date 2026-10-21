// © 2026 Keith Soyka / GestaltView · provenance: local draft preview builder
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App';

const marker = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';
const routes = ['website-build', 'ai-opportunity-audit', 'ai-ops-sprint', 'codebase-audit', 'custom-software', 'ai-integration'];
afterEach(cleanup);

describe('authorized local-only Quill draft preview', () => {
  it.each(['/', ...routes.map((slug) => `/${slug}/`), '/does-not-exist/'])('conspicuously labels %s as internal-only', (path) => {
    render(<App path={path} />);
    expect(screen.getByText(marker)).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
  it('renders the Quill hub prose and links to all six exact spoke routes', () => {
    const { container } = render(<App path="/" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hire Keith Soyka for web builds, audits, and Digital Intelligence (DI) integration');
    expect(screen.getByRole('heading', { name: 'Care is part of the build—not an upgrade' })).toBeTruthy();
    for (const slug of routes) expect(container.querySelector(`a[href="/${slug}/"]`)).not.toBeNull();
    expect(container.querySelector('#consultation')).not.toBeNull();
    expect(container.querySelector('#discovery')).not.toBeNull();
    expect(container.querySelector('#review-status')).not.toBeNull();
  });
  it.each(routes)('renders %s draft prose with visible unresolved proof and scope', (slug) => {
    const { container } = render(<App path={`/${slug}/`} />);
    expect(screen.getByText('Scope approval pending')).toBeTruthy();
    expect(screen.getByText('Proof approval pending')).toBeTruthy();
    expect(container.querySelectorAll('[data-proof-placeholder]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-proof-placeholder] a')).toHaveLength(0);
    expect(container.querySelectorAll('a[href^="https:"]')).toHaveLength(0);
    expect(container.querySelector('[data-widget-mount]')?.getAttribute('data-widget-state')).toBe('disabled');
    expect(screen.getByRole('heading', { name: "What's included" })).toBeTruthy();
    expect(container.querySelector('a[href="/"]')).not.toBeNull();
    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('labels all prices as draft details, without finalizing scope or proof', () => {
    const html = renderToStaticMarkup(<App path="/" />);
    expect(html).toContain('$2,900');
    expect(html).toContain('$950');
    expect(html).toContain('$8,500–$10,000');
    expect(html).toContain('$9,500');
    expect(html).toContain('Draft prices and scope are not finalized offers.');
    expect(html).toContain('No placeholder is evidence of completed work.');
  });
  it('never submits or claims receipt, even when a submit event is dispatched', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App path="/" />);
    const form = screen.getByRole('form', { name: 'Consultation preview' });
    const fieldset = form.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Consultation unavailable in this draft preview' }) as HTMLButtonElement).disabled).toBe(true);
    for (const label of ['Name', 'Contact', 'Service interest', 'Message']) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(fireEvent.submit(form)).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toContain('No details are sent or saved');
    expect(screen.queryByText(/request received|thank you for submitting|successfully submitted/i)).toBeNull();
  });
  it('omits internal handoffs and gated mechanisms from every rendered page', () => {
    for (const path of ['/', ...routes.map((slug) => `/${slug}/`)]) {
      const html = renderToStaticMarkup(<App path={path} />);
      expect(html).not.toMatch(/Internal handoff|license.key|degraded.mode|application\/ld\+json|rel="canonical"/i);
    }
  });
  it('does not turn unknown paths into a service page', () => {
    render(<App path="/does-not-exist/" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
  });
  it('matches slashless service URLs to the same draft route', () => {
    render(<App path="/website-build" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Standard 4-page site');
  });
});
