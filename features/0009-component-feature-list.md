---
id: "0009"
title: "Component: FeatureList"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-08
updated: 2026-11-08
target: "next release"
owners: []
related:
  - "src/Components/Visual/FeatureList/FeatureList.js"
  - "src/markdown/feature-list.md"
  - "src/Components/shared/navigation/links.js"
  - "src/Components/shared/content/nodes.js"
---
# Component: FeatureList

## Summary

A `FeatureList` shows what something offers, item by item — an icon, a title, a sentence: services, "why us", what a plan includes, a course's topics. It is information laid out on one grid, not a set of cards.

## Problem / motivation

Sites built a grid of `Card`s for this, which brings surfaces, borders and click targets the content does not need, or a hand-made grid that differs page by page (icon sizes, gaps, headings that are `<b>` instead of headings).

## Proposed direction

```js
await slice.build('FeatureList', {
  columns: 3,
  items: [
    { icon: 'rocket', title: 'Fast setup', text: 'Online in an afternoon.' },
    { icon: 'shield', title: 'Private by default', text: 'Your data stays yours.', badge: 'New', href: '/privacy' },
  ],
});
```

- `items`: `{ title, text, icon, badge, href, target, content, id }`.
- `layout`: `grid` (icon on top, default) · `list` (icon at the start; one per row unless `columns`) · `compact` (checklists in columns).
- `columns`: `0` as many as fit `minItemWidth`; `n` a maximum that still wraps on narrow screens.
- `variant`: `plain` (default, no surface) · `soft` · `outlined`. `tone`: the icons' colour. `align`: `start | center`. `size`: `sm | md`.
- `headingLevel` (default 3): every title is a real heading.
- `href` makes the title a real link (through `slice.href()`, so it carries the locale), stretched over the item; a plain click on an app path goes through the router. Without `href`, `onItemClick(item, { index, event })` makes the title a button.

### Accessibility

`<ul role="list">` (keeps list semantics with `list-style: none` in Safari); headings for titles; one focusable target per item (the link or button carries the title as its name); icons decorative.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| A `Card` grid | Surfaces and per-card targets for what is plain information. Cards remain right for things you open or compare. |
| `DataList` | A collection of records (search, sort, select), not a presentation of features. |

## Scope

In: the above. Out: per-item actions (put a Button in `content`), images per item (that is a Card or a MediaBlock).

## Compatibility and risk

New component. Links are `<a href>` with a router-aware click helper (`shared/navigation/links.js`).

## Validation

`FeatureList.spec.js`: render, heading levels, layouts and the `columns` maximum at 1200 and 320 px, links and router navigation (modified clicks left to the browser), `onItemClick` by mouse and keyboard, text never markup, content nodes kept across renders and destroyed, fast re-renders without leaked icons.

## Documentation impact

`src/markdown/feature-list.md` (Display › Content), with "FeatureList, Card grid or DataList?".

## Decision log

- 2026-11-08 — Built. `href` instead of `path` to match Card; `ul role="list"`.
