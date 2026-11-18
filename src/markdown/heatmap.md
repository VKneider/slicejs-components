---
title: Heatmap
route: /docs/display/heatmap
navLabel: Heatmap
section: Display
group: Content
order: 47
description: How much, where in a grid — activity per day over a year, or any two dimensions such as hour × weekday. Colour steps from the theme, a legend, a tip on hover and focus, and a keyboard grid where every cell has its own text.
component: HeatmapDocumentation
generate: true
tags: [heatmap, calendar, activity, contributions, chart, grid, data, display]
---

# Heatmap

## Overview
`Heatmap` shows how much of something there is in each cell of a grid, as colour: the stronger the colour, the higher the value.

- **`type: 'calendar'`** (default) lays out days: one column per week, one row per weekday — the activity of a year, the study days of a semester, the sales of a quarter.
- **`type: 'grid'`** takes any two dimensions with your labels: hour × weekday, product × region, lesson × student.

### When to use it
- **Patterns over time**: which days are busy, gaps, streaks.
- **Two dimensions at once**: when do people visit (hour × weekday), which lessons are hard (student × exercise).
- **A glance at a lot of values** where the exact number matters less than the shape.

### When not to use it
- **Exact numbers to compare or read**: a [Table](/docs/data/table).
- **One series over time** (a trend): a line or bar chart.
- **Few values** (under a dozen): a list or a small table says it better.

## Core Behavior
- `data` for a calendar: `[{ date, value }]` or `{ '2026-03-02': 4 }` (the same day twice adds up). For a grid: `[{ row, column, value }]`, with `row` and `column` as labels from `rows` / `columns` or as indexes.
- `start` and `end` (calendar): the range. By default, the 52 weeks up to today. `weekStart`: `0` Sunday, `1` Monday, `-1` (default) the locale's.
- `levels` (default `5`, counting the empty one) and `thresholds`: the lowest value of each step after the empty one (`[1, 4, 8, 12]`). Without thresholds the steps split 0…max evenly.
- `label(cell)` writes each cell's text (for the tip and screen readers); by default "Mon, Mar 2, 2026: 4" or "Mon, 9: 12". `formatValue(value)` changes only how values are written.
- `onCellClick(cell, { event })` and the `cell-click` event: `cell` is `{ date | row, column, value, level }`. `cells` returns them all.
- `summary: true` adds "1,284 in total"; `legend` (default on) shows Less ▢▢▢▢ More.

### Keyboard and screen readers
It is an ARIA grid with one Tab stop (the latest day in a calendar): arrows move between cells, skipping the days outside the range; Home / End go to the ends of a row; Enter or Space reports the cell. Every cell has its own text, so colour is never the only way to read it; the focused or hovered cell shows it in a tip.

## Looks
- `tone`: the colour (`success` by default, like a contributions graph). `cellSize` in px (default `12`); the gap scales with it.
- `labels`: month and weekday names (calendar) or row and column labels (grid). A calendar wider than its box scrolls, and opens on its most recent weeks.
- CSS variables: `--slice-heatmap-color`, `--slice-heatmap-empty`, `--slice-heatmap-radius`.

## Live Preview
:::component name="Heatmap"
{
  "start": "2026-01-01",
  "end": "2026-03-31",
  "data": { "2026-01-05": 2, "2026-01-06": 5, "2026-01-12": 1, "2026-01-20": 8, "2026-02-02": 3, "2026-02-03": 4, "2026-02-17": 9, "2026-03-03": 2, "2026-03-10": 6, "2026-03-24": 12 }
}
:::

## Examples
:::script label="A year of activity" expected="a section header with the total and a calendar of the last 52 weeks in green with month and weekday names, a legend Less…More and a summary; busier on weekdays, quiet on weekends; on a phone it scrolls and starts at the latest weeks"
// Deterministic sample data: busier on weekdays, a quiet holiday stretch.
let seed = 7;
const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const data = [];
const end = new Date(2026, 10, 8);
for (let i = 0; i < 364; i++) {
  const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
  const weekend = day.getDay() === 0 || day.getDay() === 6;
  const holiday = day.getMonth() === 7 && day.getDate() < 20;
  const value = holiday ? 0 : Math.max(0, Math.round((weekend ? 1.2 : 5) * random() * random() * 3 - (weekend ? 1 : 0)));
  if (value) data.push({ date: day, value });
}
const total = data.reduce((sum, d) => sum + d.value, 0);
const section = document.createElement('section');
section.style.cssText = 'display:grid;gap:16px;width:100%;min-width:0';
section.append(
  await slice.build('SectionHeader', { size: 'sm', title: `${total.toLocaleString('en')} activity in the last year` }),
  await slice.build('Heatmap', {
    end,
    data,
    summary: true,
    label: (cell) => `${cell.value || 'No'} activity on ${cell.date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
  })
);
return section;
:::

:::script label="When do visitors come (hour × weekday)" expected="a grid of 7 weekdays by 15 hours (8 to 22) in the accent tone with bigger cells; peaks around 9–11 and 19–21 on weekdays; hovering a cell says how many visits; clicking one writes its detail below"
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 15 }, (_, i) => String(8 + i));
const data = [];
days.forEach((day, d) => hours.forEach((hour, h) => {
  const hr = 8 + h;
  const morning = Math.max(0, 6 - Math.abs(hr - 10) * 2);
  const evening = Math.max(0, 7 - Math.abs(hr - 20) * 2);
  const weekend = d >= 5 ? 0.6 : 1;
  data.push({ row: day, column: hour, value: Math.round((morning + evening + 1) * weekend * 14 + ((d * 7 + h * 3) % 9)) });
}));
const detail = document.createElement('p');
detail.style.cssText = 'margin:8px 0 0;font-size:.85rem;opacity:.8';
detail.textContent = 'Click a cell to see its detail.';
const heatmap = await slice.build('Heatmap', {
  type: 'grid',
  rows: days,
  columns: hours,
  data,
  tone: 'accent',
  cellSize: 26,
  label: (cell) => `${cell.row} ${cell.column}:00 — ${cell.value} visits`,
  onCellClick: (cell) => { detail.textContent = `${cell.row} between ${cell.column}:00 and ${Number(cell.column) + 1}:00: ${cell.value} visits.`; }
});
const box = document.createElement('div');
box.style.cssText = 'width:100%;min-width:0';
box.append(heatmap, detail);
return box;
:::

:::script label="Study days of a semester (thresholds)" expected="a calendar from September to December starting on Monday, in the info tone, with fixed steps: 1–29 minutes, 30–59, 60–119 and two hours or more; the legend shows the five steps"
let seed = 3;
const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const data = [];
for (let d = new Date(2026, 8, 1); d <= new Date(2026, 11, 15); d.setDate(d.getDate() + 1)) {
  if (random() < 0.62) data.push({ date: new Date(d), value: Math.round(random() * 150) });
}
return await slice.build('Heatmap', {
  start: '2026-09-01',
  end: '2026-12-15',
  weekStart: 1,
  tone: 'info',
  cellSize: 16,
  data,
  thresholds: [1, 30, 60, 120],
  formatValue: (minutes) => minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
});
:::

## Best Practices
:::tip
Write a `label` that says the unit ("3 contributions on Mar 2"). The default only knows the number.
:::

:::tip
Use `thresholds` when the steps mean something (30 minutes, an hour, two hours). Even steps change meaning every time the maximum changes.
:::

## Pitfalls
:::warning
A heatmap shows a pattern, not exact values. If people need to compare numbers, give them the table too.
:::

:::related
- [Table](/docs/data/table) - The same numbers as cells.
- [Timeline](/docs/display/timeline) - The same events in order.
- [Tooltip](/docs/display/tooltip) - The value behind a square.
:::
