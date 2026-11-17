---
id: "0021"
title: "Grid: masonry layout"
repo: "slicejs-components"
status: blocked
area: components
priority: medium
created: 2026-11-16
updated: 2026-11-16
target: "next release"
owners: []
related:
  - "features/0017-grid-and-layout.md"
  - "src/Components/Visual/Grid/Grid.js"
  - "src/markdown/grid.md"
---

# Grid: masonry layout

## Summary
Add `layout: 'grid' | 'masonry'` to Grid. Masonry packs variable-height content into the shortest available column, using existing container breakpoints, automatic columns and gaps.

## Problem / motivation
Gallery and resource cards have different heights; regular rows leave gaps. A standalone Masonry would duplicate Grid's sizing, content ownership and responsive API.

## Proposed direction
Keep normal grid as default. Masonry uses equal-width columns, natural item heights, shortest-column placement, rowGap, stable DOM order and ResizeObserver for late images/content. Column spans are supported; area/row templates, rowSpan, dense and cell alignment are grid-only. Switching layout clears masonry positioning and restores ordinary grid styles.

### Accessibility and states
DOM, reading and tab order remain source order; masonry is not appropriate for sequential steps or dense comparable data. Empty, hidden/revealed, responsive, changed content, replaced/removed nodes and switching modes are covered. No motion or extra UI text.

## Alternatives
CSS columns change visual reading order and fragment cards; native CSS masonry is not a cross-browser baseline. No new registry component.

## Scope
Extend Grid only; no virtualization, image fetching, filtering or drag reordering. Preserve current props/methods.

## Compatibility and risk
Default unchanged. Measurement is batched; observers/frames cleaned on destroy. Node styles changed for masonry are restored when leaving the mode or transferring nodes.

## Validation
Pure packing tests; Grid browser scenarios for positions, responsive columns, resizing items, spans, mode switching and cleanup. Docs/generation/types/catalog, OG and build.

## Documentation impact
Extend grid.md with resource board examples, coverage and feature 0017 cross-reference.

## Open questions
None; masonry is a Grid mode by explicit user decision.

## Decision log
- 2026-11-16 — User requested masonry inside Grid alongside SplitPane. Moved to in-progress before coding.

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
