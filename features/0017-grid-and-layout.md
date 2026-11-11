---
id: "0017"
title: "Grid and Layout: responsive grids and an app frame"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/Grid/Grid.js"
  - "src/Components/Visual/Layout/Layout.js"
  - "src/markdown/grid.md"
  - "src/markdown/layout.md"
---

# Grid and Layout: responsive grids and an app frame

## Summary

Grid gets breakpoints measured on its own width, automatic columns, spanning items and named areas. Layout becomes an app frame with regions, landmarks, a skip link and a sidebar that turns into a drawer. Both stay backward compatible.

## Problem / motivation

Grid was a fixed `repeat(N, 1fr)`: no way to show 4 columns on a page and 1 in a sidebar, no spans for bento sections, and `1fr` let long content overflow its column. Layout only appended nodes; every app rebuilt header / sidebar / drawer / skip link by hand, usually without landmarks or keyboard handling.

## Proposed direction

```js
await slice.build('Grid', { columns: { 0: 1, 560: 2, 960: 4 }, gap: 16, items: cards });
await slice.build('Grid', { minItemWidth: 200, items: photos });
await slice.build('Grid', { columns: 4, autoRows: '140px', items: [{ node: big, colSpan: 2, rowSpan: 2 }, a, b] });
await slice.build('Grid', { areas: { 0: ['a', 'b'], 800: ['a b'] }, items: [{ node, area: 'a' }, …] });

await slice.build('Layout', { header, sidebar, main, aside, footer, stickyHeader: true, fullHeight: true, sidebarLabel: 'Main navigation' });
```

- Grid: `columns` number or breakpoints (ResizeObserver on the grid), `minItemWidth`, items `{ node, colSpan (n | 'full'), rowSpan, area }` with spans clamped to the columns shown, `areas` (per width), `gap` number or string, `rowGap`, `autoRows`, `dense`, `align`, `justify`, `columnCount`, `data-columns`. `minmax(0, 1fr)` columns and `min-width: 0` items.
- Layout: regions (nodes, components or arrays; replaced ones destroyed), landmark roles (`landmarks: false` inside another page), skip link, `stickyHeader`, `fullHeight`, `sidebarWidth`, `asideWidth`, `contentWidth`, `collapseBelow` (drawer with menu button, aria-expanded, Escape, backdrop, focus in and back, `inert` when closed), `sidebarOpen`, `toggleSidebar()`, `onSidebarToggle`, `texts` (en/es).
- Compatibility: Grid's `rows`, `columnTemplate`, `rowTemplate`, `setItem`, `setItems`, `clear` unchanged (ThemeCreator unaffected). Layout without regions behaves exactly as before (ComponentsPage unaffected); with regions, `showing()` and `onLayOut()` target main.

## Validation

`Grid.spec.js` (+5: breakpoints, minItemWidth, spans clamped, areas per width, gap/align/dense) and `Layout.spec.js` (+7: legacy API, landmarks and skip link, drawer with keyboard and focus, backdrop, showing in regions and destruction of replaced components, destroy, CSS variables and texts).

## Documentation impact

`grid.md` rewritten: dashboard that fits its container, gallery, bento, product page with areas, adding and removing. `layout.md` rewritten: admin panel with drawer, docs page with a table of contents, swapping views.

## Decision log

- 2026-11-09 — Breakpoints on the component's own width (ResizeObserver), not media queries, so the same grid works in a page, a sidebar and a modal.
