---
id: "0013"
title: "Component: Quote"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/Quote/Quote.js"
  - "src/markdown/quote.md"
  - "src/Components/Visual/ElementCarrousel/ElementCarrousel.js"
  - "src/Components/Visual/Avatar/Avatar.js"
---

# Component: Quote

## Summary

`Quote` shows what someone said and who said it: testimonials, reviews, a quotation in an article. A `<figure>` with `<blockquote>` and `<figcaption>`, an Avatar, a star rating and the source.

## Problem / motivation

Testimonial sections were built from Cards (a heading for the person's name, the words as body text), losing the quote semantics, the citation and a rating screen readers can understand.

## Proposed direction

```js
await slice.build('Quote', {
  text: '…', author: 'Ana López', jobTitle: 'CTO', organization: 'Acme',
  avatar: true, rating: 4.5, source: 'Google review', href: 'https://…',
});
```

- `text` (string or paragraphs), `author`, `jobTitle` (not `role`, the ARIA role), `organization`.
- `avatar`: URL, `true` for initials, `''` none — an Avatar, `aria-hidden` (the name is next to it).
- `rating` 0-5 with halves: one `role="img"` with a translatable name (`slice.quote.rating`, `texts` prop); the stars use the theme primary (`--slice-quote-star`).
- `source` + `href`: `<cite>` link (external in a new tab) and the blockquote's `cite`.
- `variant`: `plain | soft | outlined`; `size`: `sm | md | lg`; `align`; `tone` (the quotation mark); `mark`.
- The caption sits at the bottom, so a row of quotes lines up; the host fills its slide/cell height.

## Composition

Testimonials carousel: Quotes as `elements` of an `ElementCarrousel` with `perView: { 0: 1, 560: 2, 900: 3 }`, `loop` and slow `autoplay` (documented).

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| Card with a quote icon | No `<blockquote>`, `<cite>` or rating semantics; the name became the heading. |

## Scope

In: the above. Out: logos of companies, video testimonials.

## Validation

`Quote.spec.js` (7): structure, paragraphs as text, rating name/halves/texts/clamping, avatar hidden and removed, source link and `cite`, looks/fallbacks, cleanup.

## Documentation impact

`src/markdown/quote.md` (Display › Content): carousel of testimonials, leading quote, reviews grid, quotation in an article.

## Decision log

- 2026-11-09 — Built. `jobTitle` instead of `role` to avoid shadowing `Element.role`.
