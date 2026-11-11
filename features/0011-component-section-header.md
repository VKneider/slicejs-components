---
id: "0011"
title: "Component: SectionHeader"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-08
updated: 2026-11-08
target: "next release"
owners: []
related:
  - "src/Components/Visual/SectionHeader/SectionHeader.js"
  - "src/markdown/section-header.md"
  - "src/Components/shared/navigation/links.js"
---
# Component: SectionHeader

## Summary

`SectionHeader` is the top of a section: a short eyebrow, the title (a real heading), one or two lines saying what the section is about, and what to do from here ("View all", "Contact me").

## Problem / motivation

Each section of a landing or portfolio starts the same way and each page rebuilds it: eyebrow styles, title sizes, the "View all →" link on the right that drops below on mobile, headings chosen by look (`<div class="title">`) so the page has no outline.

## Proposed direction

```js
await slice.build('SectionHeader', {
  eyebrow: 'Projects',
  title: 'Things I have built',
  description: 'Open-source tools and client work.',
  actions: [{ label: 'View all projects', href: '/projects' }],
});
```

- `eyebrow`, `title`, `description` (plain text).
- `actions`: `{ label, onClick, variant, icon, disabled }` → Buttons (the first `filled`, the rest `outlined`); `{ label, href, target }` → links with an arrow, through the router for app paths.
- `align`: `start` (actions on the right, wrapping below) · `center` (actions below).
- `size`: `sm | md | lg` (lg for a page's first section). `tone` (the eyebrow), `divider` (a line under the whole header), `titleStyle`: `plain | underline | rule` (a line attached to the title, for portfolio-style sections).
- `headingLevel` (default 2): the page title is the h1. `anchor`: the heading's id, for `/about#projects`.

### Accessibility

The heading is first in the DOM — heading navigation lands on the title, then reads the eyebrow — and the eyebrow is drawn above it with CSS `order`. Links are real links; buttons are Buttons.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| Markdown headings | Not available to pages built in JS; no eyebrow, description or actions. |
| A `Layout` slot | Layout is the page frame, not each section's start. |

## Scope

In: the above. Out: a full hero (image, background): a later `Hero`/`MediaBlock`.

## Compatibility and risk

New component.

## Validation

`SectionHeader.spec.js`: render, DOM order vs visual order, heading level swap and anchor, button and link actions (router), replaced actions destroyed, looks and fallbacks.

## Documentation impact

`src/markdown/section-header.md` (Display › Content).

## Decision log

- 2026-11-08 — Built. Link actions as anchors (not Buttons) so "View all" is a real link.
