---
id: "0015"
title: "Component: Heatmap"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/Heatmap/Heatmap.js"
  - "src/markdown/heatmap.md"
---

# Component: Heatmap

## Summary

`Heatmap` shows values as colour in a grid: a calendar of days (activity over a year) or any two dimensions with labels (hour × weekday).

## Problem / motivation

Activity calendars and hour × day grids are a common "show the pattern" view with no component: apps reach for a chart library or a table of coloured `<td>`s with no keyboard, no legend and colour as the only signal.

## Proposed direction

```js
await slice.build('Heatmap', { data: [{ date, value }], end: '2026-11-08', summary: true, label: (cell) => '…' });
await slice.build('Heatmap', { type: 'grid', rows, columns, data: [{ row, column, value }], cellSize: 26 });
```

- Calendar: `start`, `end` (default: 52 weeks to today), `weekStart` (`-1` = locale via `Intl.Locale` week info), month and weekday labels, opens scrolled to the latest weeks.
- Grid: `rows`, `columns`; data by label or index.
- `levels` (2–9) and `thresholds` (lower bounds) or even steps of 0…max; duplicates summed.
- `label(cell)`, `formatValue(value)`, `locale`, `tone`, `cellSize`, `labels`, `legend`, `summary`, `onCellClick`, `cells` getter.

### Accessibility

ARIA grid of rows and gridcells, one Tab stop, arrow keys skipping out-of-range days, Home/End, Enter/Space; every cell has its text (`aria-label`), shown in a tip on hover and focus; legend decorative.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| A chart library | A dependency for one view; poor keyboard support. |
| A coloured Table | Right for exact values, wrong for patterns over hundreds of cells. |

## Scope

In: the above. Out: zoom, selection of ranges, year switching (an app control that sets `start`/`end`).

## Validation

`Heatmap.spec.js` (7): calendar structure and summing, levels and thresholds, keyboard and onCellClick, tip, grid type and custom label, legend/summary/texts, a year with scroll to the end.

## Documentation impact

`src/markdown/heatmap.md` (Display › Content): a year of commits, visits by hour × weekday, study days with thresholds.

## Decision log

- 2026-11-09 — Built. Rows as DOM rows (ARIA grid) instead of column-major CSS flow.
