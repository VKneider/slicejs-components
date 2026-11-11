---
id: "0016"
title: "Component: Rating (and RadioGroup `buttons`)"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/Rating/Rating.js"
  - "src/Components/Visual/RadioGroup/RadioGroup.js"
  - "src/markdown/rating.md"
  - "src/markdown/radio-group.md"
---

# Component: Rating (and RadioGroup `buttons`)

## Summary

`Rating` asks for a score from 1 to `max` with stars, and shows one (`readOnly`). RadioGroup gets a `buttons` variant (a segmented control) and an `ariaLabel` prop.

## Problem / motivation

Review forms and satisfaction questions need stars. Reusing RadioGroup (five options "1"…"5") reads as a list of numbers, not as a score, and has no hover preview, halves or read-only display. A Slider is the wrong control: continuous, and no "nothing chosen yet" state for a required field.

## Proposed direction

```js
await slice.build('Rating', { label: 'How was the class?', labels: ['Poor', …], showValue: true, onChange });
await slice.build('Rating', { value: 4.6, readOnly: true });
await slice.build('RadioGroup', { variant: 'buttons', orientation: 'horizontal', ariaLabel: 'Range', options: ['Day', 'Week', 'Month'] });
```

- Rating is built like RadioGroup: native radios in a fieldset[role=radiogroup] — keyboard, `required` and native form submission come from the browser.
- `max` (≤ 10), `allowHalf` (two radios per star), `clearable` (click on the chosen star, Backspace, Delete, 0), `labels`, `showValue`, `icon`, `size`, `tone`, `texts` (en/es built in).
- `readOnly`: `role="img"` with "Rated 4.6 out of 5", fill to the tenth.
- Form: `ariaLabel`, `required`; a bubbling `change` also when cleared; empty is `null`.

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| RadioGroup with 5 options | Numbers in a row, no preview, no halves, no read-only. |
| Slider variant | Continuous; no empty state; arrows-only feel on touch. |

## Validation

`Rating.spec.js` (12) and two `buttons` cases plus one `ariaLabel` case in `RadioGroup.spec.js`.

## Documentation impact

`rating.md` (Input › Basic): course feedback in a Form, product reviews with an average, rate your delivery, icons and tones. `radio-group.md`: when to use / not, `buttons` examples (range switch above a chart, monthly / yearly billing).

## Decision log

- 2026-11-09 — Rating as its own component on native radios; `buttons` as a RadioGroup variant.
