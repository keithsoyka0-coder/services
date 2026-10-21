# Dormant widget container contract

© 2026 Keith Soyka / GestaltView · provenance: 2026-10-20 · origin: Builder

Each of the six spoke routes has one semantic `section` reserved for the Phase 2 Digital Intelligence (DI) component. The hub has no widget mount. The mount follows scope and proof containers, before the discovery/process section.

## Stable attributes

```html
<section
  class="widget-mount"
  data-widget-mount="website-build"
  data-service-id="website-build"
  data-widget-state="disabled"
  aria-label="Dormant Digital Intelligence widget mount"
></section>
```

The two identifier attributes match the exact route slug. Both are emitted in initial server-rendered HTML. `disabled` is a descriptive state, not a DOM `disabled` attribute and not a security boundary.

CSS gives the container a minimum height of 120px, full available content width, layout/style containment, a visible inactive boundary, and mobile spacing. It does not fix a height or clip a future conversation. Current text explicitly states that no assistant, network request, tracking, or model call is running.

## Not implemented

There is no client widget bootstrap, runtime endpoint, provider key, model selection, session, rate limiter, purchase unlock, or outbound request. These are Phase 2 work and require their own approved interface and abuse controls. Visible inactive text must be replaced only when a real, scoped demo is available; do not advertise a live demo before then.

Future integration must preserve service-page rendering without script execution, keyboard access, screen-reader labels, mobile layout and reduced-motion preferences. Avoid mounting via arbitrary innerHTML or fetching unapproved content into the container.
