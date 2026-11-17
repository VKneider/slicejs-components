---
id: "0020"
title: "Component: SplitPane"
repo: "slicejs-components"
status: blocked
area: components
priority: medium
created: 2026-11-16
updated: 2026-11-16
target: "next release"
owners: []
related:
  - "src/Components/Visual/SplitPane/SplitPane.js"
  - "src/markdown/split-pane.md"
---

# Component: SplitPane

## Summary
Resizable application panels for an explorer/editor, comparison view or dashboard. Panels keep their live content while resizing or collapsing.

## Problem / motivation
Layout owns an application frame; Grid owns content placement. Neither provides user-controlled sizes or an accessible resize separator.

## Proposed direction
`panels: [{ id, label, content, minSize, maxSize, collapsible, collapsed }]`, `sizes: [25, 75]`, `orientation: 'horizontal' | 'vertical'`, `disabled`, `keyboardStep`, `texts`, `onChange(sizes, detail)`. Sizes and bounds are percentages of available panel space, excluding separators. Methods: `resize(index, percent)`, `collapse(id)`, `expand(id)`, `toggle(id)`.

States: empty, one or many panels, dragging, disabled, collapsed, constrained container. Stable IDs and live nodes preserve local state. ResizeObserver handles container changes; cleanup cancels frames and gestures.

### Accessibility
Focusable separators expose controls, orientation and value bounds. Arrows resize; Shift accelerates; Home/End use limits; Enter toggles a collapsible adjacent panel. Pointer capture supports mouse, pen and touch. Collapsed content is hidden/inert. Built-in names have en/es defaults. No animation is required; nested panes and RTL are supported.

## Alternatives
Extending Layout conflates app landmarks with resizable workspaces. External splitters add dependencies and separate tokens/lifecycle.

## Scope
Two or more panels, either orientation, percentage constraints, collapse/restore, pointer and keyboard interaction, programmatic changes. Persistence belongs to the app through sizes/onChange. No docking, floating windows or pixel-based bounds in v1.

## Compatibility and risk
Additive component. Infeasible bounds are relaxed proportionally to keep total space usable. DOM content follows the existing ownership/destroy contract. No external dependencies.

## Validation
Pure allocation/constraint unit tests; real-runtime browser smoke, setters, keyboard, pointer/touch, RTL, collapse, identity and teardown tests. Docs lint/generation, registry/types/catalog, OG and production build.

## Documentation impact
New split-pane.md with explorer/editor and vertical review scenarios; generated docs and registry; coverage and wanted index.

## Open questions
None for v1; pixel constraints and docking remain out of scope.

## Decision log
- 2026-11-16 — User requested implementation. Accepted the API and scope above; moved to in-progress before coding.

## Implementation and validation — 2026-11-16

Implemented the API and examples above. The new component/mode is registered and included in
regenerated Markdown pages, route/SEO output, agent catalog and TypeScript declarations.

- `pnpm test`: 189 tests pass, including 7 new allocator/packing tests (500 deterministic
  constraint cases and non-overlap checks for variable heights/spans).
- Additional integration: 7 checks using the actual Slice 4.3.0 Controller/build/props/destroy code
  with a DOM adapter pass, including every new documentation scenario. Geometry in these checks
  is supplied explicitly; they do not substitute for native browser layout/input verification.
- Markdown lint/generation, teardown and icon-name checks pass. Production build passes.
- The browser suite was attempted: Chromium is missing, and installation downloads a truncated ZIP.
  `pnpm exec playwright test SplitPane Grid --project=components --workers=1 --max-failures=1`
  stops at launch before executing component assertions. No visual/native-input pass is claimed.
- `test:gate` stops at `og:check`: the new SplitPane documentation route has no OG card.
  The existing Grid card is present; recapture it to show the new masonry example if desired.

### Release checks still required

```bash
pnpm exec playwright install chromium
pnpm exec playwright test SplitPane Grid --project=components --workers=2
pnpm run og:generate -- --only=/docs/layout/split-pane
pnpm run test:gate
```

Review desktop/narrow containers, touch/pen/pointer capture and RTL in a real browser. Only then
mark the feature done and move its wanted-index row to shipped. No compatibility alias or standalone
Masonry component is introduced. TransferList is deferred.

- 2026-11-16 — DockLayout follow-up (0022): added releasePanels and adoption ancestry updates so changing a split tree does not destroy transferred live groups. Existing replacement behavior is unchanged.
