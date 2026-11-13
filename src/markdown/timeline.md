---
title: Timeline
route: /docs/display/timeline
navLabel: Timeline
section: Display
group: Content
order: 44
description: Events in time on one line — a career, the history of an order, a changelog, the activity on a record. Dates in the app's language, groups by year, month or day, and done, current and upcoming events.
component: TimelineDocumentation
generate: true
tags: [timeline, history, activity, changelog, career, tracking, events, content, display]
---

# Timeline

## Overview
`Timeline` shows things that happened — or will — in time: the jobs of a career, the history of an order, the releases of a product, who changed what on a record. Each event has a date, a marker on a line, a title, a sentence, and anything else it needs.

Dates are written in the app's language (through `slice.translator`, or `locale`), and the whole timeline is written again when the language changes.

### When to use it
- **A career or a story**: jobs, studies, milestones of a project (`layout: 'split'` or `'alternate'`).
- **The history of something in progress**: an order (ordered, shipped, out for delivery), a ticket, an application — with `state: 'current'` and `'upcoming'`.
- **A changelog** grouped by month or year.
- **Activity on a record**: "Ana changed the status · 3 hours ago", grouped by day.

### When not to use it
- **A process without dates** (how to enrol, how it works): [Stepper](/docs/display/stepper).
- **Records you search, sort or select**: [DataList](/docs/data/datalist) or [Table](/docs/data/table).
- **A task the user goes through screen by screen**: a Stepper.

## Core Behavior
- `items: [{ id, date, dateLabel, title, text, icon, tone, state, badge, href, target, content }]`.
  - `date`: a `Date`, a timestamp or an ISO text (`'2026-03-02'` is that local day).
  - `dateLabel`: your own text instead of the formatted date ("2019 – 2022", "Q3").
  - `tone`: the marker's colour for that event. `icon`: shown with `marker: 'icon'`.
  - `state`: `done` (default), `current` (a ring, and `aria-current="step"`) or `upcoming` (hollow, quiet, dashed line).
  - `href`: the title becomes a link (through the router for app paths). `content`: a string, a node, a component or an array of them.
- `dateFormat`: `date` (default), `datetime`, `time`, `month`, `year`, `relative` ("3 hours ago", with the full date in its tooltip) or `none`.
- `groupBy`: `none`, `year`, `month` or `day` ("Today", "Yesterday", then the date). Group headings use `headingLevel` (default `3`); event titles go one level below.
- `sort`: `none` (the order given), `newest` or `oldest`.
- An ordered list per group, with `<time datetime>` on each date. Markers and the line are decorative.

## Looks
- `layout`: `stacked` (the date above the title, default), `split` (a column of dates at the start) or `alternate` (events on both sides of the line). `split` and `alternate` go back to `stacked` when **the container** is narrower than 560px.
- `marker`: `dot` or `icon`. `variant`: `soft`, `filled` or `outlined`. `tone` for the whole line, `size`: `md` or `sm`.
- CSS variables: `--slice-timeline-date-width` (the date column in `split`), `--slice-timeline-space` (between events), `--slice-timeline-dot`, `--slice-timeline-icon`.

## Live Preview
:::component name="Timeline"
{
  "items": [
    { "date": "2026-03-02", "title": "Event 3", "text": "A short description of the third event." },
    { "date": "2025-11-20", "title": "Event 2", "text": "A short description of the second event." },
    { "date": "2025-06-01", "title": "Event 1", "text": "A short description of the first event." }
  ]
}
:::

## Examples
:::script label="A history in a split layout (with date ranges)" expected="a section header 'Section' and a timeline with a column of date ranges on the left ('Year 1 — now', 'Year 1 — Year 2', 'Year 0 — Year 1'); each item has a title, a subtitle and a short description; the current one has an accent badge 'Now'"
const section = document.createElement('section');
section.style.cssText = 'display:grid;gap:22px;width:100%';
section.append(
  await slice.build('SectionHeader', { eyebrow: 'Section', title: 'Section title', size: 'sm' }),
  await slice.build('Timeline', {
    layout: 'split',
    items: [
      { dateLabel: 'Year 1 — now', title: 'Item 1', badge: 'Now', text: 'Subtitle 1', content: 'A short description of the current item.' },
      { dateLabel: 'Year 1 — Year 2', title: 'Item 2', text: 'Subtitle 2', content: 'A short description of the second item.' },
      { dateLabel: 'Year 0 — Year 1', title: 'Item 3', text: 'Subtitle 3', content: 'A short description of the third item.' }
    ]
  })
);
return section;
:::

:::script label="Done, current and upcoming" expected="a compact timeline with icon markers: 'Step 1' and 'Step 2' done, 'Step 3' current with a ring and an action button, 'Step 4' upcoming, hollow and grey with a dashed line before it; dates show with time"
const toasts = await slice.build('ToastProvider', { singleton: true });
const day = (d, h) => new Date(2026, 10, d, h, 15);
return await slice.build('Timeline', {
  marker: 'icon',
  size: 'sm',
  dateFormat: 'datetime',
  items: [
    { date: day(6, 9), title: 'Step 1', icon: 'cart', text: 'A short description.' },
    { date: day(6, 16), title: 'Step 2', icon: 'archive', text: 'A short description.' },
    {
      date: day(7, 8), title: 'Step 3', icon: 'truck', state: 'current', tone: 'info', text: 'A short description of the current step.',
      content: await slice.build('Button', { value: 'Action', size: 'sm', variant: 'outlined', onClick: () => toasts.show('Action selected.') })
    },
    { dateLabel: 'Expected date', title: 'Step 4', icon: 'home', state: 'upcoming' }
  ]
});
:::

:::script label="Changelog grouped by month" expected="a changelog with month headings ('Month 2', 'Month 1'); each entry has a version title with a badge (Feature, Fix), a date, a short text and the title links to the docs"
return await slice.build('Timeline', {
  groupBy: 'month',
  sort: 'newest',
  tone: 'accent',
  items: [
    { date: '2026-10-12', title: 'v1.0.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' },
    { date: '2026-11-08', title: 'v1.2.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' },
    { date: '2026-10-28', title: 'v1.1.1', badge: 'Fix', tone: 'warning', text: 'A short description of this fix.' },
    { date: '2026-11-02', title: 'v1.1.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' }
  ]
});
:::

:::script label="Activity on a record (relative dates, grouped by day)" expected="activity grouped under 'Today' and 'Yesterday' with relative times such as '20 minutes ago' and '3 hours ago'; only coloured dots per kind of change are used"
const ago = (minutes) => new Date(Date.now() - minutes * 60000);
return await slice.build('Timeline', {
  groupBy: 'day',
  dateFormat: 'relative',
  size: 'sm',
  items: [
    { date: ago(20), title: 'User 1 changed the status to Status 1', tone: 'success' },
    { date: ago(180), title: 'User 2 added a comment', text: '“A short example comment.”', tone: 'info' },
    { date: ago(60 * 26), title: 'User 1 created the record', tone: 'neutral' }
  ]
});
:::

:::script label="Alternate layout" expected="a centred line with milestones on both sides, the date across from each one; on a narrow screen it becomes one column"
return await slice.build('Timeline', {
  layout: 'alternate',
  dateFormat: 'year',
  marker: 'icon',
  variant: 'filled',
  items: [
    { date: '2018-05-01', title: 'Milestone 1', icon: 'code', text: 'A short description of the first milestone.' },
    { date: '2021-02-01', title: 'Milestone 2', icon: 'map-pin', text: 'A short description of the second milestone.' },
    { date: '2024-09-01', title: 'Milestone 3', icon: 'terminal', text: 'A short description of the third milestone.' },
    { date: '2026-03-01', title: 'Milestone 4', icon: 'globe', text: 'A short description of the fourth milestone.' }
  ]
});
:::

## Best Practices
:::tip
Pick one date format for the whole timeline. Mixing "3 hours ago" and "Mar 2, 2026" makes readers compare two scales.
:::

:::tip
Use `dateLabel` for ranges and fuzzy dates ("2019 — 2022", "Spring 2025"); keep `date` too when you sort or group, so the order stays right.
:::

## Pitfalls
:::warning
`upcoming` is not "disabled". It says something has not happened yet; do not use it to hide events.
:::
