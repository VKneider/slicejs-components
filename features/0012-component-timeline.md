---
id: "0012"
title: "Component: Timeline"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/Timeline/Timeline.js"
  - "src/markdown/timeline.md"
  - "features/0010-component-steps.md"
  - "src/Components/shared/data/dates.js"
---

# Component: Timeline

## Summary

`Timeline` shows events in time on one line: a career, the history of an order, a changelog, the activity on a record. Each event has a date, a marker, a title, a sentence and optional content.

## Problem / motivation

Portfolios, order pages, changelogs and admin records all draw the same thing by hand: dates formatted in one fixed language, a line that breaks between groups, no `<time>`, no difference between what happened and what is still to come.

## Proposed direction

```js
await slice.build('Timeline', {
  groupBy: 'month', sort: 'newest', dateFormat: 'date',
  items: [{ date: '2026-11-08', title: 'v4.3.0', badge: 'Feature', text: '…', href: '/docs/…' }],
});
```

- `items`: `{ id, date, dateLabel, title, text, icon, tone, state, badge, href, target, content }`.
- `dateFormat`: `date | datetime | time | month | year | relative | none`; `dateLabel` for ranges ("2019 — 2022").
- `groupBy`: `none | year | month | day` ("Today", "Yesterday"); `sort`: `none | newest | oldest`.
- `state`: `done | current | upcoming` (order tracking): `aria-current="step"` on current, hollow markers and a dashed line before upcoming.
- `layout`: `stacked | split | alternate`; split and alternate fall back to stacked under 560px of **container** width.
- `marker`: `dot | icon`, `variant`, `tone` (per event too), `size`, `headingLevel`, `locale`.
- Dates through the app's locale (slice.translator) or `locale`; rewritten on a locale change (`translator.watch`).

### Accessibility

An `<ol>` per group, `<time datetime>`, group headings at `headingLevel` and event titles one level below; markers and line decorative; relative dates carry the full date in `title`.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| Steps with dates | Steps has no time, groups or states; a process is not a history. |
| A DataList view | Records to search and select, not a story to read. |

## Scope

In: the above. Out: infinite loading of older events (a "Load more" Button in the app), horizontal timelines.

## Validation

`Timeline.spec.js` (10): render and `<time>`, formats and fixed locale, relative with title, groups and sort, Today/Yesterday, states, icon markers and layouts, alternate vs narrow container, links through the router, cleanup.

## Documentation impact

`src/markdown/timeline.md` (Display › Content): career, order tracking, changelog, activity, alternate.

## Decision log

- 2026-11-09 — Built. `dateLabel` instead of range objects; states instead of a separate tracking component.
