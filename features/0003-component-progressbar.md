---
id: "0003"
title: "Component: ProgressBar"
repo: "slicejs-components"
status: blocked
area: components
priority: medium
created: 2026-10-28
updated: 2026-11-12
target: "next release"
owners: []
related:
  - "src/Components/Visual/Loading/Loading.js"
  - "src/markdown/loading.md"
  - "src/Components/Visual/FileUpload/FileUpload.js"
  - "src/markdown/file-upload.md"
  - "COMPONENT_API_STANDARDS.md"
---

# Component: ProgressBar

## Summary

Implemented; browser/OG validation pending. A determinate progress bar for work whose completion is known: an upload, an import, a quota, a multi-step job. It shows how far along the work is with `value`, `max` and a visible or screen-reader-only label.

## Problem / motivation

`Loading` is indeterminate on purpose: it says “working” but not “how much is left”. When the app does know (a file upload, a batch import, a storage quota), it has no component and hand-rolls a `<div>` with a width, a color and, often, no `role="progressbar"` or `aria-valuenow`.

The result is inconsistent visuals and inaccessible progress. A percentage text next to an unlabeled bar is not enough: screen readers need the value on the progress element, and it must update without stealing focus.

## Direction (implemented)

```js
const progress = await slice.build('ProgressBar', {
  value: 42,
  max: 100,
  label: 'Uploading invoice.pdf',
  showValue: true,     // draws "42%" next to the bar
  size: 'md',          // 'sm' | 'md' | 'lg'
  tone: 'info'         // 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'
});
progress.value = 67;   // reactive; aria-valuenow follows
```

- `value` is clamped to `0…max`; `max` defaults to `100`.
- `label` is required for a meaningful `aria-label`; `aria-valuetext` can be overridden for “3 of 8 files”.
- `showValue` renders the formatted value at the end of the track. A `format` function can replace the default percentage.
- `tone` is semantic, like `Badge`; `size` only changes height and font size.
- Optional `indeterminate: true` reuses the track with an animation, but the docs should send people to `Loading` unless the bar is already part of a larger layout.
- The bar uses `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`; the animated fill is `aria-hidden`.
- CSS variables for track, fill and radius; `prefers-reduced-motion` removes any transition.

Composition to document:

- file upload row (name + progress + cancel)
- import job with “3 of 8 files”
- storage quota (warning tone above 80%)
- form completion (success tone at 100%).

## Alternatives considered

- **Text percentage only.** Rejected: cheap, but inaccessible and visually weak for long work.
- **A `progress` variant on `Loading`.** Rejected for the same reason as Skeleton: indeterminate and determinate are different jobs with different ARIA.
- **A chart or gauge component.** Out of scope; this is a linear progress indicator, not data visualization.

## Scope

### In scope

- Determinate `ProgressBar` with label, value text, size and tone.
- Reactive `value`/`max` without rebuilding the DOM.
- Component spec, Markdown page, generated docs route and registry entry.
- Patterns for upload, batch import and quota.

### Out of scope

- Circular progress rings.
- Multi-segment or stacked bars.
- Upload transport or job orchestration.
- Charts, gauges or dashboards.

## Compatibility and risk

- Public API impact: new component; no existing API changes.
- Existing apps affected: none.
- Migration / breaking change: none.
- Security / performance: one style write per value change; no animation loop in JS.
- Accessibility risk: a progress bar that updates too often can flood a live region. The component should not be a live region by default; consumers announce milestones in text.

## Validation plan

- Unit tests: clamping, formatting, `aria-*` attributes, tone/size classes.
- Browser/e2e tests: value updates, `max` other than 100, label and value text, reduced motion, 320px layout.
- Product check (Conclave): not required until adoption.
- Artifact/release check: `pnpm run build`; docs and registry generated.

## Documentation impact

- Framework docs pages: none.
- Component docs: `src/markdown/progress-bar.md`, including “ProgressBar or Loading?”.
- Skill / agent guidance: add to the component catalog when shipped.
- Workspace docs: the lab can use it for long-running lab endpoints; add when M1/M3 reaches them.

## Open questions

- [x] Indeterminate is included for a track whose total is temporarily unknown; generic busy UI still uses Loading.
- [x] showValue belongs in the component; format(value, max) also supplies aria-valuetext.
- [x] Determinate fill transitions for 200ms only when reduced motion is not requested; the unknown-total fill is stationary for reduced motion.

## Decision log

- 2026-10-28 - Created as `proposed` from `WANTED_COMPONENTS.md`.

- 2026-11-12 — Implemented ProgressBar with value/max normalization, retained assigned value,
  label/showLabel/showValue, formatter/ariaValueText, locale and en/es defaults, sizes/tones,
  optional indeterminate state and reduced motion. Added 2 node tests and 4 browser cases;
  Markdown examples cover a batch import, quota, unknown total and compact semantic tones.
- 2026-11-12 — Integrated ProgressBar into TourDemo project cards and the Stepper task example.
  Registry, generated docs/types/catalog included. Repo node tests (182), real-runtime DOM-adapter
  checks, Markdown generation, type generation and production build pass. Browser/OG validation
  is blocked by the environment, so status is blocked rather than done.

## Release blocker

Playwright Chromium cannot launch here (process socket permission). The real-browser specs and
new OG card are pending. On a browser-enabled machine, run:

```bash
pnpm exec playwright test ProgressBar Stepper --project=components
pnpm run og:generate -- --only=/docs/display/progress-bar,/docs/display/stepper,/docs/services/tour-service
pnpm run test:gate
```

Only after these gates and a manual narrow/light/dark check pass should this feature become done
and move to the shipped index. Existing social cards for changed docs examples may also need a
full regeneration before release.
