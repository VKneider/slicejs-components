---
id: "0005"
title: "Component: Stepper (static and interactive)"
repo: "slicejs-components"
status: blocked
area: components
priority: medium
created: 2026-10-28
updated: 2026-11-12
target: "next release"
owners: []
related:
  - "features/0010-component-steps.md"
  - "src/Components/Visual/Stepper/Stepper.js"
  - "src/Components/Visual/Stepper/Stepper.spec.js"
  - "src/markdown/stepper.md"
  - "COMPONENT_API_STANDARDS.md"
---

# Component: Stepper

## Summary

One ordered-process component, with `mode: 'static'` for instructions and `mode: 'interactive'`
for task navigation. This merges the old Steps implementation and the original stateful Stepper
proposal. The implementation and documentation are complete; real-browser validation and new OG
captures are blocked in the current environment, so this feature is not marked done.

## Problem / motivation

Separate components duplicated the same markers, connector, content and responsive layout. The
user explicitly requested one Stepper with both modes and confirmed Steps has no consumers:
remove it outright, with no alias or compatibility layer.

## Direction (implemented)

```js
await slice.build('Stepper', {
   mode: 'interactive', active: 'payment', linear: true,
   items: [
      { id: 'contact', title: 'Contact details', status: 'done' },
      { id: 'payment', title: 'Payment' },
      { id: 'review', title: 'Review' },
   ],
   onChange: (id, { previous, step, index }) => showPanel(id),
});
```

- `items`: `{ id, title, text, icon, content, status, disabled }`. Unique stable IDs retain DOM rows,
  content and existing icons. Missing IDs fall back to the index; duplicates fail explicitly.
- `mode`: static (default) or interactive. No separate Steps component or `steps` prop alias.
- `active`: enabled item ID, normalized to a string. Current-item fallback: explicitly current,
  then first enabled. One current item in interactive mode; none in static mode.
- Status: upcoming/current/done/error; app-owned completion. `linear`, `clickable`, `disabled`.
- `select(id)` performs gated user selection and emits `onChange` / `step-change` once. Assigning
  `active` is silent and can restore any enabled stage; the app owns validation and panels.
- Orientation: vertical or horizontal (vertical again below a 600px container width).
- Markers: number/icon/dot, numbering start, connector, variant, tone, size and headingLevel.
- Content is text/Node/component/array; text is never HTML. Removed/replaced owned nodes are cleaned.

### Accessibility

Ordered list, real buttons, one aria-current="step", disabled navigation, roving tabindex,
arrow/Home/End focus navigation, native Enter/Space activation, RTL arrows, polite step announcement,
English/Spanish texts through slice.stepper.*, theme tokens and no decorative motion loop.
Static mode has headings, decorative markers and no controls/current-step announcement.

## Alternatives considered

- Separate Steps + Stepper: superseded by the user's explicit fusion decision.
- Steps alias/wrapper: explicitly declined by the user because there are no consumers.
- Tabs variant: rejected; a process has order/completion, unlike sibling views.
- Wizard engine: outside scope; panel rendering and validation remain app concerns.

## Scope

In: the implementation above, unit/browser specs, Markdown scenarios, generated docs/registry/types,
removal of Steps source/docs/route/registry/old generated card and updates to documentation links.
Out: form validation, router orchestration, nested steps, automatic completion, animation of panels.

## Compatibility and risk

The Steps API/tag/route are intentionally removed, as expressly authorized by the user. No alias,
redirect or duplicate renderer is shipped. The old feature remains as a retired decision record.
Main risks: keyboard behavior, layout at narrow widths, focus retention and cleanup during async icon
builds. Pure data and DOM-adapter checks pass; browser CSS/native interaction checks remain pending.

## Validation

- 4 node tests in Stepper.test.js: IDs, active resolution, gating, read-only/disabled behavior.
- 10 Playwright cases in Stepper.spec.js: migrated static contract + interactive navigation,
  keyboard/focus, gating, mode changes, keyed content and cleanup.
- External DOM-adapter checks using the actual Slice/Controller: static→interactive, native click
  callbacks, current state, gating, retained editor nodes/icons, cleanup and keyboard handlers pass.
- Repo node suite: 182 pass. Markdown lint/generation, types, icons, teardown and production build pass.
- Blocker: Playwright Chromium cannot launch in this environment; new OG capture and test:gate
  remain pending. Run the browser suite and generate cards before marking done/moving to shipped.

## Documentation impact

- src/markdown/stepper.md: static enrollment, interactive task panels with ProgressBar, icon
  instructions, error/disabled states, compact dots/continued numbering.
- Retired src/markdown/steps.md and /docs/display/steps; generated StepperDocumentation replaces it.
- FeatureList, Timeline, SectionHeader and TourService links now use Stepper.
- Registry, generated declarations/event manifest, docs catalog, coverage and wanted index updated.

## Open questions

None about the API. Remaining work is real-browser/visual validation and OG capture.

## Decision log

- 2026-10-28 — Captured as a separate interactive Stepper proposal.
- 2026-11-12 — User approved the fusion with static Steps and explicitly declined compatibility.
- 2026-11-12 — Implemented one Stepper, removed Steps, migrated static tests, added interactive
  tests/docs, generated registry/routes/types/catalog and pruned the retired social card through
  the generator. State: blocked on browser validation, not shipped.
