---
id: "0010"
title: "Component: Steps"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-08
updated: 2026-11-08
target: "next release"
owners: []
related:
  - "src/Components/Visual/Steps/Steps.js"
  - "src/markdown/steps.md"
  - "features/0005-component-stepper.md"
---
# Component: Steps

## Summary

`Steps` shows how something is done, in order — "How it works", "How to enrol", "Getting your certificate": a marker (number, icon or dot), a title, a sentence and any content (a command, a link, an image).

## Problem / motivation

Every landing and course page has a numbered process, drawn by hand: circles, a line between them, a layout that breaks on mobile, and numbers that a screen reader does not hear as an order.

## Proposed direction

```js
await slice.build('Steps', {
  orientation: 'horizontal',
  items: [
    { title: 'Create your account', text: 'With your university email.' },
    { title: 'Choose a course', text: 'Pick from the open sections.' },
    { title: 'Pay and start', text: 'Your access is ready the same day.' },
  ],
});
```

- `items`: `{ title, text, icon, content, id }`.
- `orientation`: `vertical` (default) · `horizontal`, which goes back to vertical when **its container** is under 600px (container query, so it also works in a narrow column).
- `marker`: `number` (default) · `icon` (a step without icon keeps its number) · `dot`. `start`: the first number.
- `variant`: `soft | filled | outlined` (the marker). `tone`, `size`, `connector`, `headingLevel` (default 3).

### Accessibility

An `<ol>` (with `start`), so order and count are announced; markers and the line are `aria-hidden`; titles are headings.

## Relationship with Stepper (0005)

`Steps` only shows a process. When the steps are screens of a task the user is going through (done, current, next; Back and Continue), that is the `Stepper`. A future Stepper can reuse Steps' markup and CSS for its indicator.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| A `Stepper` with `static: true` | Stepper's model (status, gating, navigation) is irrelevant here and would be half disabled. |
| `FeatureList` with numbers | No order semantics, no connector. |

## Scope

In: the above. Out: statuses (Stepper), timelines with dates (Timeline).

## Compatibility and risk

New component. The host takes `width: 100%` because a container query needs a definite width (a flex parent would collapse it).

## Validation

`Steps.spec.js`: render, `start` in markers and `<ol>`, icon/dot markers, horizontal vs narrow container, connector rules, fallbacks, heading level, cleanup of icons and content.

## Documentation impact

`src/markdown/steps.md` (Display › Content), with "Steps or Stepper?".

## Decision log

- 2026-11-08 — Built as display-only; Stepper stays a separate, stateful component.
