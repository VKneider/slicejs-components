---
id: "0008"
title: "Component: Callout"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-08
updated: 2026-11-08
target: "next release"
owners: []
related:
  - "src/Components/Visual/Callout/Callout.js"
  - "src/markdown/callout.md"
  - "src/Components/Visual/Alert/Alert.js"
  - "src/Components/shared/content/nodes.js"
---
# Component: Callout

## Summary

A `Callout` is a highlighted passage inside content: a note, a tip, something important, a warning before a step, a definition. It belongs to what the page *says* — documentation, a course page, an article, the terms of a plan — so it is never a live region and never goes away by itself.

## Problem / motivation

Content sites had two options: an `Alert` (built for feedback: a live region, `role="alert"` for danger, dismiss, timeout) or a hand-made box. The first announces a static note to screen readers as if something had just happened; the second repeats colours, the side bar and the icon alignment on every page, and drifts from the theme.

## Proposed direction

```js
await slice.build('Callout', { tone: 'warning', title: 'Before you start', text: 'Back up your database.' });
await slice.build('Callout', { tone: 'success', icon: 'lightbulb', title: 'Tip', content: ['Press ? to see every shortcut.', link] });
```

- `tone`: `neutral | accent | info (default) | success | warning | danger` — what it means; each has an icon (`neutral` none).
- `variant`: `soft (default) | outlined | ghost` — soft is a tint with a side bar, ghost is only the bar (long texts).
- `title`, `text` (plain), `content` (string → paragraph, node, component, or an array of them).
- `icon`: `''` the tone's, a name or `{ name }`, `false` none.
- `size`: `sm | md`.
- Same tone tokens as Alert and Badge (`--success-color-readable`…), so themes stay consistent.

### Accessibility

`role="note"`, named by its title (`aria-labelledby`); never `aria-live`. The icon is decorative (`aria-hidden`); the meaning is in the title and the text, not only the colour.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| An `Alert` with `role="note"` | Alert's job (status, dismiss, timeout, actions) stays clear; a flag that turns half of it off is two components in one. |
| A markdown-only pattern | Apps that build pages in JS (portfolios, course pages) need it too. |

## Scope

In: the props above, spec, docs page. Out: collapsible callouts (that is `Details`), actions (content can hold links or buttons).

## Compatibility and risk

New component; no API changes elsewhere. Text is always text (`content` strings become paragraphs, never markup).

## Validation

`Callout.spec.js`: render, role and naming, ids unique, tones/variants/fallbacks, icon rules, content as text, content components destroyed when replaced and with the callout.

## Documentation impact

`src/markdown/callout.md` (Display › Content), with "Callout or Alert?".

## Decision log

- 2026-11-08 — Built: `role="note"`, tone/variant vocabulary of Alert, `ghost` for long texts.
