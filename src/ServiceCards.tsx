// © 2026 Keith Soyka / GestaltView · Markdown-derived hub offer cards
import type { ServiceCard } from './content';

export function ServiceCards({ cards }: { cards: ServiceCard[] }) {
  return <div className="service-grid">{cards.map((card) =>
    <article className="service-card" key={card.id} aria-labelledby={card.headingId}>
      <h3 id={card.headingId} dangerouslySetInnerHTML={{ __html: card.nameHtml }} />
      <p className="price">{card.price}</p>
      <p className="service-card__outcome" dangerouslySetInnerHTML={{ __html: card.outcomeHtml }} />
      <p className="service-card__included" dangerouslySetInnerHTML={{ __html: card.includedHtml }} />
      <p className="service-card__excluded" dangerouslySetInnerHTML={{ __html: card.excludedHtml }} />
      <a className="card-link" href={card.path} dangerouslySetInnerHTML={{ __html: card.scopeLinkLabelHtml }} />
    </article>
  )}</div>;
}
