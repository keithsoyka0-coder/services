// © 2026 Keith Soyka / GestaltView · provenance: services local draft preview builder
import { getPage, services, type PageContent } from './content';
import { DiDemo } from './DiDemo';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { ServiceCards } from './ServiceCards';

const DRAFT_MARKER = 'DRAFT — INTERNAL REVIEW ONLY — NOT FOR PUBLICATION';

function Header() {
  return <header className="site-header"><div className="wrap nav">
    <a className="brand" href="/" aria-label="Keith Soyka services home">Keith Soyka<span className="dot">.</span></a>
    <nav aria-label="Main navigation"><a href="/">Services</a><a href="/#review-status">Review status</a><a className="nav-cta" href="/#consultation">Consultation preview</a></nav>
  </div></header>;
}

function Consultation() {
  return <section className="block consultation" id="consultation" aria-labelledby="consultation-title">
    <div className="form-intro"><p className="sec-label">Unavailable interface preview</p><h2 id="consultation-title">Consultation form — not connected</h2><p>Submission is unavailable until a reviewed consultation contract and an authorized, separate services database exist. Privacy and contact-field policies still require owner decisions.</p><p role="status" className="notice">No details are sent or saved. This preview cannot receive a consultation request.</p></div>
    <form aria-label="Consultation preview" onSubmit={(event) => event.preventDefault()}>
      <fieldset disabled><legend>Form preview — not connected</legend>
        <label htmlFor="consultation-name">Name</label><input id="consultation-name" name="name" autoComplete="name" />
        <label htmlFor="consultation-contact">Contact</label><input id="consultation-contact" name="contact" autoComplete="off" />
        <label htmlFor="consultation-interest">Service interest</label><select id="consultation-interest" name="interest" defaultValue=""><option value="" disabled>Select a service</option>{services.map((page) => <option key={page.path} value={page.path.slice(1, -1)}>{page.h1}</option>)}</select>
        <label htmlFor="consultation-message">Message</label><textarea id="consultation-message" name="message" rows={4} />
        <button className="btn btn-primary" type="submit" disabled>Consultation unavailable in this draft preview</button>
      </fieldset>
    </form>
  </section>;
}

function ReviewStatus({ page }: { page: PageContent }) {
  return <section className="block review-notes" id="review-status" aria-labelledby="review-title">
    <p className="sec-label">Internal review — unresolved decisions</p><h2 id="review-title">Not ready for publication</h2>
    <p className="notice">Draft prices and scope are not finalized offers. This copy is rendered only for internal review; planning approval is not sales or publication approval.</p>
    <div className="status-grid">
      <div className="status-card"><span className="status-label">Unresolved</span><h3>Scope approval pending</h3><ul>{(page.reviewNotes ?? []).map((note) => <li key={note}>{note}</li>)}</ul></div>
      <div className="status-card"><span className="status-label">Placeholders, not proof</span><h3>Proof approval pending</h3><p>Proof placeholders below need actual, owner-approved evidence, exact URLs and relevant portfolio backlinks. No placeholder is evidence of completed work.</p><p>External runtime references are unverified references, not client proof or finalized links.</p></div>
      <div className="status-card"><span className="status-label">Unavailable</span><h3>Consultation &amp; publication</h3><p>The form cannot submit. A reviewed contract, separately authorized services database and privacy decisions are still required.</p><p>No production domain, canonical, indexing submission, public sitemap or release metadata is configured. This implementation is restricted to a local draft preview.</p></div>
    </div>
  </section>;
}

function DormantWidget({ page }: { page: PageContent }) {
  return <section className="widget-mount" data-widget-mount={page.path.slice(1, -1)} data-service-id={page.path.slice(1, -1)} data-widget-state="disabled" aria-label="Dormant Digital Intelligence widget mount"><p className="sec-label">Phase 2 mount point — inactive</p><p>No assistant, network request, session tracking, or model call is running.</p></section>;
}

export function App({ path }: { path: string }) {
  const page = getPage(path);
  const hub = page?.path === '/';
  return <><AtmosphereCanvas /><a className="skip-link" href="#main-content">Skip to content</a><Header />
    <div className="draft-banner" role="note">{DRAFT_MARKER}</div>
    <main className="wrap" id="main-content">
      <section className="hero">{!hub && <a className="back-link" href="/">← All service drafts</a>}<p className="eyebrow">{page ? 'Quill copy · local draft review' : '404 · route not found'}</p><h1>{page?.h1 ?? 'Page not found'}</h1>{!hub && <p className="lede">{page ? 'Local draft for review; not a final offer or a live purchasing path.' : 'This address is not one of the seven service drafts.'}</p>}{page && <a className="btn btn-ghost" href="#review-status">Review unresolved decisions <span aria-hidden="true">↗</span></a>}</section>
      {page ? <><ReviewStatus page={page} />{hub && page.hubPresentation
        ? <article className="draft-copy draft-copy--hub" aria-label="Quill page draft">
          <div className="draft-copy__prose" dangerouslySetInnerHTML={{ __html: page.hubPresentation.beforeHtml }} />
          <ServiceCards cards={page.hubPresentation.cards} />
          <div className="draft-copy__prose" dangerouslySetInnerHTML={{ __html: page.hubPresentation.afterHtml }} />
        </article>
        : <article className="draft-copy" aria-label="Quill page draft" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />}{hub ? <Consultation /> : page.path === '/ai-integration/' ? <DiDemo /> : <DormantWidget page={page} />}</> : <a className="btn btn-primary" href="/">Back to service drafts</a>}
    </main><footer className="site-footer"><div className="wrap footer-inner"><p>© 2026 Keith Soyka / GestaltView</p><p>Local draft preview · no live consultation or DI widget</p><a href="/">Services home</a></div></footer>
  </>;
}
