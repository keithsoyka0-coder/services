// © 2026 Keith Soyka / GestaltView · typed extraction contract

/** Plain display text paired with the explicitly named, sanitizer-rendered inline form. */
export interface ServiceCard {
  /** Stable structural identifier; not editorial copy. */
  id: string;
  /** Local spoke route from the structural allowlist. */
  path: string;
  /** Original source heading anchor, including the renderer's duplicate-ID policy. */
  headingId: string;
  /** Plain heading text. */
  name: string;
  /** Safe Markdown inline fragment for the heading, without a wrapper element. */
  nameHtml: string;
  /** Plain display price copied from the source price paragraph. */
  price: string;
  /** Plain paragraph text, excluding wrapper markup. */
  outcome: string;
  /** Safe Markdown inline fragment for the outcome paragraph. */
  outcomeHtml: string;
  /** Plain full paragraph text, including the exact “Included:” label. */
  included: string;
  /** Safe Markdown inline fragment preserving the exact label and inline markup. */
  includedHtml: string;
  /** Plain full paragraph text, including the exact “Not included:” label. */
  excluded: string;
  /** Safe Markdown inline fragment preserving the exact label and inline markup. */
  excludedHtml: string;
  /** Plain scope-link label copied from the source link. */
  scopeLinkLabel: string;
  /** Safe inline source label only; the component supplies the allowlisted anchor. */
  scopeLinkLabelHtml: string;
}

export interface HubPresentation {
  beforeHtml: string;
  cards: ServiceCard[];
  afterHtml: string;
}
